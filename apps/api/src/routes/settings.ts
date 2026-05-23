import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { WorkspaceSettingsModel } from "../models/workspace-settings.js";
import { validate } from "../middleware/validate.js";
import { env } from "../config/env.js";

const router = Router();

// ─── Schema ───────────────────────────────────────────────────────────────────

const UpdateSettingsSchema = z.object({
  teacherName: z.string().max(120).trim().optional(),
  schoolName: z.string().max(200).trim().optional(),
  defaultSubject: z.string().max(100).trim().optional(),
  openRouterApiKey: z.string().trim().optional(),
  defaultModel: z
    .enum([
      "minimax/minimax-m2.5",
      "openai/gpt-4o",
      "anthropic/claude-3.5-sonnet",
      "google/gemini-pro-1.5",
      "meta-llama/llama-3.1-70b-instruct",
    ])
    .optional(),
  emailDigests: z.boolean().optional(),
  generationAlerts: z.boolean().optional(),
  themeMode: z.enum(["light", "dark", "system"]).optional(),
});

// ─── GET /api/settings ────────────────────────────────────────────────────────
// Returns the singleton settings document, auto-creating defaults if none exist.
// IMPORTANT: The API key is masked in the response — only the last 6 characters
// are sent to the client, so the raw key never travels over the wire unnecessarily.

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let settings: any = await WorkspaceSettingsModel.findOne({ singletonKey: "workspace" }).lean();

    if (!settings) {
      // Auto-initialise with defaults on first visit
      const doc = await WorkspaceSettingsModel.create({ singletonKey: "workspace" });
      settings = doc.toObject();
    }

    // Mask the API key: send only last 6 chars so frontend can show "••••••...xxxx"
    // Fallback to server env API key if user has not stored a custom one in MongoDB
    const activeApiKey = settings.openRouterApiKey || env.OPENROUTER_API_KEY || "";
    const maskedKey =
      activeApiKey && activeApiKey.length > 6
        ? activeApiKey.slice(-6)
        : activeApiKey;

    res.json({
      success: true,
      data: {
        teacherName: settings.teacherName,
        schoolName: settings.schoolName,
        defaultSubject: settings.defaultSubject,
        openRouterApiKeyMasked: maskedKey,
        hasApiKey: Boolean(activeApiKey),
        defaultModel: settings.defaultModel,
        emailDigests: settings.emailDigests,
        generationAlerts: settings.generationAlerts,
        themeMode: settings.themeMode,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/settings ────────────────────────────────────────────────────────
// Upserts all provided fields. If openRouterApiKey is sent and it looks like a
// masked value (≤6 chars), we skip updating it to avoid overwriting the real key.

router.put(
  "/",
  validate(UpdateSettingsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updates = req.body as z.infer<typeof UpdateSettingsSchema>;

      // Build the update object, skipping the API key if the user didn't change it
      // (frontend sends the masked value when unchanged; a real key is much longer)
      const setFields: Record<string, unknown> = {};

      if (updates.teacherName !== undefined) setFields.teacherName = updates.teacherName;
      if (updates.schoolName !== undefined) setFields.schoolName = updates.schoolName;
      if (updates.defaultSubject !== undefined) setFields.defaultSubject = updates.defaultSubject;
      if (updates.defaultModel !== undefined) setFields.defaultModel = updates.defaultModel;
      if (updates.emailDigests !== undefined) setFields.emailDigests = updates.emailDigests;
      if (updates.generationAlerts !== undefined) setFields.generationAlerts = updates.generationAlerts;
      if (updates.themeMode !== undefined) setFields.themeMode = updates.themeMode;

      // Only overwrite the stored key if the new value looks like a real key (>6 chars)
      if (updates.openRouterApiKey && updates.openRouterApiKey.length > 6) {
        setFields.openRouterApiKey = updates.openRouterApiKey;
      }

      const updated: any = await WorkspaceSettingsModel.findOneAndUpdate(
        { singletonKey: "workspace" },
        { $set: setFields },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      ).lean();

      const activeApiKey = updated!.openRouterApiKey || env.OPENROUTER_API_KEY || "";
      const maskedKey =
        activeApiKey && activeApiKey.length > 6
          ? activeApiKey.slice(-6)
          : activeApiKey;

      res.json({
        success: true,
        data: {
          teacherName: updated!.teacherName,
          schoolName: updated!.schoolName,
          defaultSubject: updated!.defaultSubject,
          openRouterApiKeyMasked: maskedKey,
          hasApiKey: Boolean(activeApiKey),
          defaultModel: updated!.defaultModel,
          emailDigests: updated!.emailDigests,
          generationAlerts: updated!.generationAlerts,
          themeMode: updated!.themeMode,
          updatedAt: updated!.updatedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
