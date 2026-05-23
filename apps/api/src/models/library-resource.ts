import mongoose, { Schema, Document } from "mongoose";

export type ResourceType = "document" | "video" | "link" | "book";

export interface ILibraryResource extends Document {
  title: string;
  type: ResourceType;
  subject: string;
  grade: string;
  description: string;
  url?: string;
  size?: string;
  duration?: string;
  fileKey?: string;
  fileName?: string;
  mimeType?: string;
  tags: string[];
  starred: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LibraryResourceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    type: {
      type: String,
      required: true,
      enum: ["document", "video", "link", "book"],
    },
    subject: { type: String, required: true, trim: true, maxlength: 100 },
    grade: { type: String, required: true, trim: true, maxlength: 20 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    url: { type: String, trim: true },
    size: { type: String, trim: true },
    duration: { type: String, trim: true },
    fileKey: { type: String, trim: true },
    fileName: { type: String, trim: true },
    mimeType: { type: String, trim: true },
    tags: { type: [String], default: [] },
    starred: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LibraryResourceSchema.index({ title: "text", subject: "text", tags: "text" });

export const LibraryResourceModel = mongoose.model<ILibraryResource>(
  "LibraryResource",
  LibraryResourceSchema
);
