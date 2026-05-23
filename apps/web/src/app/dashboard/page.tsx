"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Sparkles,
  Users,
  ClipboardList,
  Library as LibraryIcon,
  Clock,
  Activity,
  GraduationCap,
  ArrowRight,
  Loader2,
  RefreshCcw,
  AlertCircle,
  Plus,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface DashboardStats {
  teacherName: string;
  schoolName: string;
  totalAssignments: number;
  totalGroups: number;
  totalStudents: number;
  overallAvg: number;
  totalLibraryResources: number;
}

interface AssignmentItem {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  status: string;
  questionConfig: Array<{ count: number; marksPerQuestion: number }>;
  generatedPaperId?: string;
  errorMessage?: string;
  createdAt: string;
}

interface GroupItem {
  _id: string;
  name: string;
  subject: string;
  grade: string;
  section: string;
  students: string[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    teacherName: "John Doe",
    schoolName: "Delhi Public School",
    totalAssignments: 0,
    totalGroups: 0,
    totalStudents: 0,
    overallAvg: 0,
    totalLibraryResources: 0,
  });

  const [recentAssignments, setRecentAssignments] = useState<AssignmentItem[]>([]);
  const [recentGroups, setRecentGroups] = useState<GroupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch workspace settings
      let teacherName = "John Doe";
      let schoolName = "Delhi Public School";
      try {
        const res = await fetch(`${API_BASE}/api/settings`);
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          if (json.data.teacherName) teacherName = json.data.teacherName;
          if (json.data.schoolName) schoolName = json.data.schoolName;
        }
      } catch (e) {
        console.error("Failed to load settings in dashboard:", e);
      }

      // 2. Fetch assignments (recent 3 items)
      let assignmentsList: AssignmentItem[] = [];
      let assignmentsCount = 0;
      try {
        const res = await fetch(`${API_BASE}/api/assignments?limit=3&page=1`);
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          assignmentsList = json.data.items || [];
          assignmentsCount = json.data.total || 0;
        }
      } catch (e) {
        console.error("Failed to load assignments in dashboard:", e);
      }

      // 3. Fetch groups and stats
      let groupsList: GroupItem[] = [];
      let groupsCount = 0;
      let totalStudentsCount = 0;
      let overallAvgScore = 0;
      try {
        const res = await fetch(`${API_BASE}/api/groups?limit=3`);
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          groupsList = json.data.items || [];
          if (json.data.stats) {
            groupsCount = json.data.stats.totalGroups || 0;
            totalStudentsCount = json.data.stats.totalStudents || 0;
            overallAvgScore = json.data.stats.overallAvg || 0;
          }
        }
      } catch (e) {
        console.error("Failed to load groups in dashboard:", e);
      }

      // 4. Fetch library items count
      let libraryCount = 0;
      try {
        const res = await fetch(`${API_BASE}/api/library?limit=1`);
        const json = await res.json();
        if (res.ok && json.success && json.data && json.data.stats) {
          libraryCount = json.data.stats.total || 0;
        }
      } catch (e) {
        console.error("Failed to load library items in dashboard:", e);
      }

      // Update state
      setStats({
        teacherName,
        schoolName,
        totalAssignments: assignmentsCount,
        totalGroups: groupsCount,
        totalStudents: totalStudentsCount,
        overallAvg: overallAvgScore,
        totalLibraryResources: libraryCount,
      });
      setRecentAssignments(assignmentsList);
      setRecentGroups(groupsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="max-w-7xl mx-auto pb-24">
      {/* Header section with active status dot */}
      <div className="flex items-start gap-3.5 mb-6">
        <div className="w-[12px] h-[12px] rounded-full bg-[#4BC26D] border-[4px] border-[#4BC26D]/40 shadow-[0px_16px_48px_rgba(0,0,0,0.12),_0px_32px_48px_rgba(0,0,0,0.2)] mt-2 flex-shrink-0 animate-pulse" />
        <div className="flex flex-col">
          <h1 className="font-bricolage text-[20px] font-bold text-[#303030] leading-[140%] tracking-[-0.04em]">
            Home Dashboard
          </h1>
          <p className="font-bricolage text-[14px] text-[rgba(94,94,94,0.55)] font-normal leading-[140%] tracking-[-0.04em]">
            Your central workspace command center.
          </p>
        </div>
      </div>

      {error ? (
        <div className="w-full max-w-[500px] bg-[#FFF5F5] border border-[#FED7D7] rounded-[24px] p-8 flex flex-col justify-center items-center text-center gap-4 mx-auto my-12 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-white border-[2.5px] border-[#E53E3E] flex items-center justify-center text-[#E53E3E] font-bricolage font-bold text-[22px] shadow-sm select-none">
            !
          </div>
          <h3 className="font-bricolage font-bold text-[18px] text-[#9B2C2C] leading-tight">
            Failed to Load Dashboard Data
          </h3>
          <p className="font-bricolage text-[14px] text-[#C53030]/80 mt-[-4px]">
            {error}
          </p>
          <button
            onClick={() => fetchDashboardData()}
            className="h-9 px-6 bg-white border border-[#FEB2B2] hover:bg-red-50/50 active:scale-[0.98] rounded-xl text-[#C53030] font-bricolage font-semibold text-[14px] transition-all duration-200 mt-2 shadow-sm"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Greeting Box */}
          <div className="relative overflow-hidden rounded-[24px] border border-gray-100 p-6 md:p-8 bg-white shadow-[0px_4px_24px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute w-[600px] h-[200px] -right-[150px] -bottom-[100px] bg-gradient-to-r from-orange-400/5 to-purple-400/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="flex flex-col gap-1.5 z-10 text-center md:text-left">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-[250px] mb-2" />
                  <Skeleton className="h-5 w-[350px]" />
                </>
              ) : (
                <>
                  <h2 className="font-bricolage font-bold text-2xl text-[#303030] tracking-[-0.04em]">
                    Welcome back, {stats.teacherName}!
                  </h2>
                  <p className="font-bricolage text-[15px] text-[#5E5E5E] tracking-[-0.03em] max-w-xl">
                    Here is what's happening at <span className="font-semibold text-neutral-800">{stats.schoolName}</span>. Your workspace is synchronized and ready for new question paper builds.
                  </p>
                </>
              )}
            </div>

            <Link href="/assignments/create" className="z-10 flex-shrink-0">
              <Button
                className="h-[44px] px-6 bg-[#181818] hover:bg-[#2c2c2c] active:scale-[0.98] rounded-full text-white font-bricolage font-semibold text-[14px] tracking-[-0.03em] flex items-center gap-1.5 shadow-md"
              >
                <Sparkles className="w-4 h-4 text-white fill-white animate-pulse" />
                Generate Assignment
              </Button>
            </Link>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat Item 1: Total Assignments */}
            <Card className="border border-neutral-100 bg-white rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.01)] overflow-hidden transition-all duration-200 hover:-translate-y-0.5">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-neutral-400 font-bricolage">Total Papers</span>
                  {isLoading ? (
                    <Skeleton className="h-8 w-12 mt-1" />
                  ) : (
                    <span className="text-2xl font-bold text-neutral-800 font-bricolage">{stats.totalAssignments}</span>
                  )}
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                  <ClipboardList className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Stat Item 2: Class Groups */}
            <Card className="border border-neutral-100 bg-white rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.01)] overflow-hidden transition-all duration-200 hover:-translate-y-0.5">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-neutral-400 font-bricolage">Class Groups</span>
                  {isLoading ? (
                    <Skeleton className="h-8 w-12 mt-1" />
                  ) : (
                    <span className="text-2xl font-bold text-neutral-800 font-bricolage">{stats.totalGroups}</span>
                  )}
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <Users className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Stat Item 3: Resource Library */}
            <Card className="border border-neutral-100 bg-white rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.01)] overflow-hidden transition-all duration-200 hover:-translate-y-0.5">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-neutral-400 font-bricolage">Library Items</span>
                  {isLoading ? (
                    <Skeleton className="h-8 w-12 mt-1" />
                  ) : (
                    <span className="text-2xl font-bold text-neutral-800 font-bricolage">{stats.totalLibraryResources}</span>
                  )}
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <LibraryIcon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Stat Item 4: Average Student Score */}
            <Card className="border border-neutral-100 bg-white rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.01)] overflow-hidden transition-all duration-200 hover:-translate-y-0.5">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-neutral-400 font-bricolage">Overall Average</span>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <span className="text-2xl font-bold text-neutral-800 font-bricolage">
                      {stats.overallAvg > 0 ? `${stats.overallAvg.toFixed(1)}%` : "N/A"}
                    </span>
                  )}
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Layout Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Recent Assignments & Activity */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bricolage font-bold text-[16px] text-neutral-700 tracking-[-0.03em] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-orange-500" />
                  Recent Assignments
                </h3>
                <Link href="/assignments" className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 transition-colors flex items-center gap-0.5">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-[96px] w-full rounded-2xl" />
                  <Skeleton className="h-[96px] w-full rounded-2xl" />
                </div>
              ) : recentAssignments.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-neutral-200 p-8 flex flex-col items-center justify-center text-center bg-white">
                  <ClipboardList className="w-8 h-8 text-neutral-300 mb-2" />
                  <h4 className="font-bricolage font-bold text-neutral-700 text-sm">No assignments created yet</h4>
                  <p className="text-neutral-400 text-xs mt-0.5 max-w-[280px]">
                    Create your first AI-assisted student exam paper in seconds.
                  </p>
                  <Link href="/assignments/create" className="mt-3">
                    <Button size="sm" variant="outline" className="rounded-full text-xs font-semibold">
                      Create Paper
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentAssignments.map((assignment) => {
                    const totalQ = assignment.questionConfig?.reduce((sum, qc) => sum + qc.count, 0) || 0;
                    const totalM = assignment.questionConfig?.reduce((sum, qc) => sum + qc.count * qc.marksPerQuestion, 0) || 0;
                    
                    return (
                      <div
                        key={assignment._id}
                        className="rounded-2xl border border-neutral-100 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0px_2px_8px_rgba(0,0,0,0.01)] transition-all hover:border-neutral-200"
                      >
                        <div className="flex items-start gap-3">
                          {/* Subject Icon Cover */}
                          <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-neutral-400" />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <h4 className="font-bricolage font-bold text-[15px] text-neutral-800 tracking-[-0.03em] truncate max-w-[280px] sm:max-w-[360px]">
                              {assignment.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {assignment.subject}
                              </span>
                              <span className="text-[11px] font-medium text-neutral-400">
                                Grade {assignment.grade}
                              </span>
                              <span className="text-[11px] text-neutral-300">•</span>
                              <span className="text-[11px] font-medium text-neutral-500">
                                {totalQ} Questions ({totalM} Marks)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-50">
                          {/* Status Badge */}
                          {assignment.status === "PROCESSING" && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-[11px] font-semibold">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Generating
                            </div>
                          )}

                          {assignment.status === "DONE" && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-semibold">
                              Ready
                            </div>
                          )}

                          {assignment.status === "FAILED" && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-[11px] font-semibold" title={assignment.errorMessage}>
                              <AlertCircle className="w-3.5 h-3.5" />
                              Failed
                            </div>
                          )}

                          {assignment.status === "PENDING" && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-50 border border-neutral-100 text-neutral-500 text-[11px] font-semibold">
                              Pending
                            </div>
                          )}

                          {/* Action Button */}
                          {assignment.status === "DONE" && assignment.generatedPaperId ? (
                            <Link href={`/assignments/${assignment._id}/paper`}>
                              <Button size="sm" variant="outline" className="h-8 rounded-full text-xs font-semibold px-3.5 shadow-sm">
                                View Paper
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/assignments/${assignment._id}`}>
                              <Button size="sm" variant="outline" className="h-8 rounded-full text-xs font-semibold px-3.5 shadow-sm">
                                Details
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Col: Quick Actions & Groups list */}
            <div className="flex flex-col gap-4">
              <h3 className="font-bricolage font-bold text-[16px] text-neutral-700 tracking-[-0.03em] flex items-center gap-1.5 px-1">
                <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                Quick Actions
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Action 1: Create Assignment */}
                <Link href="/assignments/create" className="col-span-2">
                  <div className="rounded-2xl border border-neutral-100 bg-white p-4 flex flex-col gap-1.5 hover:border-orange-200 hover:bg-orange-50/10 cursor-pointer transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-105 transition-transform duration-200">
                      <Plus className="w-4.5 h-4.5" />
                    </div>
                    <h4 className="font-bricolage font-bold text-[14px] text-neutral-700 mt-1">Create Paper</h4>
                    <p className="text-[11px] text-neutral-400 font-normal leading-tight">
                      Deploy AI models to build custom school exam sheets.
                    </p>
                  </div>
                </Link>

                {/* Action 2: Library */}
                <Link href="/library">
                  <div className="rounded-2xl border border-neutral-100 bg-white p-4 flex flex-col gap-1.5 hover:border-emerald-200 hover:bg-emerald-50/10 cursor-pointer transition-all group h-full">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform duration-200">
                      <LibraryIcon className="w-4 h-4" />
                    </div>
                    <h4 className="font-bricolage font-bold text-[14px] text-neutral-700 mt-1">My Library</h4>
                    <p className="text-[11px] text-neutral-400 leading-tight">
                      Upload and preview study resource items.
                    </p>
                  </div>
                </Link>

                {/* Action 3: Groups */}
                <Link href="/groups">
                  <div className="rounded-2xl border border-neutral-100 bg-white p-4 flex flex-col gap-1.5 hover:border-blue-200 hover:bg-blue-50/10 cursor-pointer transition-all group h-full">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform duration-200">
                      <Users className="w-4 h-4" />
                    </div>
                    <h4 className="font-bricolage font-bold text-[14px] text-neutral-700 mt-1">My Groups</h4>
                    <p className="text-[11px] text-neutral-400 leading-tight">
                      Register class student rosters.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
