"use client";

import type { QuestionPaper } from "@vedaai/shared";
import { StudentInfoHeader } from "@/components/paper/student-info-header";
import { SectionBlock } from "@/components/paper/section-block";

export function PaperView({ paper }: { paper: QuestionPaper }) {
  // Collect all questions sequentially to generate the Answer Key
  const allQuestions = paper.sections.reduce((acc, section) => {
    return [...acc, ...section.questions];
  }, [] as any[]);

  return (
    <div className="w-full bg-white rounded-[32px] p-8 md:p-12 flex flex-col gap-6 shadow-[0px_4px_30px_rgba(0,0,0,0.03)] overflow-hidden print:shadow-none print:p-0">
      
      {/* Student Info & General Instructions */}
      <StudentInfoHeader paper={paper} />

      {/* Separator Line */}
      <div className="w-full h-px bg-neutral-200 my-4" />

      {/* Sections and Questions */}
      <div className="flex flex-col gap-8 w-full">
        {paper.sections.map((section, index) => (
          <SectionBlock
            key={section.label || index}
            section={section}
            isLast={index === paper.sections.length - 1}
          />
        ))}
      </div>

      {/* End of Question Paper Line */}
      <div className="w-full text-center border-t border-neutral-200 pt-6 mt-8 flex flex-col items-center justify-center gap-6 select-none">
        <span 
          className="text-[#303030] tracking-[-0.04em]"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "18px",
          }}
        >
          End of Question Paper
        </span>

        {/* Separator Line */}
        <div className="w-full h-px bg-neutral-200" />

        {/* Answer Key Heading */}
        <div className="w-full text-left">
          <h2 
            className="text-[#303030] tracking-[-0.04em] uppercase"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "24px",
              lineHeight: "160%",
            }}
          >
            Answer Key
          </h2>
        </div>

        {/* Answer Key List */}
        <div className="w-full text-left flex flex-col gap-2">
          {allQuestions.map((q, idx) => (
            <div 
              key={q.questionNumber || idx}
              className="text-[#303030] tracking-[-0.04em]"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: "16px",
                lineHeight: "240%", // exact line height from CSS: line-height: 240%
              }}
            >
              <span className="font-semibold mr-1.5">{q.questionNumber || idx + 1}.</span>
              <span>{q.correctAnswer}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
