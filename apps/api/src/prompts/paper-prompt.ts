import { type IAssignment } from "../models/assignment.js";
import { QUESTION_TYPE_LABELS } from "@vedaai/shared";

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

/** Maximum characters of source material to include in the prompt.
 *  Exceeding this can push the request past the model's context window. */
const MAX_SOURCE_CONTENT_CHARS = 8_000;

export function buildPaperPrompt(assignment: IAssignment): ChatMessage[] {
  const configLines = assignment.questionConfig
    .map((qc) => {
      const typeName = QUESTION_TYPE_LABELS[qc.type] || qc.type;
      const difficultyStr = qc.difficulty ? ` (${qc.difficulty} difficulty)` : "";
      return `- ${qc.count} ${typeName} questions, ${qc.marksPerQuestion} marks each${difficultyStr}`;
    })
    .join("\n");

  const totalMarks = assignment.questionConfig.reduce(
    (sum, qc) => sum + qc.count * qc.marksPerQuestion,
    0
  );

  const systemMessage = `You are an expert exam paper generator for educational institutions. You must generate a structured exam/question paper in strict JSON format.

The JSON response MUST have exactly this structure:
{
  "title": "string - the exam paper title",
  "subject": "string - the subject name",
  "grade": "string - the grade/class",
  "totalMarks": number,
  "duration": "string - suggested duration e.g. '2 Hours'",
  "generalInstructions": ["array of general instruction strings for students"],
  "sections": [
    {
      "label": "string - section label e.g. 'Section A'",
      "title": "string - section title e.g. 'Multiple Choice Questions'",
      "instruction": "string - instruction for this section",
      "questions": [
        {
          "questionNumber": number,
          "text": "string - the question text",
          "type": "one of: mcq, short_answer, long_answer, true_false, fill_in_blank",
          "difficulty": "one of: easy, medium, hard",
          "marks": number,
          "options": ["array of option strings - REQUIRED for mcq type, include 4 options"],
          "correctAnswer": "string - the correct answer"
        }
      ]
    }
  ]
}

Rules:
- Group questions into logical sections by question type.
- Each section must have a descriptive label like "Section A", "Section B", etc.
- Question numbers must be sequential across all sections starting from 1.
- For MCQ questions, always provide exactly 4 options.
- For true_false questions, options should be ["True", "False"].
- The "type" field must be exactly one of: "mcq", "short_answer", "long_answer", "true_false", "fill_in_blank".
- The "difficulty" field must be exactly one of: "easy", "medium", "hard".
- Always provide a correctAnswer for every question.
- Respond ONLY with valid JSON. No markdown, no explanations, no text outside the JSON.`;

  let userContent = `Generate an exam paper with the following specifications:

Subject: ${assignment.subject}
Grade/Class: ${assignment.grade}
Title: ${assignment.title}
Total Marks: ${totalMarks}

Question Configuration:
${configLines}`;

  if (assignment.instructions) {
    userContent += `\n\nTeacher's Instructions:\n${assignment.instructions}`;
  }

  if (assignment.sourceFileContent) {
    // Sanitise and truncate the source material to avoid context-window overflow.
    // Strip null bytes and other non-printable characters, then cap the length.
    const sanitised = assignment.sourceFileContent
      .replace(/\x00/g, "") // remove null bytes
      .trim()
      .slice(0, MAX_SOURCE_CONTENT_CHARS);

    const truncated = sanitised.length < assignment.sourceFileContent.trim().length;
    userContent += `\n\nSource Material/Syllabus Content${truncated ? " (truncated to 8000 chars)" : ""}:\n${sanitised}`;
  }

  userContent += `\n\nGenerate the complete exam paper following the exact JSON structure specified. Ensure all questions are relevant, grade-appropriate, and well-crafted.`;

  return [
    { role: "system", content: systemMessage },
    { role: "user", content: userContent },
  ];
}
