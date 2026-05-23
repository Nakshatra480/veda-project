import mongoose, { Schema, Document } from "mongoose";

export interface IClassGroup extends Document {
  name: string;
  subject: string;
  grade: string;
  section: string;
  students: string[];
  assignmentsCompleted: number;
  averageScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const ClassGroupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true, maxlength: 5 },
    students: { type: [String], default: [] },
    assignmentsCompleted: { type: Number, default: 0, min: 0 },
    averageScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

// Text index for search by name or subject
ClassGroupSchema.index({ name: "text", subject: "text" });
// Compound uniqueness: same subject + grade + section should not be duplicated
ClassGroupSchema.index({ subject: 1, grade: 1, section: 1 }, { unique: true });

export const ClassGroupModel = mongoose.model<IClassGroup>("ClassGroup", ClassGroupSchema);
