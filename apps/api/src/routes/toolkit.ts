import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { callOpenRouterText } from "../services/openrouter.js";
import { validate } from "../middleware/validate.js";

const router = Router();

// ─── Input Schemas ──────────────────────────────────────────────────────────

const LessonPlanSchema = z.object({
  topic: z.string().min(2).max(200),
  grade: z.string().min(1).max(20),
  duration: z.string().min(2).max(30),
});

const RubricSchema = z.object({
  topic: z.string().min(2).max(200),
  levels: z.enum(["3", "4"]).default("3"),
});

const EnhanceSchema = z.object({
  question: z.string().min(5).max(1000),
});

// ─── Lesson Planner ─────────────────────────────────────────────────────────

router.post(
  "/lesson",
  validate(LessonPlanSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { topic, grade, duration } = req.body as z.infer<typeof LessonPlanSchema>;

      const messages = [
        {
          role: "system" as const,
          content: `You are an expert educational curriculum designer and master teacher. You create detailed, structured lesson plans that are pedagogically sound and engaging. Format your output in clean markdown with clear sections, bullet points, and emoji icons to make it visually readable. Tailor all content to the specified grade level.`,
        },
        {
          role: "user" as const,
          content: `Create a comprehensive lesson plan for the following:

**Topic:** ${topic}
**Grade Level:** ${grade}
**Duration:** ${duration}

Your lesson plan MUST include all of these sections in markdown format:
1. ## Learning Objectives (3-4 measurable bullet points using Bloom's verbs)
2. ## Materials & Resources needed
3. ## Timeline & Procedure (broken into warm-up, direct instruction, guided practice, independent work, and closure/exit ticket with minutes)
4. ## Formative Assessment strategies
5. ## Differentiation Strategies (for advanced students and those needing support)
6. ## Homework / Extension Activity (optional but recommended)
7. ## 💡 AI Teaching Tips (2-3 creative suggestions to make this lesson more engaging)

Make the lesson engaging, age-appropriate for ${grade} grade students, and practical to implement.`,
        },
      ];

      const output = await callOpenRouterText(messages);

      res.json({ success: true, data: { output } });
    } catch (err) {
      next(err);
    }
  }
);

// ─── Smart Rubric Builder ────────────────────────────────────────────────────

router.post(
  "/rubric",
  validate(RubricSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { topic, levels } = req.body as z.infer<typeof RubricSchema>;

      const levelCount = parseInt(levels, 10);
      const levelLabels =
        levelCount === 3
          ? "Novice (1-2 pts), Proficient (3-4 pts), Expert (5 pts)"
          : "Below Basic (1 pt), Basic (2-3 pts), Proficient (4 pts), Advanced (5 pts)";

      const messages = [
        {
          role: "system" as const,
          content: `You are an expert educational assessment designer specializing in creating detailed, clear, and fair evaluation rubrics. You understand standards-based grading, Bloom's Taxonomy, and best practices in formative and summative assessment. Format your output in clean markdown with properly structured tables.`,
        },
        {
          role: "user" as const,
          content: `Create a comprehensive evaluation rubric for the following assessment:

**Assessment Topic:** ${topic}
**Grading Levels:** ${levelCount} levels (${levelLabels})

Your rubric MUST include:
1. A brief ## Rubric Overview paragraph explaining the assessment purpose
2. ## Grading Scale explaining what each level means
3. A detailed rubric table using markdown format with these columns:
   - Criteria (left-aligned, bold)
   - One column per grading level with specific, observable behavioral descriptors
4. ## Scoring Guide — explain how to calculate final scores
5. ## Teacher Notes — 2-3 tips for using this rubric fairly and consistently

Create 4-5 meaningful evaluation criteria based on the topic. Each cell must have specific, observable behaviors (not vague language like "does well"). Use concrete, actionable descriptors so students know exactly what is expected.`,
        },
      ];

      const output = await callOpenRouterText(messages);

      res.json({ success: true, data: { output } });
    } catch (err) {
      next(err);
    }
  }
);

// ─── Bloom's Taxonomy Enhancer ───────────────────────────────────────────────

router.post(
  "/enhance",
  validate(EnhanceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question } = req.body as z.infer<typeof EnhanceSchema>;

      const messages = [
        {
          role: "system" as const,
          content: `You are an expert educational psychologist and assessment specialist with deep expertise in Bloom's Taxonomy and higher-order thinking skills. You transform basic recall questions into rich, multi-level questions that assess different cognitive depths. You understand NGSS, Common Core, and other educational standards. Format your output in clean markdown.`,
        },
        {
          role: "user" as const,
          content: `Transform this basic question into a set of Bloom's Taxonomy questions at three cognitive levels:

**Original Question:** "${question}"

Produce the following in markdown format:
1. ## Original Question Analysis — briefly explain the cognitive level of the original question and why it needs enhancement

2. ## 🟢 Level 1: Remember & Understand (Lower Order Thinking)
   - Enhanced question targeting recall/comprehension
   - > Show the enhanced question as a blockquote
   - Bloom's verbs used: (list them)
   - Why this works: (1-2 sentences)
   - Standards alignment hint

3. ## 🟡 Level 2: Apply & Analyze (Middle Order Thinking)
   - Enhanced question targeting application/analysis in a real-world or experimental context
   - > Show the enhanced question as a blockquote
   - Bloom's verbs used: (list them)
   - Why this works: (1-2 sentences)
   - Standards alignment hint

4. ## 🔴 Level 3: Evaluate & Create (Higher Order Thinking)
   - Enhanced question requiring synthesis, design, evaluation, or creative thinking
   - > Show the enhanced question as a blockquote
   - Bloom's verbs used: (list them)
   - Why this works: (1-2 sentences)
   - Standards alignment hint

5. ## 💡 Assessment Tips — 2 suggestions for how to use these questions together effectively

Make every enhanced question specific, rigorous, and meaningful. Avoid vague language.`,
        },
      ];

      const output = await callOpenRouterText(messages);

      res.json({ success: true, data: { output } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
