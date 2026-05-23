import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion {
  questionNumber: number;
  text: string;
  type: string;
  difficulty: string;
  marks: number;
  options?: string[];
  correctAnswer?: string;
}

export interface ISection {
  label: string;
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IQuestionPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  grade: string;
  totalMarks: number;
  duration?: string;
  generalInstructions?: string[];
  sections: ISection[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSubSchema = new Schema(
  {
    questionNumber: { type: Number, required: true },
    text: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["mcq", "short_answer", "long_answer", "true_false", "fill_in_blank"],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
    },
    marks: { type: Number, required: true },
    options: { type: [String] },
    correctAnswer: { type: String },
  },
  { _id: false }
);

const SectionSubSchema = new Schema(
  {
    label: { type: String, required: true },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [QuestionSubSchema], required: true },
  },
  { _id: false }
);

const QuestionPaperSchema = new Schema(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    duration: { type: String },
    generalInstructions: { type: [String] },
    sections: { type: [SectionSubSchema], required: true },
  },
  { timestamps: true }
);

QuestionPaperSchema.index({ assignmentId: 1 });

export const QuestionPaperModel = mongoose.model<IQuestionPaper>("QuestionPaper", QuestionPaperSchema);
