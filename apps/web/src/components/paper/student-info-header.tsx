"use client";

import type { QuestionPaper } from "@vedaai/shared";

export function StudentInfoHeader({ paper }: { paper: QuestionPaper }) {
  // Extract grade and subject from the paper data
  const subject = paper.subject || "English";
  const grade = paper.grade || "5th";
  const totalMarks = paper.totalMarks || 20;
  const duration = paper.duration || "45 minutes";

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      
      {/* Central School Name & Subject Header */}
      <div className="w-full flex flex-col items-center justify-center text-center">
        <h1 
          className="text-[#303030] tracking-[-0.04em] uppercase"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "32px",
            lineHeight: "160%",
          }}
        >
          Delhi Public School, Sector-4, Bokaro
        </h1>
        <h2 
          className="text-[#303030] tracking-[-0.04em]"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "24px",
            lineHeight: "160%",
          }}
        >
          Subject: {subject}
        </h2>
        <h3 
          className="text-[#303030] tracking-[-0.04em]"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "20px",
            lineHeight: "160%",
          }}
        >
          Class: {grade}
        </h3>
      </div>

      {/* Allowed Time & Max Marks - Frame 1984077298 */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center border-t border-b border-neutral-200 py-3.5 gap-2.5">
        <span
          className="text-[#303030] tracking-[-0.04em]"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "18px",
            lineHeight: "160%",
          }}
        >
          Time Allowed: {duration}
        </span>
        <span
          className="text-[#303030] tracking-[-0.04em]"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "18px",
            lineHeight: "160%",
          }}
        >
          Maximum Marks: {totalMarks}
        </span>
      </div>

      {/* General Instructions message - Frame 1984077299 */}
      <div className="w-full flex justify-start">
        <span
          className="text-[#303030] tracking-[-0.04em] font-semibold"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "18px",
            lineHeight: "160%",
          }}
        >
          All questions are compulsory unless stated otherwise.
        </span>
      </div>

      {/* Student Fields Card - Frame 1984077300 */}
      <div className="flex flex-col gap-2 bg-[#F9F9F9] rounded-2xl p-6 border border-neutral-100 max-w-[400px] w-full self-start">
        <div
          className="text-[#303030] tracking-[-0.04em] flex justify-between"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "18px",
            lineHeight: "160%",
          }}
        >
          <span>Name:</span>
          <span className="text-neutral-300">______________________</span>
        </div>
        
        <div
          className="text-[#303030] tracking-[-0.04em] flex justify-between"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "18px",
            lineHeight: "160%",
          }}
        >
          <span>Roll Number:</span>
          <span className="text-neutral-300">________________</span>
        </div>

        <div
          className="text-[#303030] tracking-[-0.04em] flex justify-between"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "18px",
            lineHeight: "160%",
          }}
        >
          <span>Class: {grade}</span>
          <span>Section: <span className="text-neutral-300">__________</span></span>
        </div>
      </div>

    </div>
  );
}
