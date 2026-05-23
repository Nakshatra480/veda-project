"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Filter, Search } from "lucide-react";
import { ASSIGNMENT_STATUS } from "@vedaai/shared";
import { useAssignmentStore } from "@/stores/assignment-store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/assignments/empty-state";
import { AssignmentGrid } from "@/components/assignments/assignment-grid";
import { cn } from "@/lib/utils";

const statusFilters = [
  { label: "All", value: null },
  { label: "Pending", value: ASSIGNMENT_STATUS.PENDING },
  { label: "Processing", value: ASSIGNMENT_STATUS.PROCESSING },
  { label: "Completed", value: ASSIGNMENT_STATUS.DONE },
  { label: "Failed", value: ASSIGNMENT_STATUS.FAILED },
];

export default function AssignmentsPage() {
  const assignments = useAssignmentStore((state) => state.assignments);
  const isLoadingList = useAssignmentStore((state) => state.isLoadingList);
  const error = useAssignmentStore((state) => state.error);
  const statusFilter = useAssignmentStore((state) => state.statusFilter);
  const searchQuery = useAssignmentStore((state) => state.searchQuery);
  const pagination = useAssignmentStore((state) => state.pagination);

  const setStatusFilter = useAssignmentStore((state) => state.setStatusFilter);
  const setPage = useAssignmentStore((state) => state.setPage);
  const fetchAssignments = useAssignmentStore((state) => state.fetchAssignments);
  const setSearch = useAssignmentStore((state) => state.setSearch);

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync local search term if store search changes externally
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce search query update in the store
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchQuery) {
        setSearch(localSearch);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [localSearch, searchQuery, setSearch]);

  // Auto-fetch whenever dependencies change
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments, searchQuery, statusFilter, pagination.page]);

  const handleFilterChange = (value: string | null) => {
    setStatusFilter(value);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  // Helper to format assigned and due dates to standard Figma DD-MM-YYYY format
  const formatMobileDate = (dateString?: string | Date) => {
    if (!dateString) return "20-06-2025";
    try {
      const d = new Date(dateString);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return "20-06-2025";
    }
  };

  return (
    <div className="w-full">
      {/* ── Desktop Viewport Layout ── */}
      <div className="hidden md:block max-w-7xl mx-auto pb-24">
        {/* Title block with status dot */}
        <div className="flex items-start gap-3.5 mb-6">
          {/* Ellipse 10 - Green status dot */}
          <div className="w-[12px] h-[12px] rounded-full bg-[#4BC26D] border-[4px] border-[#4BC26D]/40 shadow-[0px_16px_48px_rgba(0,0,0,0.12),_0px_32px_48px_rgba(0,0,0,0.2)] mt-2 flex-shrink-0" />
          <div className="flex flex-col">
            <h1 className="font-bricolage text-[20px] font-bold text-[#303030] leading-[140%] tracking-[-0.04em]">
              Assignments
            </h1>
            <p className="font-bricolage text-[14px] text-[rgba(94,94,94,0.55)] font-normal leading-[140%] tracking-[-0.04em]">
              Manage and create assignments for your classes.
            </p>
          </div>
        </div>

        {/* Filter and Search White Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0px_4px_16px_rgba(0,0,0,0.02)]">
          {/* Filter List */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide pb-1 md:pb-0">
            <span className="text-[14px] font-medium text-neutral-500 mr-2 flex items-center gap-1">
              <span className="opacity-70 font-bricolage">Filter By</span>
            </span>
            {statusFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => handleFilterChange(filter.value)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all whitespace-nowrap",
                  statusFilter === filter.value
                    ? "bg-[#272727] text-white"
                    : "bg-[#F5F5F7] text-[#303030] hover:bg-neutral-200"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-[320px] flex-shrink-0">
            <input
              type="text"
              placeholder="Search Assignment"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-10 px-6 rounded-full border border-neutral-200 bg-white font-bricolage text-[14px] text-[#303030] placeholder:text-[#A9A9A9] focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Main content grid */}
        {error ? (
          <div className="w-full max-w-[500px] bg-[#FFF5F5] border border-[#FED7D7] rounded-[24px] p-8 flex flex-col justify-center items-center text-center gap-4 mx-auto my-12 shadow-sm">
            {/* Exclamation point warning icon inside circle */}
            <div className="w-12 h-12 rounded-full bg-white border-[2.5px] border-[#E53E3E] flex items-center justify-center text-[#E53E3E] font-bricolage font-bold text-[22px] shadow-sm select-none">
              !
            </div>
            
            <h3 className="font-bricolage font-bold text-[18px] text-[#9B2C2C] leading-tight">
              Failed to Load Assignments
            </h3>
            <p className="font-bricolage text-[14px] text-[#C53030]/80 mt-[-4px]">
              {error}
            </p>
            
            <button
              onClick={() => fetchAssignments()}
              className="h-9 px-6 bg-white border border-[#FEB2B2] hover:bg-red-50/50 active:scale-[0.98] rounded-xl text-[#C53030] font-bricolage font-semibold text-[14px] transition-all duration-200 mt-2 shadow-sm"
            >
              Try Again
            </button>
          </div>
        ) : isLoadingList ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className="flex justify-between mb-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-px w-full mb-3" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <AssignmentGrid assignments={assignments} />

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={cn(
                      "w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                      pagination.page === i + 1
                        ? "bg-[#272727] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Floating Center Create Button */}
        <div className="fixed bottom-6 left-[calc(50%+152px)] -translate-x-1/2 z-40 hidden md:block">
          <Link href="/assignments/create">
            <button
              className="h-[46px] px-6 bg-[#181818] shadow-[0px_16px_48px_rgba(0,0,0,0.12),_0px_32px_48px_rgba(0,0,0,0.2)] hover:bg-[#2c2c2c] active:scale-[0.98] rounded-full flex items-center justify-center gap-2 text-white transition-all duration-200"
            >
              <span
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "14px", letterSpacing: "-0.04em" }}
              >
                + Create Assignment
              </span>
            </button>
          </Link>
        </div>

        {/* Floating Button for Mobile */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <Link href="/assignments/create">
            <button
              className="h-[46px] px-6 bg-[#181818] shadow-[0px_16px_48px_rgba(0,0,0,0.12),_0px_32px_48px_rgba(0,0,0,0.2)] hover:bg-[#2c2c2c] active:scale-[0.98] rounded-full flex items-center justify-center gap-2 text-white transition-all duration-200"
            >
              <span
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "14px", letterSpacing: "-0.04em" }}
              >
                + Create Assignment
              </span>
            </button>
          </Link>
        </div>
      </div>

      {/* ── Mobile Viewport Layout (Figma Frame 1984077582 - Pixel-Perfect) ── */}
      <div 
        className="block md:hidden w-full max-w-[373px] mx-auto pb-36 flex flex-col gap-6 select-none relative"
      >
        
        {/* Back and Title Header Row (Frame 1984077583) */}
        <div className="flex items-center justify-between h-[48px] w-full">
          {/* Back button circular wrapper - Frame 1984077380 */}
          <Link 
            href="/dashboard" 
            className="w-[48px] h-[48px] bg-white/25 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md active:scale-95 transition-all shadow-sm"
            style={{ borderRadius: "100px" }}
          >
            <ArrowLeft className="w-5 h-5 text-[#303030]" strokeWidth={2.5} />
          </Link>
          
          {/* Assignments Label - Frame 1618872418 */}
          <div className="flex items-center justify-center h-[22px] flex-1">
            <span
              className="text-[#303030] font-bold text-[16px] leading-[140%] tracking-[-0.04em] text-center"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
              }}
            >
              Assignments
            </span>
          </div>

          {/* Empty placeholder for alignment balance */}
          <div className="w-[48px] h-[48px] pointer-events-none" />
        </div>

        {/* Filter and Search White Card (Default) */}
        <div className="w-full h-[64px] bg-white rounded-[16px] flex items-center justify-between px-4 gap-4 shadow-[0px_4px_16px_rgba(0,0,0,0.02)]">
          {/* Filter icon and text label (Frame 1984077338) */}
          <div className="flex items-center gap-[6px] text-[#A9A9A9]">
            <Filter className="w-5 h-5 text-[#A9A9A9]" strokeWidth={2.2} />
            <span 
              className="text-[14px] font-normal leading-[140%] tracking-[-0.04em]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Filter
            </span>
          </div>
          
          {/* Search bar capsule (Frame 1984077230) */}
          <div className="w-[228px] h-[44px] border border-neutral-200 rounded-full flex items-center gap-2 px-4 bg-white flex-shrink-0">
            <Search className="w-4 h-4 text-[#A9A9A9]" strokeWidth={2.2} />
            <input
              type="text"
              placeholder="Search Name"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-transparent border-none text-xs text-[#303030] placeholder:text-[#A9A9A9] focus:outline-none font-bricolage font-normal leading-normal"
            />
          </div>
        </div>

        {/* Main List Rendering */}
        {error ? (
          <div className="w-full bg-white/75 border border-red-100 rounded-[24px] p-6 flex flex-col justify-center items-center text-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-white border-[2px] border-[#E53E3E] flex items-center justify-center text-[#E53E3E] font-bricolage font-bold text-[18px]">
              !
            </div>
            <h3 className="font-bricolage font-bold text-[16px] text-[#9B2C2C]">
              Failed to Load Assignments
            </h3>
            <button
              onClick={() => fetchAssignments()}
              className="h-8 px-4 bg-white border border-[#FEB2B2] rounded-xl text-[#C53030] font-bricolage font-semibold text-[12px] transition-all"
            >
              Try Again
            </button>
          </div>
        ) : isLoadingList ? (
          <div className="flex flex-col gap-[20px] w-full">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-full h-[116px] bg-white/50 border border-white/10 rounded-[24px] p-5 flex flex-col justify-between animate-pulse">
                <div className="flex items-start justify-between w-full">
                  <div className="h-5 bg-gray-300 rounded-[10px] w-2/3" />
                  <div className="h-5 bg-gray-300 rounded-full w-5" />
                </div>
                <div className="flex justify-between w-full mt-4">
                  <div className="h-4 bg-gray-300 rounded-[10px] w-5/12" />
                  <div className="h-4 bg-gray-300 rounded-[10px] w-4/12" />
                </div>
              </div>
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <EmptyState />
        ) : (
          /* Cards list column - Frame 1984077577 */
          <div className="flex flex-col gap-[20px] w-full">
            {assignments.map((assignment) => (
              <div
                key={assignment._id}
                className="w-full min-h-[116px] bg-white/75 border border-white/20 rounded-[24px] p-5 flex flex-col justify-between shadow-[0px_4px_16px_rgba(0,0,0,0.02)] hover:border-orange-500/20 transition-all duration-300 relative"
              >
                {/* Header row: title + options (Frame 1618872420) */}
                <div className="flex items-start justify-between gap-3 w-full">
                  <h3 
                    className="text-[#303030] font-bold text-[18px] leading-[140%] tracking-[-0.04em] line-clamp-1"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    {assignment.title}
                  </h3>
                  <button className="w-6 h-6 flex items-center justify-center text-black cursor-pointer hover:opacity-75 transition-opacity flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-black" fill="currentColor">
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  </button>
                </div>

                {/* Dates row: Assigned on + Due (Frame 1618872443) */}
                <div className="flex flex-row items-center justify-between gap-2 w-full mt-4 flex-wrap">
                  <span 
                    className="text-[#303030] font-extrabold text-[16px] leading-[120%] tracking-[-0.04em] truncate"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Assigned on : {formatMobileDate(assignment.createdAt)}
                  </span>
                  <span 
                    className="text-[#303030] font-extrabold text-[16px] leading-[120%] tracking-[-0.04em]"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Due : {formatMobileDate(assignment.dueDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
