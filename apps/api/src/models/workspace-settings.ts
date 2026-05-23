import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspaceSettings extends Document {
  // Using a fixed singleton key so there's always exactly one settings doc
  singletonKey: "workspace";

  // Teacher profile
  teacherName: string;
  schoolName: string;
  defaultSubject: string;

  // API & Engine
  openRouterApiKey: string;   // stored as-is (server environment is trusted)
  defaultModel: string;

  // Notifications
  emailDigests: boolean;
  generationAlerts: boolean;

  // UI
  themeMode: "light" | "dark" | "system";

  updatedAt: Date;
  createdAt: Date;
}

const WorkspaceSettingsSchema = new Schema(
  {
    singletonKey: {
      type: String,
      default: "workspace",
      enum: ["workspace"],
      unique: true,
    },

    teacherName: { type: String, default: "", trim: true, maxlength: 120 },
    schoolName: { type: String, default: "", trim: true, maxlength: 200 },
    defaultSubject: { type: String, default: "", trim: true, maxlength: 100 },

    openRouterApiKey: { type: String, default: "", trim: true },
    defaultModel: {
      type: String,
      default: "minimax/minimax-m2.5",
      enum: [
        "minimax/minimax-m2.5",
        "openai/gpt-4o",
        "anthropic/claude-3.5-sonnet",
        "google/gemini-pro-1.5",
        "meta-llama/llama-3.1-70b-instruct",
      ],
    },

    emailDigests: { type: Boolean, default: true },
    generationAlerts: { type: Boolean, default: true },

    themeMode: {
      type: String,
      default: "light",
      enum: ["light", "dark", "system"],
    },
  },
  { timestamps: true }
);

export const WorkspaceSettingsModel = mongoose.model<IWorkspaceSettings>(
  "WorkspaceSettings",
  WorkspaceSettingsSchema
);
