export const ASSIGNMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  DONE: "done",
  FAILED: "failed",
} as const;

export const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;

export const QUESTION_TYPES = {
  MCQ: "mcq",
  SHORT_ANSWER: "short_answer",
  LONG_ANSWER: "long_answer",
  TRUE_FALSE: "true_false",
  FILL_IN_BLANK: "fill_in_blank",
} as const;

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  mcq: "Multiple Choice",
  short_answer: "Short Answer",
  long_answer: "Long Answer",
  true_false: "True / False",
  fill_in_blank: "Fill in the Blank",
};

export const SOCKET_EVENTS = {
  ASSIGNMENT_CREATED: "assignment:created",
  GENERATION_STARTED: "generation:started",
  GENERATION_PROGRESS: "generation:progress",
  GENERATION_COMPLETED: "generation:completed",
  GENERATION_FAILED: "generation:failed",
  PDF_READY: "pdf:ready",
  JOIN_ASSIGNMENT: "join:assignment",
} as const;

export const GRADES = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
] as const;

export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "Computer Science",
  "Economics",
  "Political Science",
  "Hindi",
  "Sanskrit",
  "Environmental Science",
  "General Knowledge",
] as const;
