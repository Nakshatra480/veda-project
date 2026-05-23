"use client";

import type { Question } from "@vedaai/shared";

export function QuestionRow({ question }: { question: Question }) {
  const optionLabels = ["a", "b", "c", "d", "e", "f", "g", "h"];

  // Capitalize difficulty level for inline display e.g. [Easy]
  const difficultyLabel = question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1);

  return (
    <div className="w-full select-none">
      
      {/* Question Item Container */}
      <div 
        className="w-full text-[#303030] tracking-[-0.04em] flex flex-col items-start gap-1"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: "16px",
          lineHeight: "240%", // exact line height from CSS: line-height: 240%
        }}
      >
        <div>
          {/* 1. [Easy] Question Text [2 Marks] */}
          <span className="font-semibold mr-1.5">{question.questionNumber}.</span>
          <span className="font-semibold text-neutral-500 mr-1.5">[{difficultyLabel}]</span>
          <span>{question.text}</span>
          <span className="font-semibold text-neutral-500 ml-1.5">[{question.marks} {question.marks === 1 ? "Mark" : "Marks"}]</span>
        </div>

        {/* Options for MCQ */}
        {question.type === "mcq" && question.options && (
          <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 w-full mt-2">
            {question.options.map((option, index) => (
              <p key={index} className="text-[#303030]/80">
                <span className="font-semibold text-neutral-400 mr-1">
                  ({optionLabels[index]})
                </span>{" "}
                {option}
              </p>
            ))}
          </div>
        )}

        {/* Blank space line for Fill in Blank */}
        {question.type === "fill_in_blank" && (
          <div className="pl-6 w-full mt-3">
            <div className="w-48 border-b-2 border-dashed border-neutral-300 h-1" />
          </div>
        )}

        {/* Checkboxes for True/False */}
        {question.type === "true_false" && (
          <div className="pl-6 flex items-center gap-6 text-sm text-neutral-500 mt-2 select-none">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded border-2 border-neutral-300 inline-block bg-white" />
              True
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded border-2 border-neutral-300 inline-block bg-white" />
              False
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
