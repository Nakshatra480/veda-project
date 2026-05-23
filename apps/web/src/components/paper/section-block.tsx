"use client";

import type { Section } from "@vedaai/shared";
import { QuestionRow } from "@/components/paper/question-row";

export function SectionBlock({
  section,
  isLast,
}: {
  section: Section;
  isLast: boolean;
}) {
  return (
    <div className={`w-full flex flex-col gap-5 ${!isLast ? "border-b border-neutral-100 pb-8" : ""}`}>
      
      {/* Section Header Title & Subtitle */}
      <div className="w-full flex flex-col items-center text-center gap-1">
        {/* Section Label (e.g. Section A) - Component style */}
        <h2 
          className="text-[#303030] tracking-[-0.04em]"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "160%",
          }}
        >
          {section.label || "Section A"}
        </h2>

        {/* Section Title & Instruction Combined - Component style */}
        <p 
          className="text-[#303030] tracking-[-0.04em]"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "18px",
            lineHeight: "160%",
          }}
        >
          {section.title}{section.instruction ? ` — ${section.instruction}` : ""}
        </p>
      </div>

      {/* Section Questions Area */}
      <div className="flex flex-col gap-6 w-full">
        {section.questions.map((question) => (
          <QuestionRow key={question.questionNumber} question={question} />
        ))}
      </div>

    </div>
  );
}
