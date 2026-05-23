"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
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

  return (
    <div className="max-w-7xl mx-auto pb-24">
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
                  ? "bg-[#272727] text-white shadow-sm"
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
  );
}
