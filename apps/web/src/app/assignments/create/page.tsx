"use client";

import { useEffect } from "react";
import { useAssignmentStore } from "@/stores/assignment-store";
import { StepIndicator } from "@/components/create/step-indicator";
import { StepBasicInfo } from "@/components/create/step-basic-info";

export default function CreateAssignmentPage() {
  const { currentStep, resetWizard } = useAssignmentStore();

  useEffect(() => {
    return () => {
      resetWizard();
    };
  }, [resetWizard]);

  return (
    <div className="min-h-[calc(100vh-80px)] w-full relative overflow-hidden bg-gradient-to-b from-[#EEEEEE] to-[#DADADA] rounded-2xl p-6 md:p-10 flex flex-col items-center justify-start gap-8 z-0">
      
      {/* Ellipse 16 - Background Glow Blur */}
      <div className="absolute w-[1113px] h-[428px] left-[calc(50%-1113px/2+163.5px)] top-[calc(50%-428px/2+311px)] bg-[#4c4c4c]/40 blur-[150px] rounded-full pointer-events-none z-0" />
      
      {/* Frame 1984077325 - Column Layout wrapper */}
      <div className="w-full max-w-[1103px] flex flex-col items-center gap-8 z-10 relative">
        
        {/* Frame 1984077332 - Top Header Container */}
        <div className="w-full flex items-center justify-start gap-4 p-2 bg-transparent">
          {/* Ellipse 10 - Green status dot */}
          <div className="w-3 h-3 rounded-full bg-[#4BC26D] border-4 border-[#4BC26D]/40 shadow-[0px_16px_48px_rgba(0,0,0,0.12),_0px_32px_48px_rgba(0,0,0,0.2)] animate-pulse flex-shrink-0" />
          
          {/* Header Title Block - Frame 1984077347 */}
          <div className="flex flex-col items-start gap-0.5">
            <h1 className="font-bricolage font-bold text-[20px] leading-[140%] tracking-[-0.04em] text-[#303030]">
              Create Assignment
            </h1>
            <span className="font-bricolage font-normal text-[14px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,0.55)]">
              Set up a new assignment for your students
            </span>
          </div>
        </div>

        {/* Separator / Progress Bar */}
        <StepIndicator currentStep={currentStep} />

        {/* Frame 1984077359 - The Main Details card */}
        <div className="w-full max-w-[810px] bg-white/50 border border-white/40 rounded-[32px] p-8 flex flex-col gap-8 shadow-xl transition-colors duration-300">
          
          {/* Card title and details */}
          <div className="flex flex-col items-start gap-0.5 pb-4 border-b border-neutral-100">
            <h2 className="font-bricolage font-bold text-[20px] leading-[140%] tracking-[-0.04em] text-[#303030]">
              Assignment Details
            </h2>
            <span className="font-bricolage font-normal text-[14px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,0.8)]">
              Basic information about your assignment
            </span>
          </div>

          {/* Render Unified Creation Component */}
          <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <StepBasicInfo />
          </div>

        </div>

      </div>

    </div>
  );
}
