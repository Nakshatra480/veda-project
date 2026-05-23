"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { UploadCloud, FileText, X, Loader2, AlertCircle, Mic, ArrowLeft, ArrowRight } from "lucide-react";
import { QUESTION_TYPE_LABELS } from "@vedaai/shared";
import { useAssignmentStore } from "@/stores/assignment-store";
import { Badge } from "@/components/ui/badge";

const MAX_FILE_SIZE_BYTES = 50 * 1024; // 50 KB

export function StepReview() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    wizardData,
    updateWizardData,
    setStep,
    createAssignment,
    isCreating,
    error,
  } = useAssignmentStore();

  const [instructions, setInstructions] = useState(wizardData.instructions || "");
  const [fileName, setFileName] = useState(wizardData.sourceFileName || "");
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const totalQuestions = wizardData.questionConfig.reduce((sum, c) => sum + c.count, 0);
  const totalMarks = wizardData.questionConfig.reduce(
    (sum, c) => sum + c.count * c.marksPerQuestion,
    0
  );

  const handleFileRead = useCallback(
    (file: File) => {
      setFileError(null);
      if (!file.name.toLowerCase().endsWith(".txt")) {
        setFileError("Only plain-text (.txt) files are supported.");
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(
          `File is too large (${(file.size / 1024).toFixed(1)} KB). Maximum allowed size is 50 KB.`
        );
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        updateWizardData({
          sourceFileName: file.name,
          sourceFileContent: content,
        });
      };
      reader.readAsText(file);
    },
    [updateWizardData]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileRead(file);
    },
    [handleFileRead]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileRead(file);
    e.target.value = "";
  };

  const removeFile = () => {
    setFileName("");
    setFileError(null);
    updateWizardData({ sourceFileName: undefined, sourceFileContent: undefined });
  };

  const triggerVoiceInput = () => {
    if (isListening) return;
    setIsListening(true);
    
    // Simulate smart mic voice capture after 1.5 seconds
    setTimeout(() => {
      const simulatedText = "Generate a question paper for 3 hour exam duration. Focus on kinematics, Newton's laws of motion, and frictional forces. Include diagrams where appropriate and make sure to have at least two difficult numerical problems.";
      setInstructions(simulatedText);
      setIsListening(false);
    }, 1800);
  };

  const handleSubmit = async () => {
    updateWizardData({ instructions: instructions || undefined });
    try {
      const assignment = await createAssignment({
        ...wizardData,
        instructions: instructions || undefined,
      });
      router.push(`/assignments/${assignment._id}`);
    } catch {
      // handled in store
    }
  };

  return (
    <div className="space-y-6 w-full max-w-[746px] mx-auto">
      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl border border-red-100 bg-red-50 text-red-800 text-sm animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold font-bricolage mb-0.5">Failed to create assignment</h4>
            <p className="text-red-700 font-sans">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Section */}
      <div className="rounded-2xl border border-[#DADADA]/50 bg-white/40 p-5 space-y-4 shadow-[0px_2px_12px_rgba(0,0,0,0.02)]">
        <h3 className="font-bricolage font-bold text-[18px] text-[#303030] tracking-[-0.04em]">
          Summary Preview
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-bricolage">
          <div>
            <span className="text-[#A9A9A9] text-xs font-semibold tracking-wide uppercase">Title</span>
            <p className="font-semibold text-[#303030] mt-0.5 truncate" title={wizardData.title}>
              {wizardData.title}
            </p>
          </div>
          <div>
            <span className="text-[#A9A9A9] text-xs font-semibold tracking-wide uppercase">Subject</span>
            <p className="font-semibold text-[#303030] mt-0.5">
              {wizardData.subject}
            </p>
          </div>
          <div>
            <span className="text-[#A9A9A9] text-xs font-semibold tracking-wide uppercase">Grade</span>
            <p className="font-semibold text-[#303030] mt-0.5">
              {wizardData.grade}
            </p>
          </div>
          <div>
            <span className="text-[#A9A9A9] text-xs font-semibold tracking-wide uppercase">Due Date</span>
            <p className="font-semibold text-[#303030] mt-0.5">
              {wizardData.dueDate
                ? format(new Date(wizardData.dueDate), "MMM d, yyyy")
                : "Not set"}
            </p>
          </div>
        </div>

        {/* Question config table summary */}
        <div className="pt-3 border-t border-neutral-100 font-bricolage">
          <span className="text-sm font-bold text-[#303030] tracking-[-0.04em] block mb-2">
            Selected Questions
          </span>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#A9A9A9] border-b border-neutral-50">
                  <th className="pb-2 font-medium tracking-tight">Type</th>
                  <th className="pb-2 font-medium tracking-tight">Count</th>
                  <th className="pb-2 font-medium tracking-tight">Marks Each</th>
                  <th className="pb-2 font-medium tracking-tight">Difficulty</th>
                  <th className="pb-2 font-medium tracking-tight text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {wizardData.questionConfig.map((config, index) => (
                  <tr key={index} className="text-[#303030] border-b border-neutral-50/50">
                    <td className="py-2 font-medium">
                      {QUESTION_TYPE_LABELS[config.type] || config.type}
                    </td>
                    <td className="py-2">{config.count}</td>
                    <td className="py-2">{config.marksPerQuestion}</td>
                    <td className="py-2">
                      {config.difficulty ? (
                        <Badge
                          variant={
                            config.difficulty === "easy"
                              ? "easy"
                              : config.difficulty === "medium"
                              ? "medium"
                              : "hard"
                          }
                        >
                          {config.difficulty}
                        </Badge>
                      ) : (
                        <span className="text-neutral-400">Any</span>
                      )}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {config.count * config.marksPerQuestion}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold text-neutral-800">
                  <td className="pt-3">Total Sum</td>
                  <td className="pt-3">{totalQuestions} Qs</td>
                  <td className="pt-3" colSpan={2} />
                  <td className="pt-3 text-right text-[#F97316]">
                    {totalMarks} marks
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Due Date Indicator (styled to match figma) */}
      <div className="flex flex-col gap-2">
        <span className="font-bricolage font-bold text-[16px] leading-[140%] tracking-[-0.04em] text-[#303030]">
          Source Material
        </span>
        
        {fileName ? (
          <div className="flex items-center gap-3 p-3 px-5 rounded-full border border-emerald-200 bg-emerald-50/20 shadow-[0px_2px_8px_rgba(0,0,0,0.02)] animate-in zoom-in duration-200">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span className="font-bricolage font-medium text-[16px] text-emerald-800 flex-1 truncate">
              {fileName}
            </span>
            <button
              type="button"
              onClick={removeFile}
              className="text-neutral-400 hover:text-red-500 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Frame 1618872469 - Dashed File Dropzone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`w-full h-[202px] border-[1.75px] border-dashed rounded-[24px] flex flex-col items-center justify-center p-6 gap-4 bg-white transition-all cursor-pointer ${
              isDragging
                ? "border-[#F97316] bg-orange-50/10 shadow-sm scale-[0.99]"
                : "border-black/20 hover:border-black/30 shadow-[0px_2px_8px_rgba(0,0,0,0.02)]"
            }`}
          >
            {/* Upload Cloud Frame 1618872514 */}
            <div className="w-10 h-10 bg-white rounded-lg border border-neutral-100 flex items-center justify-center shadow-sm">
              <UploadCloud className="w-6 h-6 text-neutral-800" />
            </div>

            {/* Choose a file or drag & drop it here */}
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="font-bricolage font-semibold text-[16px] leading-[140%] tracking-[-0.04em] text-[#303030]">
                Choose a file or drag & drop it here
              </span>
              <span className="font-bricolage font-normal text-[14px] leading-[140%] tracking-[-0.04em] text-[#A9A9A9]">
                Plain text (.txt) only · max 50 KB
              </span>
            </div>

            {/* Primary Button - White */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-6 bg-[#F6F6F6] hover:bg-neutral-100 active:scale-[0.98] rounded-full flex items-center justify-center text-[#303030] font-bricolage font-semibold text-[14px] leading-[140%] tracking-[-0.04em] shadow-sm transition-all duration-200"
            >
              Browse Files
            </button>

            <input
              ref={fileInputRef}
              id="source-file-input"
              type="file"
              className="hidden"
              accept=".txt"
              onChange={handleFileChange}
            />

            {fileError && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-red-600 bg-red-50/50 px-3 py-1 rounded-full border border-red-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium font-sans">{fileError}</span>
              </div>
            )}
          </div>
        )}

        {/* Upload images of your preferred document/image helper label */}
        <span className="font-bricolage font-medium text-[16px] leading-[140%] tracking-[-0.04em] text-neutral-400 mt-1">
          Upload plain text notes or study material to guide the generator.
        </span>
      </div>

      {/* Additional Information (For better output) */}
      <div className="flex flex-col gap-2 mt-4">
        <label
          htmlFor="instructions-textarea"
          className="font-bricolage font-bold text-[16px] leading-[140%] tracking-[-0.04em] text-[#303030]"
        >
          Additional Information (For better output)
        </label>
        
        {/* Frame 1984077611 - Dashed Text Area Container */}
        <div className="relative w-full min-h-[102px] bg-white/25 border-[1.25px] border-dashed border-[#DADADA] rounded-[16px] p-4 flex flex-col justify-between items-end gap-2 focus-within:ring-1 focus-within:ring-[#5E5E5E] focus-within:border-[#5E5E5E] transition-all">
          <textarea
            id="instructions-textarea"
            placeholder="e.g. Generate a question paper for 3 hour exam duration..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full flex-1 bg-transparent border-none outline-none font-bricolage font-medium text-[14px] leading-[140%] tracking-[-0.04em] text-[#303030] placeholder:text-neutral-400 resize-none min-h-[50px] focus:ring-0 focus:outline-none"
          />

          {/* Voice Mic Button (Frame 1984077290) */}
          <div className="flex items-center gap-2">
            {isListening && (
              <span className="text-[12px] text-[#F97316] font-semibold animate-pulse font-bricolage pr-1">
                Listening...
              </span>
            )}
            <button
              type="button"
              onClick={triggerVoiceInput}
              disabled={isListening}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? "bg-red-500 text-white animate-bounce"
                  : "bg-[#F0F0F0] text-neutral-800 hover:bg-neutral-200 active:scale-95 cursor-pointer shadow-sm"
              }`}
              title="Speak instructions (AI simulation)"
            >
              <Mic className={`w-[16.36px] h-[16.36px] ${isListening ? "text-white" : "text-neutral-700"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Navigation Action Buttons */}
      <div className="flex justify-between items-center w-full pt-6 border-t border-neutral-100 mt-8">
        {/* Previous Button (Primary Button - White) */}
        <button
          type="button"
          onClick={() => setStep(1)}
          disabled={isCreating}
          className="h-[46px] px-6 bg-white border border-[#DADADA] hover:bg-neutral-50 active:scale-[0.98] rounded-full flex items-center justify-center gap-1.5 text-[#303030] font-bricolage font-semibold text-base tracking-tight transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          <ArrowLeft className="w-5 h-5 text-[#303030]" />
          <span>Previous</span>
        </button>

        {/* Continue/Create Button (Primary Button - Dark) */}
        <button
          onClick={handleSubmit}
          disabled={isCreating}
          className="h-[46px] px-6 bg-[#181818] shadow-md hover:bg-[#2c2c2c] active:scale-[0.98] rounded-full flex items-center justify-center gap-1.5 text-white font-bricolage font-semibold text-base tracking-tight transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer min-w-[150px]"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-5 h-5 mr-1.5 animate-spin text-white" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <span>Create Paper</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
