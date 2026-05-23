"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, Download, ArrowLeft, Loader2 } from "lucide-react";
import { useAssignmentStore } from "@/stores/assignment-store";
import { useSocketStore } from "@/stores/socket-store";
import { getPaperPdfUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PaperView } from "@/components/paper/paper-view";

export default function PaperPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const currentAssignment = useAssignmentStore((state) => state.currentAssignment);
  const currentPaper = useAssignmentStore((state) => state.currentPaper);
  const isLoadingDetail = useAssignmentStore((state) => state.isLoadingDetail);
  const isLoadingPaper = useAssignmentStore((state) => state.isLoadingPaper);
  const isRegenerating = useAssignmentStore((state) => state.isRegenerating);
  const error = useAssignmentStore((state) => state.error);

  const fetchAssignment = useAssignmentStore((state) => state.fetchAssignment);
  const fetchPaper = useAssignmentStore((state) => state.fetchPaper);
  const regenerate = useAssignmentStore((state) => state.regenerate);
  const clearCurrentAssignment = useAssignmentStore((state) => state.clearCurrentAssignment);

  const {
    generationStatus,
    joinAssignment,
    leaveAssignment,
    connect,
    resetStatus,
  } = useSocketStore();

  useEffect(() => {
    fetchAssignment(id);
    connect();
    joinAssignment(id);

    return () => {
      clearCurrentAssignment();
      leaveAssignment(id);
      resetStatus();
    };
  }, [id, fetchAssignment, connect, joinAssignment, leaveAssignment, resetStatus, clearCurrentAssignment]);

  useEffect(() => {
    if (currentAssignment?.generatedPaperId) {
      fetchPaper(currentAssignment.generatedPaperId);
    }
  }, [currentAssignment?.generatedPaperId, fetchPaper]);

  useEffect(() => {
    if (generationStatus?.stage === "completed") {
      fetchAssignment(id);
      resetStatus();
    }
  }, [generationStatus, id, fetchAssignment, resetStatus]);

  const handleRegenerate = async () => {
    resetStatus();
    await regenerate(id);
    router.push(`/assignments/${id}`);
  };

  const handleDownload = () => {
    if (currentAssignment?.generatedPaperId) {
      window.open(getPaperPdfUrl(currentAssignment.generatedPaperId), "_blank");
    }
  };

  const isPageLoading = isLoadingDetail || isLoadingPaper;

  if (isPageLoading && !currentPaper) {
    return (
      <div className="w-full max-w-[1100px] mx-auto bg-[#5E5E5E] rounded-[32px] p-5 flex flex-col gap-3 min-h-[600px]">
        {/* Top Header Placeholder */}
        <div className="w-full h-[164px] bg-black/40 rounded-[32px] p-8 flex flex-col justify-between items-center animate-pulse" />
        
        {/* Paper Sheet Placeholder */}
        <div className="w-full bg-white rounded-[32px] p-8 md:p-12 space-y-6">
          <Skeleton className="h-8 w-2/3 mx-auto" />
          <Skeleton className="h-4 w-1/3 mx-auto" />
          <Skeleton className="h-px w-full" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || (!isPageLoading && !currentPaper)) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
          <RefreshCw className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Question Paper Not Available</h3>
          <p className="text-sm text-red-600 mb-6">{error || currentAssignment?.errorMessage || "The question paper has not been generated yet or failed to load."}</p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => router.push(`/assignments/${id}`)} variant="outline">
              Back to Assignment
            </Button>
            <Button onClick={handleRegenerate} disabled={isRegenerating}>
              {isRegenerating ? "Regenerating..." : "Regenerate Paper"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const subject = currentAssignment?.subject || "Science";
  const grade = currentAssignment?.grade || "8";

  return (
    <div className="w-full max-w-[1100px] mx-auto bg-[#5E5E5E] rounded-[32px] p-5 flex flex-col gap-3 shadow-lg select-none">
      
      {/* Top Header Card - Frame 1618872450 */}
      <div 
        className="w-full min-h-[164px] bg-black/80 rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6"
        style={{
          boxShadow: "0px 16px 48px rgba(0, 0, 0, 0.12)"
        }}
      >
        {/* Dynamic customized greeting message */}
        <div className="flex-1 text-center md:text-left">
          <h2 
            className="text-white tracking-[-0.04em]"
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700,
              fontSize: "20px",
              lineHeight: "140%",
            }}
          >
            Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade {grade} {subject} classes on the NCERT chapters:
          </h2>
        </div>

        {/* Download PDF button - Frame 1618872346 */}
        <button
          onClick={handleDownload}
          className="flex-shrink-0 h-[44px] px-6 bg-white hover:bg-neutral-100 active:scale-[0.98] rounded-[100px] flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.1)"
          }}
        >
          <Download className="w-5 h-5 text-[#303030]" strokeWidth={2.5} />
          <span
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: "22px",
              letterSpacing: "-0.04em",
              color: "#303030",
            }}
          >
            Download as PDF
          </span>
        </button>
      </div>

      {/* Actual Question Paper Sheet - Frame 1618872449 */}
      {currentPaper && <PaperView paper={currentPaper} />}

    </div>
  );
}
