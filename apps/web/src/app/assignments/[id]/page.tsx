"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Eye,
  RefreshCw,
  AlertTriangle,
  Clock,
  Loader2,
  BookOpen,
  Calendar,
  Hash,
} from "lucide-react";
import { QUESTION_TYPE_LABELS } from "@vedaai/shared";
import { useAssignmentStore } from "@/stores/assignment-store";
import { useSocketStore } from "@/stores/socket-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const currentAssignment = useAssignmentStore((state) => state.currentAssignment);
  const isLoadingDetail = useAssignmentStore((state) => state.isLoadingDetail);
  const isRegenerating = useAssignmentStore((state) => state.isRegenerating);
  const error = useAssignmentStore((state) => state.error);
  const fetchAssignment = useAssignmentStore((state) => state.fetchAssignment);
  const regenerate = useAssignmentStore((state) => state.regenerate);

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
      leaveAssignment(id);
      resetStatus();
    };
  }, [id, fetchAssignment, connect, joinAssignment, leaveAssignment, resetStatus]);

  // Fallback Polling: poll assignment status every 3 seconds if it's pending or processing
  useEffect(() => {
    if (!currentAssignment) return;

    const isStillProcessing =
      currentAssignment.status === "processing" ||
      currentAssignment.status === "pending";

    if (!isStillProcessing) return;

    const interval = setInterval(() => {
      fetchAssignment(id);
    }, 3000);

    return () => clearInterval(interval);
  }, [id, currentAssignment?.status, fetchAssignment]);

  // Auto-redirect to the paper view once generation is completed successfully
  useEffect(() => {
    if (currentAssignment?.status === "done" && currentAssignment?.generatedPaperId) {
      router.push(`/assignments/${id}/paper`);
    }
    if (generationStatus?.stage === "completed") {
      fetchAssignment(id);
    }
  }, [generationStatus?.stage, currentAssignment?.status, currentAssignment?.generatedPaperId, id, router, fetchAssignment]);

  const handleRegenerate = async () => {
    resetStatus();
    await regenerate(id);
    joinAssignment(id);
  };

  if (isLoadingDetail && !currentAssignment) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center py-12">
            <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
            <p className="text-gray-700 font-medium mb-1">
              Something went wrong
            </p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button variant="outline" onClick={() => fetchAssignment(id)}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentAssignment) return null;

  const assignment = currentAssignment;
  const totalQuestions = assignment.questionConfig.reduce(
    (sum, c) => sum + c.count,
    0
  );
  const totalMarks = assignment.questionConfig.reduce(
    (sum, c) => sum + c.count * c.marksPerQuestion,
    0
  );

  const isProcessing =
    assignment.status === "processing" ||
    (generationStatus &&
      generationStatus.stage !== "completed" &&
      generationStatus.stage !== "failed");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl mb-2">
                {assignment.title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{assignment.subject}</Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Grade {assignment.grade}
                </Badge>
                {assignment.dueDate && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(assignment.dueDate), "MMM d, yyyy")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {totalQuestions}
              </p>
              <p className="text-xs text-gray-500">Questions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#F97316]">{totalMarks}</p>
              <p className="text-xs text-gray-500">Total Marks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {assignment.questionConfig.length}
              </p>
              <p className="text-xs text-gray-500">Sections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {format(new Date(assignment.createdAt), "MMM d")}
              </p>
              <p className="text-xs text-gray-500">Created</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Question Configuration
            </p>
            <div className="space-y-2">
              {assignment.questionConfig.map((config, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-700">
                      {QUESTION_TYPE_LABELS[config.type] || config.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500">
                    <span>{config.count} Qs</span>
                    <span>×</span>
                    <span>{config.marksPerQuestion} marks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {isProcessing && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Generating Question Paper
                </p>
                <p className="text-sm text-gray-500">
                  {generationStatus?.message || "Preparing to generate..."}
                </p>
              </div>
            </div>
            <Progress
              value={generationStatus?.progress || 5}
              accent
              className="h-2.5"
            />
            <p className="text-xs text-gray-400 mt-2 text-right">
              {generationStatus?.progress || 0}%
            </p>
          </CardContent>
        </Card>
      )}

      {assignment.status === "done" && assignment.generatedPaperId && (
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50">
                <Eye className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Paper Ready
                </p>
                <p className="text-sm text-gray-500">
                  Your question paper has been generated
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={isRegenerating || isLoadingDetail}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button
                onClick={() =>
                  router.push(`/assignments/${id}/paper`)
                }
              >
                <Eye className="w-4 h-4 mr-2" />
                View Paper
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {assignment.status === "pending" && !isProcessing && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center py-10">
            <Clock className="w-10 h-10 text-gray-300 mb-3" />
            <p className="font-medium text-gray-700 mb-1">
              Waiting to Process
            </p>
            <p className="text-sm text-gray-500">
              This assignment is in the queue and will be processed soon.
            </p>
          </CardContent>
        </Card>
      )}

      {assignment.status === "failed" && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center py-10">
            <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
            <p className="font-medium text-gray-700 mb-1">
              Generation Failed
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {assignment.errorMessage || "An error occurred during generation."}
            </p>
            <Button onClick={handleRegenerate} disabled={isRegenerating || isLoadingDetail}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
