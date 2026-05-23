"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    <div className="w-full">
      {/* ── Desktop Viewport Layout ── */}
      <div className="hidden md:flex min-h-[calc(100vh-80px)] w-full relative overflow-hidden bg-gradient-to-b from-[#EEEEEE] to-[#DADADA] rounded-2xl p-10 flex-col items-center justify-start gap-8 z-0">
        {/* Ellipse 16 - Background Glow Blur */}
        <div className="absolute w-[1113px] h-[428px] left-[calc(50%-1113px/2+163.5px)] top-[calc(50%-428px/2+311px)] bg-[#4c4c4c]/40 blur-[150px] rounded-full pointer-events-none z-0" />
        
        {/* Content Wrapper */}
        <div className="w-full max-w-[1103px] flex flex-col items-center gap-8 z-10 relative">
          
          {/* Header Title Block */}
          <div className="w-full flex items-center justify-start gap-4 p-2 bg-transparent">
            {/* Ellipse 10 - Green status dot */}
            <div className="w-3 h-3 rounded-full bg-[#4BC26D] border-4 border-[#4BC26D]/40 shadow-[0px_16px_48px_rgba(0,0,0,0.12),_0px_32px_48px_rgba(0,0,0,0.2)] animate-pulse flex-shrink-0" />
            
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

          {/* Main Details Card */}
          <div className="w-full max-w-[810px] bg-white/50 border border-white/40 rounded-[32px] p-8 flex flex-col gap-8 shadow-xl">
            
            {/* Card title and details */}
            <div className="flex flex-col items-start gap-0.5 pb-4 border-b border-neutral-100">
              <h2 className="font-bricolage font-bold text-[20px] leading-[140%] tracking-[-0.04em] text-[#303030]">
                Assignment Details
              </h2>
              <span className="font-bricolage font-normal text-[14px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,0.8)]">
                Basic information about your assignment
              </span>
            </div>

            {/* Form Component */}
            <div className="w-full">
              <StepBasicInfo />
            </div>

          </div>
        </div>
      </div>

      {/* ── Mobile Viewport Layout (Figma Pixel-Perfect) ── */}
      <div 
        className="flex md:hidden flex-col items-center gap-6 w-full max-w-[349px] mx-auto pb-48 select-none relative"
      >
        
        {/* Back and Title Header Row (Frame 1984077583) */}
        <div className="flex items-center justify-between h-[48px] w-full mt-2">
          {/* Back button circular wrapper - Frame 1984077380 */}
          <Link 
            href="/assignments" 
            className="w-[48px] h-[48px] bg-white/25 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md active:scale-95 transition-all shadow-sm"
            style={{ borderRadius: "100px" }}
          >
            <ArrowLeft className="w-5 h-5 text-[#303030]" strokeWidth={2.5} />
          </Link>
          
          {/* Create Assignment Label - Frame 1618872418 */}
          <div className="flex items-center justify-center h-[22px] flex-1">
            <span
              className="text-[#303030] font-bold text-[16px] leading-[140%] tracking-[-0.04em] text-center"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
              }}
            >
              Create Assignment
            </span>
          </div>

          {/* Empty placeholder for alignment balance */}
          <div className="w-[48px] h-[48px] pointer-events-none" />
        </div>

        {/* Separator / Progress Lines (Frame 1984077364) */}
        <div className="w-full flex items-center gap-[12px] h-[10px]">
          {/* Active Segment (Frame 1984077353) */}
          <div className="flex-1 h-0 border-[2.5px] border-[#5E5E5E] rounded-full" />
          {/* Inactive Segment (Frame 1984077354) */}
          <div className="flex-1 h-0 border-[2.5px] border-[#DADADA] rounded-full" />
        </div>

        {/* Translucent Card Container (Frame 1984077584) */}
        <div 
          className="w-full bg-white/50 border border-white/20 rounded-[32px] py-[32px] px-[16px] flex flex-col gap-6 shadow-sm"
        >
          {/* Header Block (Frame 1984077347) */}
          <div className="flex flex-col justify-center items-start gap-[2px] w-full">
            <h2 
              className="text-[#303030] font-bold text-[20px] leading-[140%] tracking-[-0.04em]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Assignment Details
            </h2>
            <span 
              className="text-[14px] font-normal leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,0.8)]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Basic information about your assignment
            </span>
          </div>

          {/* Render Form Fields */}
          <div className="w-full">
            <StepBasicInfo />
          </div>
        </div>

      </div>
    </div>
  );
}
