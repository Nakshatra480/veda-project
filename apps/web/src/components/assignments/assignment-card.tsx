"use client";

import Link from "next/link";
import { format } from "date-fns";
import { MoreVertical, Eye, Trash2 } from "lucide-react";
import type { Assignment } from "@vedaai/shared";
import { useState, useRef, useEffect } from "react";
import { useAssignmentStore } from "@/stores/assignment-store";
import { useRouter } from "next/navigation";

const statusLabel: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  done: "Completed",
  failed: "Failed",
};

export function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const deleteAssignment = useAssignmentStore((s) => s.deleteAssignment);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const assignedDate = assignment.createdAt
    ? format(new Date(assignment.createdAt), "dd-MM-yyyy")
    : "—";
  const dueDate = assignment.dueDate
    ? format(new Date(assignment.dueDate), "dd-MM-yyyy")
    : null;

  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow duration-200 overflow-visible"
      style={{ minHeight: "120px" }}>

      {/* Card body */}
      <div className="p-5 pb-4 flex flex-col gap-2 flex-1">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-[#303030] line-clamp-2 flex-1 leading-snug"
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              letterSpacing: "-0.03em",
            }}
          >
            {assignment.title}
          </h3>

          {/* 3-dot menu */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen((v) => !v); }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[rgba(94,94,94,0.6)]"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div
                className="absolute right-0 top-9 z-50 bg-white rounded-xl border border-gray-100 shadow-[0px_8px_24px_rgba(0,0,0,0.12)] py-1 min-w-[160px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[#303030] hover:bg-gray-50 transition-colors text-left"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "14px", fontWeight: 500 }}
                  onClick={() => { setMenuOpen(false); router.push(`/assignments/${assignment._id}`); }}
                >
                  <Eye className="w-4 h-4 text-[rgba(94,94,94,0.7)]" />
                  View Assignment
                </button>
                <button
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors text-left"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "14px", fontWeight: 500 }}
                  onClick={async () => {
                    setMenuOpen(false);
                    if (confirm("Delete this assignment?")) {
                      await deleteAssignment(assignment._id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: dates */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <p
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 400,
            fontSize: "13px",
            color: "rgba(94,94,94,0.8)",
            letterSpacing: "-0.02em",
          }}
        >
          <span className="font-semibold text-[#303030]">Assigned on</span> : {assignedDate}
        </p>
        {dueDate && (
          <p
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 400,
              fontSize: "13px",
              color: "rgba(94,94,94,0.8)",
              letterSpacing: "-0.02em",
            }}
          >
            <span className="font-semibold text-[#303030]">Due</span> : {dueDate}
          </p>
        )}
      </div>
    </div>
  );
}
