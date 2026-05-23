"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, ArrowLeft, ArrowRight } from "lucide-react";
import { QUESTION_TYPES, QUESTION_TYPE_LABELS } from "@vedaai/shared";
import { useAssignmentStore } from "@/stores/assignment-store";

const questionConfigSchema = z.object({
  questionConfig: z
    .array(
      z.object({
        type: z.enum(["mcq", "short_answer", "long_answer", "true_false", "fill_in_blank"]),
        count: z.coerce.number().int().min(1).max(50),
        marksPerQuestion: z.coerce.number().int().min(1).max(20),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      })
    )
    .min(1, "At least one question type is required"),
});

type QuestionConfigForm = z.infer<typeof questionConfigSchema>;

const questionTypeOptions = Object.entries(QUESTION_TYPES).map(([, value]) => ({
  value,
  label: QUESTION_TYPE_LABELS[value] || value,
}));

export function StepQuestionConfig() {
  const { wizardData, updateWizardData, setStep } = useAssignmentStore();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuestionConfigForm>({
    resolver: zodResolver(questionConfigSchema),
    defaultValues: {
      questionConfig: wizardData.questionConfig.length > 0
        ? wizardData.questionConfig
        : [{ type: "mcq", count: 5, marksPerQuestion: 1, difficulty: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questionConfig",
  });

  const watchedConfig = watch("questionConfig");
  const totalQuestions = watchedConfig.reduce((sum, c) => sum + (Number(c.count) || 0), 0);
  const totalMarks = watchedConfig.reduce(
    (sum, c) => sum + (Number(c.count) || 0) * (Number(c.marksPerQuestion) || 0),
    0
  );

  const onSubmit = (data: QuestionConfigForm) => {
    updateWizardData({ questionConfig: data.questionConfig });
    setStep(2);
  };

  // Custom Incrementer Capsule Component
  const Incrementer = ({
    value,
    onChange,
    min = 1,
    max = 50,
  }: {
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
  }) => (
    <div className="w-[100px] h-[44px] bg-white border border-[#DADADA] shadow-[0px_2px_8px_rgba(0,0,0,0.04)] rounded-full flex items-center justify-between px-3 select-none">
      <button
        type="button"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-neutral-700 active:scale-90 transition-transform disabled:opacity-30 disabled:pointer-events-none font-bold text-lg"
      >
        -
      </button>
      <span className="font-bricolage font-medium text-[16px] tracking-[-0.04em] text-[#303030]">
        {value}
      </span>
      <button
        type="button"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-neutral-700 active:scale-90 transition-transform disabled:opacity-30 disabled:pointer-events-none font-bold text-lg"
      >
        +
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[746px] mx-auto flex flex-col gap-6">
      
      {/* Question Configuration Header Wrapper */}
      <div className="flex flex-col gap-4">
        
        {/* Table Headers */}
        <div className="flex justify-between items-center w-full pb-2 border-b border-neutral-100">
          <span className="font-bricolage font-bold text-[16px] leading-[140%] tracking-[-0.04em] text-[#303030]">
            Question Type
          </span>
          <div className="flex gap-[24px]">
            <span className="w-[100px] text-center font-bricolage font-medium text-[16px] leading-[140%] tracking-[-0.04em] text-[#303030]">
              No. of Qs
            </span>
            <span className="w-[100px] text-center font-bricolage font-medium text-[16px] leading-[140%] tracking-[-0.04em] text-[#303030]">
              Marks
            </span>
          </div>
        </div>

        {/* Rows of question configurators */}
        <div className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex justify-between items-center w-full gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              
              {/* Left Column: Dropdown select inside a capsule */}
              <div className="flex-1 h-11 bg-white border border-[#DADADA] rounded-full px-5 flex items-center justify-between gap-3 shadow-[0px_2px_8px_rgba(0,0,0,0.02)]">
                <select
                  value={watchedConfig[index]?.type || "mcq"}
                  className="flex-1 bg-transparent font-bricolage font-medium text-[16px] tracking-[-0.04em] text-[#303030] appearance-none focus:outline-none cursor-pointer pr-6"
                  onChange={(e) =>
                    setValue(
                      `questionConfig.${index}.type` as const,
                      e.target.value as "mcq" | "short_answer" | "long_answer" | "true_false" | "fill_in_blank",
                      { shouldValidate: true }
                    )
                  }
                >
                  {questionTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                
                {/* Trash/delete action inside the capsule */}
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-neutral-400 hover:text-red-500 hover:scale-105 active:scale-95 transition-all p-1"
                    title="Remove question type"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Right Columns: Custom Incrementers */}
              <div className="flex gap-[24px] flex-shrink-0">
                {/* No. of Questions */}
                <Incrementer
                  value={watchedConfig[index]?.count || 1}
                  onChange={(val) =>
                    setValue(`questionConfig.${index}.count` as const, val, {
                      shouldValidate: true,
                    })
                  }
                  min={1}
                  max={50}
                />

                {/* Marks per Question */}
                <Incrementer
                  value={watchedConfig[index]?.marksPerQuestion || 1}
                  onChange={(val) =>
                    setValue(`questionConfig.${index}.marksPerQuestion` as const, val, {
                      shouldValidate: true,
                    })
                  }
                  min={1}
                  max={20}
                />
              </div>

            </div>
          ))}
        </div>
      </div>

      {errors.questionConfig && (
        <p className="font-bricolage text-[12px] text-red-500 ml-3">{errors.questionConfig.message}</p>
      )}

      {/* Add Question Type Button Capsule */}
      <button
        type="button"
        onClick={() =>
          append({
            type: "short_answer",
            count: 5,
            marksPerQuestion: 2,
            difficulty: undefined,
          })
        }
        className="flex items-center gap-3 group active:scale-[0.98] transition-transform self-start mt-2"
      >
        <div className="w-9 h-9 rounded-full bg-[#2B2B2B] hover:bg-[#1a1a1a] flex items-center justify-center shadow-sm group-hover:scale-105 transition-all duration-200">
          <Plus className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="font-bricolage font-bold text-[14px] leading-[140%] tracking-[-0.04em] text-[#303030] group-hover:underline">
          Add Question Type
        </span>
      </button>

      {/* Summary Footer Panel */}
      <div className="w-full flex justify-end mt-4">
        {/* Frame 1984077510 */}
        <div className="flex flex-col items-end gap-1.5 px-4 py-2 border-r-2 border-[#F97316]/80 bg-neutral-50/50 rounded-l-lg">
          <span className="font-bricolage font-medium text-[16px] leading-[110%] tracking-[-0.04em] text-[#303030]">
            Total Questions : <span className="font-bold text-[#F97316]">{totalQuestions}</span>
          </span>
          <span className="font-bricolage font-medium text-[16px] leading-[110%] tracking-[-0.04em] text-[#303030]">
            Total Marks : <span className="font-bold text-[#F97316]">{totalMarks}</span>
          </span>
        </div>
      </div>

      {/* Footer Navigation Action Buttons */}
      <div className="flex justify-between items-center w-full pt-6 border-t border-neutral-100 mt-8">
        {/* Previous Button (Primary Button - White) */}
        <button
          type="button"
          onClick={() => setStep(0)}
          className="h-[46px] px-6 bg-white border border-[#DADADA] hover:bg-neutral-50 active:scale-[0.98] rounded-full flex items-center justify-center gap-1.5 text-[#303030] font-bricolage font-semibold text-base tracking-tight transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-[#303030]" />
          <span>Previous</span>
        </button>

        {/* Next/Continue Button (Primary Button - Dark) */}
        <button
          type="submit"
          className="h-[46px] px-6 bg-[#181818] shadow-md hover:bg-[#2c2c2c] active:scale-[0.98] rounded-full flex items-center justify-center gap-1.5 text-white font-bricolage font-semibold text-base tracking-tight transition-all duration-200"
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5 text-white" />
        </button>
      </div>

    </form>
  );
}
