"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
  AlertCircle,
  Mic,
  CalendarRange,
  Plus,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useAssignmentStore } from "@/stores/assignment-store";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB limit to match upload capabilities

interface QuestionConfigRow {
  id: string;
  type: "mcq" | "short_answer" | "long_answer" | "true_false" | "fill_in_blank";
  count: number;
  marksPerQuestion: number;
}

const QUESTION_TYPE_LABELS_CUSTOM = {
  mcq: "Multiple Choice Questions",
  short_answer: "Short Questions",
  long_answer: "Diagram/Graph-Based Questions",
  fill_in_blank: "Numerical Problems",
  true_false: "True / False Questions",
};

export function StepBasicInfo() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefMobile = useRef<HTMLInputElement>(null);
  const { createAssignment, isCreating, error } = useAssignmentStore();

  // Form states
  const [dueDate, setDueDate] = useState("");
  const [instructions, setInstructions] = useState("");
  
  // File upload state
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Question configuration rows state
  const [questionConfig, setQuestionConfig] = useState<QuestionConfigRow[]>([
    { id: "1", type: "mcq", count: 4, marksPerQuestion: 4 },
    { id: "2", type: "short_answer", count: 4, marksPerQuestion: 4 },
  ]);

  // Derived totals
  const totalQuestions = questionConfig.reduce((sum, c) => sum + c.count, 0);
  const totalMarks = questionConfig.reduce(
    (sum, c) => sum + c.count * c.marksPerQuestion,
    0
  );

  // File reading handler
  const handleFileRead = useCallback((file: File) => {
    setFileError(null);
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 50 MB.`
      );
      return;
    }
    setFileName(file.name);
    
    // Read text files for prompt injections
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content || "");
    };
    if (file.name.toLowerCase().endsWith(".txt") || file.type.startsWith("text/")) {
      reader.readAsText(file);
    } else {
      setFileContent("[Binary Attachment]");
    }
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileRead(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileRead(file);
    e.target.value = "";
  };

  const removeFile = () => {
    setFileName("");
    setFileContent("");
    setFileError(null);
  };

  const triggerVoiceInput = () => {
    if (isListening) return;
    setIsListening(true);
    
    // Simulate voice capture
    setTimeout(() => {
      const simulatedText = "Generate a question paper for 3 hour exam duration. Focus on kinematics, Newton's laws of motion, and frictional forces. Include diagrams where appropriate and make sure to have at least two difficult numerical problems.";
      setInstructions(simulatedText);
      setIsListening(false);
    }, 1800);
  };

  // Add Row
  const addQuestionType = () => {
    const unusedType = (["mcq", "short_answer", "long_answer", "fill_in_blank", "true_false"] as const).find(
      (type) => !questionConfig.some((q) => q.type === type)
    );
    
    setQuestionConfig((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        type: unusedType || "short_answer",
        count: 4,
        marksPerQuestion: 4,
      },
    ]);
  };

  // Submit Handler
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalTitle = "Assignment";
    let finalSubject = "cse";
    let finalGrade = "12th";

    if (fileName) {
      const baseName = fileName.substring(0, fileName.lastIndexOf(".")) || fileName;
      finalTitle = baseName;
      
      if (baseName.toLowerCase().includes("science")) {
        finalSubject = "Science";
      } else if (baseName.toLowerCase().includes("math")) {
        finalSubject = "Mathematics";
      } else if (baseName.toLowerCase().includes("computer")) {
        finalSubject = "Computer Science";
      }
    }

    try {
      const payload = {
        title: finalTitle,
        subject: finalSubject,
        grade: finalGrade,
        dueDate: dueDate || undefined,
        instructions: instructions || undefined,
        questionConfig: questionConfig.map((q) => ({
          type: q.type,
          count: q.count,
          marksPerQuestion: q.marksPerQuestion,
        })),
        sourceFileName: fileName || undefined,
        sourceFileContent: fileContent || undefined,
      };

      const assignment = await createAssignment(payload);
      router.push(`/assignments/${assignment._id}`);
    } catch (err) {
      console.error("Submission failed:", err);
    }
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
    <div className="w-[100px] h-[44px] bg-white border border-[#DADADA] rounded-full flex items-center justify-between px-3 select-none">
      <button
        type="button"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-neutral-700 disabled:opacity-30 disabled:pointer-events-none font-bold text-lg active:scale-95 transition-transform"
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
        className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-neutral-700 disabled:opacity-30 disabled:pointer-events-none font-bold text-lg active:scale-95 transition-transform"
      >
        +
      </button>
    </div>
  );

  // Custom Mobile Incrementer Pill component (Frame 1618872169)
  const MobileIncrementer = ({
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
    <div className="w-[132.5px] h-[38px] bg-white rounded-full flex items-center justify-between px-3 select-none shadow-sm">
      <button
        type="button"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-5 h-5 flex items-center justify-center text-[#5E5E5E] disabled:opacity-30 disabled:pointer-events-none font-extrabold text-base active:scale-95 transition-transform"
      >
        -
      </button>
      <span 
        className="font-medium text-[16px] tracking-[-0.04em] text-[#303030]"
        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
      >
        {value}
      </span>
      <button
        type="button"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-5 h-5 flex items-center justify-center text-[#5E5E5E] disabled:opacity-30 disabled:pointer-events-none font-extrabold text-base active:scale-95 transition-transform"
      >
        +
      </button>
    </div>
  );

  return (
    <div className="w-full">
      {/* ── Desktop UI Form Layout ── */}
      <div className="hidden md:flex flex-col gap-6 w-full max-w-[746px] mx-auto">
        {error && (
          <div className="flex items-start gap-2.5 p-4 rounded-2xl border border-red-100 bg-red-50 text-red-800 text-sm animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold font-bricolage mb-0.5">Failed to create assignment</h4>
              <p className="text-red-700 font-sans">{error}</p>
            </div>
          </div>
        )}

        {/* Source Material Dropzone */}
        <div className="flex flex-col gap-3">
          {fileName ? (
            <div className="flex items-center gap-3 p-4 px-6 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-inner animate-in zoom-in-95 duration-200">
              <FileText className="w-6 h-6 text-emerald-600" />
              <div className="flex-1 min-w-0">
                <p className="font-bricolage font-bold text-[16px] text-emerald-800 truncate">
                  {fileName}
                </p>
                <p className="text-xs text-emerald-600/70 font-sans">
                  Successfully attached
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="w-8 h-8 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-[#303030] hover:text-red-500 transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={cn(
                "w-full h-[202px] border-[1.75px] border-dashed rounded-[24px] flex flex-col items-center justify-center p-6 gap-4 bg-white transition-all cursor-pointer",
                isDragging
                  ? "border-[#F97316] bg-orange-50/10 shadow-sm scale-[0.99]"
                  : "border-black/20 hover:border-black/30"
              )}
            >
              <div className="w-10 h-10 bg-white rounded-lg border border-neutral-100 flex items-center justify-center shadow-sm">
                <UploadCloud className="w-6 h-6 text-neutral-800" />
              </div>

              <div className="flex flex-col items-center gap-1 text-center">
                <span className="font-bricolage font-semibold text-[16px] leading-[140%] tracking-[-0.04em] text-[#303030]">
                  Choose a file or drag & drop it here
                </span>
                <span className="font-bricolage font-normal text-[14px] leading-[140%] tracking-[-0.04em] text-[#A9A9A9]">
                  JPEG, PNG, upto 10MB
                </span>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-9 px-6 bg-[#F6F6F6] hover:bg-neutral-100 active:scale-[0.98] rounded-full flex items-center justify-center text-[#303030] font-bricolage font-medium text-[14px] leading-[140%] tracking-[-0.04em] shadow-sm transition-all duration-200"
              >
                Browse Files
              </button>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          <span className="font-bricolage font-medium text-[16px] leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,0.6)] mt-1 text-center">
            Upload images of your preferred document/image
          </span>
        </div>

        {/* Due Date Row */}
        <div className="flex flex-col gap-2 w-full">
          <label className="font-bricolage font-bold text-[16px] leading-[140%] tracking-[-0.04em] text-[#303030]">
            Due Date
          </label>
          <div className="relative w-full h-[44px] bg-white border border-[#DADADA] rounded-full px-5 flex items-center justify-between group focus-within:ring-1 focus-within:ring-neutral-400 focus-within:border-neutral-400 transition-all">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-full bg-transparent font-bricolage text-[16px] text-[#303030] placeholder:text-[#A9A9A9] focus:outline-none cursor-pointer"
            />
            <CalendarRange className="w-5 h-5 text-neutral-500 absolute right-5 pointer-events-none group-hover:text-neutral-700 transition-colors" />
          </div>
        </div>

        {/* Question Config Table Section */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center w-full pb-2 border-b border-neutral-100">
            <span className="font-bricolage font-bold text-[16px] leading-[140%] tracking-[-0.04em] text-[#303030]">
              Question Type
            </span>
            <div className="flex gap-[24px]">
              <span className="w-[100px] text-center font-bricolage font-medium text-[16px] leading-[140%] tracking-[-0.04em] text-[#303030]">
                No. of Questions
              </span>
              <span className="w-[100px] text-center font-bricolage font-medium text-[16px] leading-[140%] tracking-[-0.04em] text-[#303030]">
                Marks
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {questionConfig.map((row) => (
              <div key={row.id} className="flex justify-between items-center w-full gap-4 animate-in fade-in duration-200">
                <div className="flex-1 h-11 bg-white border border-[#DADADA] rounded-full px-5 flex items-center justify-between gap-3 shadow-[0px_2px_8px_rgba(0,0,0,0.02)]">
                  <select
                    value={row.type}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setQuestionConfig((prev) =>
                        prev.map((q) => (q.id === row.id ? { ...q, type: val } : q))
                      );
                    }}
                    className="flex-1 bg-transparent font-bricolage font-medium text-[16px] tracking-[-0.04em] text-[#303030] appearance-none focus:outline-none cursor-pointer pr-6"
                  >
                    {Object.entries(QUESTION_TYPE_LABELS_CUSTOM).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  
                  {questionConfig.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuestionConfig((prev) => prev.filter((q) => q.id !== row.id));
                      }}
                      className="text-[#303030] hover:text-red-500 transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex gap-[24px] flex-shrink-0">
                  <Incrementer
                    value={row.count}
                    onChange={(val) => {
                      setQuestionConfig((prev) =>
                        prev.map((q) => (q.id === row.id ? { ...q, count: val } : q))
                      );
                    }}
                  />
                  <Incrementer
                    value={row.marksPerQuestion}
                    onChange={(val) => {
                      setQuestionConfig((prev) =>
                        prev.map((q) => (q.id === row.id ? { ...q, marksPerQuestion: val } : q))
                      );
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestionType}
            className="flex items-center gap-3 group active:scale-[0.98] transition-transform self-start mt-2"
          >
            <div className="w-[36px] h-[36px] bg-[#2B2B2B] hover:bg-neutral-800 rounded-full flex items-center justify-center text-white shadow-md">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="font-bricolage font-bold text-[14px] leading-[140%] tracking-[-0.04em] text-[#303030] group-hover:underline">
              Add Question Type
            </span>
          </button>

          <div className="w-full flex justify-end mt-4">
            <div className="flex flex-col items-end gap-1 px-4 py-2 border-r-2 border-[#F97316]/80 bg-neutral-50/30 rounded-l-lg font-bricolage">
              <span className="font-medium text-[16px] leading-[110%] tracking-[-0.04em] text-[#303030]">
                Total Questions : <span className="font-bold text-[#F97316]">{totalQuestions}</span>
              </span>
              <span className="font-medium text-[16px] leading-[110%] tracking-[-0.04em] text-[#303030]">
                Total Marks : <span className="font-bold text-[#F97316]">{totalMarks}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="flex flex-col gap-2 mt-4">
          <label className="font-bricolage font-bold text-[16px] leading-[140%] tracking-[-0.04em] text-[#303030]">
            Additional Information (For better output)
          </label>
          <div className="relative w-full min-h-[102px] bg-white/25 border-[1.25px] border-dashed border-[#DADADA] rounded-[16px] p-4 flex flex-col justify-between items-end gap-2 focus-within:ring-1 focus-within:ring-neutral-400 transition-all">
            <textarea
              placeholder="e.g Generate a question paper for 3 hour exam duration..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full flex-1 bg-transparent border-none outline-none font-bricolage font-medium text-[14px] leading-[140%] tracking-[-0.04em] text-[#303030] placeholder:text-[rgba(48,48,48,0.6)] resize-none focus:ring-0 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              {isListening && (
                <span className="text-[12px] text-[#F97316] font-semibold animate-pulse font-bricolage">
                  Listening...
                </span>
              )}
              <button
                type="button"
                onClick={triggerVoiceInput}
                disabled={isListening}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                  isListening
                    ? "bg-red-500 text-white"
                    : "bg-[#F0F0F0] text-neutral-800 hover:bg-neutral-200 active:scale-95 cursor-pointer shadow-md"
                )}
              >
                <Mic className="w-4 h-4 text-[#303030]" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Desktop Form Navigation */}
        <div className="flex justify-between items-center w-full pt-8 mt-12 border-t border-neutral-100/50">
          <button
            type="button"
            onClick={() => router.push("/assignments")}
            className="h-[46px] px-6 bg-white border border-[#DADADA] hover:bg-neutral-50 active:scale-[0.98] rounded-full flex items-center justify-center gap-1.5 text-[#303030] font-bricolage font-semibold text-base transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-[#303030]" />
            <span>Previous</span>
          </button>

          <button
            type="submit"
            onClick={onSubmit}
            disabled={isCreating}
            className="h-[46px] px-6 bg-[#181818] hover:bg-[#2c2c2c] active:scale-[0.98] rounded-full flex items-center justify-center gap-1.5 text-white font-bricolage font-semibold text-base transition-all shadow-lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Form UI Layout (Figma Pixel-Perfect Form Card Details) ── */}
      <div className="flex md:hidden flex-col gap-6 w-full max-w-[317px] mx-auto select-none">
        
        {/* Error alerting box */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl border border-red-100 bg-red-50 text-red-800 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="font-sans leading-tight">{error}</p>
          </div>
        )}

        {/* Source Material Dropzone - Frame 1984077301 */}
        <div className="flex flex-col gap-3 w-full">
          {fileName ? (
            <div className="flex items-center gap-2 p-3 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-inner animate-in zoom-in-95 duration-200 w-full">
              <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bricolage font-bold text-[14px] text-emerald-800 truncate leading-none">
                  {fileName}
                </p>
                <p className="text-[10px] text-emerald-600/70 font-sans leading-none mt-1">
                  Successfully attached
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="w-6 h-6 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-[#303030] hover:text-red-500 transition-colors shadow-sm flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Dashed Upload Card - Frame 1618872469 */
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={cn(
                "w-full h-[202px] border-[1.75px] border-dashed rounded-[24px] flex flex-col items-center justify-center p-4 gap-4 bg-[#F6F6F6] transition-all cursor-pointer",
                isDragging ? "border-[#FF5623] bg-orange-50/10" : "border-black/20 hover:border-black/30"
              )}
            >
              {/* White square cloud icon wrapper - Frame 1618872514 */}
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <UploadCloud className="w-5 h-5 text-[#1E1E1E]" strokeWidth={2.5} />
              </div>

              {/* Label choose file - Frame 1618872516 */}
              <div className="flex flex-col items-center gap-1 text-center w-full">
                <span className="font-bricolage font-medium text-[16px] leading-[140%] tracking-[-0.04em] text-[#303030]">
                  Choose a file or drag & drop it here
                </span>
                <span className="font-bricolage font-normal text-[14px] leading-[140%] tracking-[-0.04em] text-[#A9A9A9]">
                  JPEG, PNG, upto 10MB
                </span>
              </div>

              {/* Browse white pill button - Primary Button - White */}
              <button
                type="button"
                onClick={() => fileInputRefMobile.current?.click()}
                className="h-[36px] px-6 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-[#303030] font-bricolage font-medium text-[14px] leading-[140%] tracking-[-0.04em] shadow-sm active:scale-[0.98] transition-transform"
              >
                Browse Files
              </button>

              <input
                ref={fileInputRefMobile}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Subtext info */}
          <span 
            className="text-[16px] font-medium leading-[140%] tracking-[-0.04em] text-center text-neutral-400"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Upload images of your preferred document/image
          </span>
        </div>

        {/* Due Date block - Frame 1618872457 */}
        <div className="flex flex-col gap-2 w-full">
          <label 
            className="text-[16px] font-bold leading-[140%] tracking-[-0.04em] text-[#303030]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Due Date
          </label>
          
          {/* Rounded date field container - Frame 1618872169 */}
          <div className="relative w-full h-[44px] bg-white border border-[#DADADA] rounded-full px-5 flex items-center justify-between group active:scale-[0.99] transition-transform">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-full bg-transparent font-bricolage text-[16px] text-[#303030] placeholder:text-[#A9A9A9] focus:outline-none cursor-pointer"
            />
            {/* Dark grey Calendar icon - icon_line/Calendar_plus */}
            <CalendarRange className="w-5 h-5 text-[#2B2B2B] absolute right-5 pointer-events-none" />
          </div>
        </div>

        {/* Question Type Block - Frame 1618872458 */}
        <div className="flex flex-col gap-4 w-full">
          <label 
            className="text-[16px] font-bold leading-[140%] tracking-[-0.04em] text-[#303030]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Question Type
          </label>

          {/* Cards checklist - Frame 1618872171 */}
          <div className="flex flex-col gap-4 w-full">
            {questionConfig.map((row) => (
              /* Custom White card box - Frame 1984077592 */
              <div 
                key={row.id} 
                className="w-full min-h-[138px] bg-white border border-neutral-100 rounded-[24px] p-[12px] flex flex-col justify-between gap-3 shadow-[0px_4px_12px_rgba(0,0,0,0.02)] animate-in fade-in duration-200"
              >
                {/* Header row: dropdown select + close */}
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex-1 h-9 bg-white border border-[#DADADA] rounded-full px-4 flex items-center justify-between gap-2 shadow-inner">
                    <select
                      value={row.type}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setQuestionConfig((prev) =>
                          prev.map((q) => (q.id === row.id ? { ...q, type: val } : q))
                        );
                      }}
                      className="flex-1 bg-transparent font-medium text-[14px] tracking-[-0.04em] text-[#303030] appearance-none focus:outline-none cursor-pointer pr-4"
                      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                      {Object.entries(QUESTION_TYPE_LABELS_CUSTOM).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {questionConfig.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuestionConfig((prev) => prev.filter((q) => q.id !== row.id));
                      }}
                      className="text-[#303030] hover:text-red-500 transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Gray counters box - Frame 1984077589 */}
                <div className="w-full h-[82px] bg-[#F0F0F0] rounded-[24px] p-2 flex justify-between gap-3 items-center">
                  {/* No. of Questions - Frame 1984077590 */}
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <span 
                      className="text-[12px] font-medium tracking-[-0.04em] text-[#303030] leading-none"
                      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                      No. of Questions
                    </span>
                    <MobileIncrementer
                      value={row.count}
                      onChange={(val) => {
                        setQuestionConfig((prev) =>
                          prev.map((q) => (q.id === row.id ? { ...q, count: val } : q))
                        );
                      }}
                    />
                  </div>

                  {/* Marks - Frame 1984077591 */}
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <span 
                      className="text-[12px] font-medium tracking-[-0.04em] text-[#303030] leading-none"
                      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                      Marks
                    </span>
                    <MobileIncrementer
                      value={row.marksPerQuestion}
                      onChange={(val) => {
                        setQuestionConfig((prev) =>
                          prev.map((q) => (q.id === row.id ? { ...q, marksPerQuestion: val } : q))
                        );
                      }}
                      min={1}
                      max={20}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Type button row - Frame 1984077500 */}
          <div className="flex items-center gap-2 w-full mt-2">
            {/* Circular dark plus button - Primary Button - White */}
            <button
              type="button"
              onClick={addQuestionType}
              className="w-[36px] h-[36px] bg-[#2B2B2B] hover:bg-neutral-800 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform shadow-md"
              style={{ borderRadius: "48px" }}
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
            <span 
              className="text-[14px] font-bold leading-[140%] tracking-[-0.04em] text-[#303030]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Add Question Type
            </span>
          </div>

          {/* Totals Block - Frame 1984077510 */}
          <div className="w-full flex flex-col items-end gap-1 px-4 mt-2">
            <span 
              className="text-[16px] font-semibold tracking-[-0.04em] text-[#303030]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Total Questions : <span className="font-bold text-[#FF5623]">{totalQuestions}</span>
            </span>
            <span 
              className="text-[16px] font-semibold tracking-[-0.04em] text-[#303030]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Total Marks : <span className="font-bold text-[#FF5623]">{totalMarks}</span>
            </span>
          </div>
        </div>

        {/* Additional Information details */}
        <div className="flex flex-col gap-2 w-full mt-2">
          <label 
            className="text-[16px] font-bold leading-[140%] tracking-[-0.04em] text-[#303030]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Additional Information (For better output)
          </label>
          
          <div className="relative w-full min-h-[102px] bg-white border border-[#DADADA] rounded-[16px] p-4 flex flex-col justify-between items-end gap-2 focus-within:ring-1 focus-within:ring-[#5E5E5E]">
            <textarea
              placeholder="e.g Generate a question paper for 3 hour exam duration..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full flex-1 bg-transparent border-none outline-none font-medium text-[14px] leading-[140%] tracking-[-0.04em] text-[#303030] placeholder:text-[rgba(48,48,48,0.6)] resize-none focus:ring-0 focus:outline-none"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            />
            <div className="flex items-center gap-2">
              {isListening && (
                <span className="text-[12px] text-[#F97316] font-semibold animate-pulse font-bricolage">
                  Listening...
                </span>
              )}
              <button
                type="button"
                onClick={triggerVoiceInput}
                disabled={isListening}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm",
                  isListening ? "bg-red-500 text-white animate-bounce" : "bg-[#F0F0F0] text-neutral-800 hover:bg-neutral-200"
                )}
              >
                <Mic className="w-4 h-4 text-[#303030]" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Floating Glassmorphic Footer capsule ── */}
        <div 
          className="md:hidden fixed bottom-[114px] left-1/2 -translate-x-1/2 z-40 w-[349px] h-[58px] bg-white/40 border border-white/10 backdrop-blur-md rounded-full shadow-[0px_16px_48px_rgba(0,0,0,0.12),_0px_32px_48px_rgba(0,0,0,0.2)] flex items-center justify-between px-3 select-none pointer-events-auto"
        >
          {/* Previous Button (Primary Button - White) */}
          <button
            type="button"
            onClick={() => router.push("/assignments")}
            className="h-[40px] px-4 bg-white border border-[#DADADA] hover:bg-neutral-50 active:scale-[0.98] rounded-full flex items-center justify-center gap-1 text-[#303030] font-bricolage font-semibold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-[#303030]" />
            <span>Previous</span>
          </button>

          {/* Continue Button (Primary Button - Dark) */}
          <button
            type="submit"
            onClick={onSubmit}
            disabled={isCreating}
            className="h-[40px] px-5 bg-[#181818] hover:bg-neutral-800 active:scale-[0.98] rounded-full flex items-center justify-center gap-1.5 text-white font-bricolage font-semibold text-sm transition-all shadow-md min-w-[106px] disabled:opacity-75"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Wait...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
