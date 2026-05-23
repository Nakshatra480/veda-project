import { Worker, Job } from "bullmq";
import { Server as SocketIOServer } from "socket.io";
import { SOCKET_EVENTS, ASSIGNMENT_STATUS } from "@vedaai/shared";
import { redisConnection } from "./connection.js";
import { AssignmentModel } from "../models/assignment.js";
import { QuestionPaperModel } from "../models/question-paper.js";
import { buildPaperPrompt } from "../prompts/paper-prompt.js";
import { callOpenRouter } from "../services/openrouter.js";
import { parsePaperResponse } from "../parsers/paper-parser.js";
import { emitToAssignment } from "../socket/index.js";
import type { GeneratePaperJobData } from "./generate-paper.queue.js";

const MAX_PARSE_RETRIES = 1; // Only 1 retry — keeps total runtime well within the job timeout

async function processJob(job: Job<GeneratePaperJobData>, io: SocketIOServer): Promise<void> {
  const { assignmentId } = job.data;

  const assignment = await AssignmentModel.findById(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment ${assignmentId} not found`);
  }

  let timeoutId: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Job execution timed out after 480 seconds"));
    }, 480_000);

  });

  const executionPromise = (async () => {
    await AssignmentModel.findByIdAndUpdate(assignmentId, {
      status: ASSIGNMENT_STATUS.PROCESSING,
    });
    emitToAssignment(io, assignmentId, SOCKET_EVENTS.GENERATION_STARTED, {
      assignmentId,
      status: ASSIGNMENT_STATUS.PROCESSING,
    });

    emitToAssignment(io, assignmentId, SOCKET_EVENTS.GENERATION_PROGRESS, {
      assignmentId,
      stage: "Building prompt",
      progress: 10,
    });
    const messages: any[] = buildPaperPrompt(assignment);

    emitToAssignment(io, assignmentId, SOCKET_EVENTS.GENERATION_PROGRESS, {
      assignmentId,
      stage: "Calling AI model",
      progress: 30,
    });

    let parsedResponse;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_PARSE_RETRIES; attempt++) {
      let rawResponse = "";
      try {
        emitToAssignment(io, assignmentId, SOCKET_EVENTS.GENERATION_PROGRESS, {
          assignmentId,
          stage: attempt === 0 ? "Generating questions" : `Retrying generation (attempt ${attempt + 1})`,
          progress: 40 + attempt * 15,
        });

        rawResponse = await callOpenRouter(messages);

        emitToAssignment(io, assignmentId, SOCKET_EVENTS.GENERATION_PROGRESS, {
          assignmentId,
          stage: "Parsing response",
          progress: 70 + attempt * 10,
        });

        parsedResponse = parsePaperResponse(rawResponse);
        lastError = null;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt === MAX_PARSE_RETRIES) {
          break;
        }
        if (rawResponse) {
          messages.push({ role: "assistant", content: rawResponse });
        }
        messages.push({
          role: "user",
          content: `Your previous response was not a valid JSON or did not match the schema. Error: ${lastError.message}. Please generate the complete exam paper following the exact JSON structure specified. Do NOT add any extra text or conversational filler, just valid JSON.`
        });
      }
    }

    if (!parsedResponse || lastError) {
      throw lastError || new Error("Failed to generate paper after retries");
    }

    emitToAssignment(io, assignmentId, SOCKET_EVENTS.GENERATION_PROGRESS, {
      assignmentId,
      stage: "Saving question paper",
      progress: 90,
    });

    // Override totalMarks with the actual sum derived from the assignment's questionConfig
    const actualTotalMarks = assignment.questionConfig.reduce(
      (sum, qc) => sum + qc.count * qc.marksPerQuestion,
      0
    );

    const questionPaper = await QuestionPaperModel.create({
      assignmentId,
      title: parsedResponse.title,
      subject: parsedResponse.subject,
      grade: parsedResponse.grade,
      totalMarks: actualTotalMarks,
      duration: parsedResponse.duration,
      generalInstructions: parsedResponse.generalInstructions,
      sections: parsedResponse.sections,
    });

    await AssignmentModel.findByIdAndUpdate(assignmentId, {
      status: ASSIGNMENT_STATUS.DONE,
      generatedPaperId: questionPaper._id,
      errorMessage: undefined,
    });

    emitToAssignment(io, assignmentId, SOCKET_EVENTS.GENERATION_COMPLETED, {
      assignmentId,
      status: ASSIGNMENT_STATUS.DONE,
      paperId: questionPaper._id,
    });
  })();

  try {
    await Promise.race([executionPromise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export function initWorker(io: SocketIOServer): Worker<GeneratePaperJobData> {
  const worker = new Worker<GeneratePaperJobData>(
    "generate-paper",
    async (job) => {
      await processJob(job, io);
    },
    {
      connection: redisConnection,
      concurrency: 3,
    }
  );

  worker.on("failed", async (job, err) => {
    if (!job) return;

    const { assignmentId } = job.data;
    const errorMessage = err.message || "Unknown error occurred";

    await AssignmentModel.findByIdAndUpdate(assignmentId, {
      status: ASSIGNMENT_STATUS.FAILED,
      errorMessage,
    });

    emitToAssignment(io, assignmentId, SOCKET_EVENTS.GENERATION_FAILED, {
      assignmentId,
      status: ASSIGNMENT_STATUS.FAILED,
      error: errorMessage,
    });
  });

  console.log("BullMQ worker initialized for generate-paper queue");

  return worker;
}
