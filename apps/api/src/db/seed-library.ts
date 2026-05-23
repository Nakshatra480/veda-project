import { LibraryResourceModel } from "../models/library-resource.js";

const MOCK_RESOURCES = [
  {
    title: "NCERT Science Grade 8 — Chapter 14: Chemical Effects of Electric Current",
    type: "document",
    subject: "Science",
    grade: "8th",
    description: "Official NCERT textbook chapter covering electrolysis, electroplating, and chemical reactions with electric current.",
    size: "2.4 MB",
    starred: true,
    tags: ["NCERT", "Electrolysis", "Chemistry"],
  },
  {
    title: "Introduction to Photosynthesis — Video Lecture",
    type: "video",
    subject: "Biology",
    grade: "7th",
    description: "Comprehensive 45-minute video explaining the light and dark reactions of photosynthesis with animations.",
    duration: "45 min",
    starred: false,
    tags: ["Biology", "Chloroplast", "Light Reaction"],
  },
  {
    title: "Khan Academy — Fractions & Decimals",
    type: "link",
    subject: "Mathematics",
    grade: "6th",
    description: "A curated set of exercises and video lessons on converting and operating with fractions and decimals.",
    url: "https://khanacademy.org",
    starred: true,
    tags: ["Fractions", "Decimals", "Khan Academy"],
  },
  {
    title: "Oxford Progressive English Reader — Level 3",
    type: "book",
    subject: "English",
    grade: "5th",
    description: "Graded reader with simplified classic stories to develop reading comprehension and vocabulary.",
    size: "5.1 MB",
    starred: false,
    tags: ["Reading", "Comprehension", "Oxford"],
  },
  {
    title: "CBSE Sample Paper 2024-25 — Mathematics Grade 10",
    type: "document",
    subject: "Mathematics",
    grade: "10th",
    description: "Official CBSE sample question paper with marking scheme for the 2024-25 academic session.",
    size: "1.8 MB",
    starred: true,
    tags: ["CBSE", "Sample Paper", "Board Exam"],
  },
  {
    title: "History of the Mughal Empire — Documentary",
    type: "video",
    subject: "History",
    grade: "7th",
    description: "An educational documentary tracing the rise and fall of the Mughal Empire in the Indian subcontinent.",
    duration: "32 min",
    starred: false,
    tags: ["Mughals", "History", "CBSE"],
  },
];

export async function seedLibraryIfEmpty(): Promise<void> {
  try {
    const count = await LibraryResourceModel.countDocuments();
    if (count === 0) {
      console.log("Library resources collection is empty. Seeding mock resources...");
      await LibraryResourceModel.insertMany(MOCK_RESOURCES);
      console.log("Successfully seeded library resources.");
    }
  } catch (error) {
    console.error("Error seeding library resources:", error);
  }
}
