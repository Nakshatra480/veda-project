"use client";

import { cn } from "@/lib/utils";

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full max-w-[815px] flex items-center gap-3 mb-8">
      {/* Left Segment - Frame 1984077353 */}
      <div className="flex-1 h-[6px] relative">
        <div
          className={cn(
            "w-full h-[6px] rounded-full transition-all duration-500",
            currentStep >= 0 ? "bg-[#5E5E5E]" : "bg-[#DADADA]"
          )}
        />
      </div>

      {/* Right Segment - Frame 1984077354 */}
      <div className="flex-1 h-[6px] relative">
        <div
          className={cn(
            "w-full h-[6px] rounded-full transition-all duration-500",
            currentStep >= 1 ? "bg-[#5E5E5E]" : "bg-[#DADADA]"
          )}
        />
      </div>
    </div>
  );
}
