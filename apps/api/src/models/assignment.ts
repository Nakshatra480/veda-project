import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  title: string;
  subject: string;
  grade: string;
  dueDate?: Date;
  instructions?: string;
  questionConfig: Array<{
    type: string;
    count: number;
    marksPerQuestion: number;
    difficulty?: string;
  }>;
  sourceFileName?: string;
  sourceFileContent?: string;
  status: "pending" | "processing" | "done" | "failed";
  generatedPaperId?: mongoose.Types.ObjectId;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionConfigSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["mcq", "short_answer", "long_answer", "true_false", "fill_in_blank"],
    },
    count: { type: Number, required: true },
    marksPerQuestion: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
    },
  },
  { _id: false }
);

const AssignmentSchema = new Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    dueDate: { type: Date },
    instructions: { type: String },
    questionConfig: { type: [QuestionConfigSchema], required: true },
    sourceFileName: { type: String },
    sourceFileContent: { type: String },
    status: {
      type: String,
      enum: ["pending", "processing", "done", "failed"],
      default: "pending",
    },
    generatedPaperId: { type: Schema.Types.ObjectId, ref: "QuestionPaper" },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

AssignmentSchema.index({ title: "text", subject: "text" });

export const AssignmentModel = mongoose.model<IAssignment>("Assignment", AssignmentSchema);
