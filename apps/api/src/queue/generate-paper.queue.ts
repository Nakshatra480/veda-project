import { Queue } from "bullmq";
import { redisConnection } from "./connection.js";

export interface GeneratePaperJobData {
  assignmentId: string;
}

export const generatePaperQueue = new Queue<GeneratePaperJobData>("generate-paper", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});
