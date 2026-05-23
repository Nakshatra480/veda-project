"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Search,
  Activity,
  GraduationCap,
  X,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Loader2,
  Trash2,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Group {
  _id: string;
  name: string;
  subject: string;
  grade: string;
  section: string;
  students: string[];
  assignmentsCompleted: number;
  averageScore: number;
  createdAt: string;
}

interface GroupStats {
  totalGroups: number;
  totalStudents: number;
  overallAvg: number;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [stats, setStats] = useState<GroupStats>({ totalGroups: 0, totalStudents: 0, overallAvg: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Create group modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newGrade, setNewGrade] = useState("6th");
  const [newSection, setNewSection] = useState("A");
  const [newStudentsRaw, setNewStudentsRaw] = useState("");

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ─── Fetch groups ──────────────────────────────────────────────────────────

  const fetchGroups = useCallback(async (search?: string) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.set("search", search);

      const res = await fetch(`${API_BASE}/api/groups?${params}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Server error ${res.status}`);
      }

      setGroups(json.data.items);
      setStats(json.data.stats);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load groups.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      fetchGroups(searchTerm || undefined);
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm, fetchGroups]);

  // ─── Create group ──────────────────────────────────────────────────────────

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newSubject.trim()) return;

    const studentList = newStudentsRaw
      ? newStudentsRaw.split("\n").map((s) => s.trim()).filter(Boolean)
      : [];

    setIsCreating(true);
    setCreateError(null);

    try {
      const res = await fetch(`${API_BASE}/api/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${newGrade} - ${newGroupName.trim()}`,
          subject: newSubject.trim(),
          grade: newGrade,
          section: newSection,
          students: studentList,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Server error ${res.status}`);
      }

      // Prepend the new group and refresh stats
      await fetchGroups(searchTerm || undefined);

      setIsCreateOpen(false);
      // Reset form
      setNewGroupName("");
      setNewSubject("");
      setNewGrade("6th");
      setNewSection("A");
      setNewStudentsRaw("");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create group.");
    } finally {
      setIsCreating(false);
    }
  };

  // ─── Delete group ──────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/groups/${id}`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Delete failed");
      }

      // Close roster if it's the deleted group
      if (selectedGroup?._id === id) setSelectedGroup(null);
      await fetchGroups(searchTerm || undefined);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 px-4 animate-in fade-in slide-in-from-bottom-3 duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-bricolage text-[#303030] flex items-center gap-2">
            <Users className="w-8 h-8 text-[#F97316]" />
            My Class Groups
          </h1>
          <p className="text-sm text-neutral-500 font-sans mt-1">
            Organize student cohorts, check rosters, and manage assignment distributions.
          </p>
        </div>
        <Button
          onClick={() => { setIsCreateOpen(true); setCreateError(null); }}
          className="bg-[#272727] hover:bg-[#1f1f1f] text-white rounded-full px-5 py-2.5 flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Create New Group
        </Button>
      </div>

      {/* Statistics capsules */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Cohorts", val: isLoading ? "—" : stats.totalGroups, icon: GraduationCap, bg: "bg-orange-50", border: "border-orange-100", icon_color: "text-[#F97316]" },
          { label: "Total Students", val: isLoading ? "—" : stats.totalStudents, icon: Users, bg: "bg-blue-50", border: "border-blue-100", icon_color: "text-blue-600" },
          { label: "Average Grade Score", val: isLoading ? "—" : `${stats.overallAvg}%`, icon: Sparkles, bg: "bg-emerald-50", border: "border-emerald-100", icon_color: "text-emerald-600" },
          { label: "Active Status", val: "Optimal", icon: Activity, bg: "bg-purple-50", border: "border-purple-100", icon_color: "text-purple-600" },
        ].map((stat, idx) => (
          <Card key={idx} className="border border-neutral-100 shadow-[0px_4px_16px_rgba(0,0,0,0.03)] bg-white overflow-hidden rounded-2xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${stat.bg} ${stat.border}`}>
                <stat.icon className={`w-6 h-6 ${stat.icon_color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold font-bricolage text-[#303030] tracking-tight">{stat.val}</p>
                <p className="text-xs text-neutral-400 font-medium font-sans">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search bar */}
      <div className="w-full flex items-center gap-3 bg-white border border-neutral-100 shadow-[0px_2px_12px_rgba(0,0,0,0.02)] p-3 rounded-2xl">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search class groups or subjects..."
            className="pl-10 h-11 border-neutral-200/80 rounded-xl focus-visible:ring-[#F97316] text-neutral-700 font-sans"
          />
        </div>
        {!isLoading && (
          <Button
            variant="ghost"
            onClick={() => fetchGroups(searchTerm || undefined)}
            className="h-11 w-11 rounded-xl border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 flex-shrink-0"
            title="Refresh"
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* ── Loading State ── */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-[#F97316] animate-spin" />
          <p className="text-sm text-neutral-400 font-sans animate-pulse">Loading class groups…</p>
        </div>
      )}

      {/* ── Fetch Error State ── */}
      {!isLoading && fetchError && (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-red-100 rounded-3xl p-8">
          <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-neutral-700 mb-1">Failed to Load Groups</h3>
          <p className="text-sm text-neutral-400 max-w-sm text-center mb-6">{fetchError}</p>
          <Button onClick={() => fetchGroups()} variant="outline" className="rounded-full">
            Try Again
          </Button>
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && !fetchError && groups.length === 0 && (
        <div className="text-center py-16 bg-white border border-dashed border-neutral-200 rounded-3xl p-8">
          <GraduationCap className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            {searchTerm ? "No matching groups found" : "No groups yet"}
          </h3>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto mb-6">
            {searchTerm
              ? "Try a different search term."
              : "Create a student group to distribute assignments and track overall marks."}
          </p>
          {!searchTerm && (
            <Button onClick={() => { setIsCreateOpen(true); setCreateError(null); }} variant="outline" className="rounded-full">
              Get Started
            </Button>
          )}
        </div>
      )}

      {/* ── Groups Grid ── */}
      {!isLoading && !fetchError && groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card
              key={group._id}
              className="group/card border border-neutral-100 hover:border-orange-500/20 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0px_8px_32px_rgba(249,115,22,0.06)] bg-white rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="bg-orange-50/50 border-orange-100 text-[#F97316] font-medium font-sans">
                    {group.subject}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-full">
                      Sec {group.section}
                    </span>
                    <button
                      onClick={() => handleDelete(group._id)}
                      disabled={deletingId === group._id}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover/card:opacity-100"
                      title="Delete group"
                    >
                      {deletingId === group._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <CardTitle className="text-xl font-bold font-bricolage text-[#303030] mt-3 group-hover/card:text-[#F97316] transition-colors">
                  {group.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 bg-neutral-50/70 p-3 rounded-xl border border-neutral-100 text-center">
                  <div>
                    <p className="text-base font-bold text-neutral-700 font-bricolage">{group.students.length}</p>
                    <p className="text-[10px] text-neutral-400 font-sans uppercase font-semibold">Students</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-neutral-700 font-bricolage">{group.assignmentsCompleted}</p>
                    <p className="text-[10px] text-neutral-400 font-sans uppercase font-semibold">Completed</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-neutral-700 font-bricolage">
                      {group.averageScore > 0 ? `${group.averageScore}%` : "—"}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-sans uppercase font-semibold">Avg Score</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedGroup(group)}
                    variant="outline"
                    className="w-full rounded-xl text-neutral-600 font-medium hover:bg-neutral-50"
                  >
                    View Roster
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-12 h-10 border border-neutral-100 rounded-xl flex items-center justify-center text-neutral-400 group-hover/card:text-[#F97316] group-hover/card:border-orange-100 transition-all"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Roster Modal ── */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-100 w-full max-w-lg rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedGroup(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F97316]">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-bricolage text-[#303030]">{selectedGroup.name}</h3>
                <p className="text-xs text-neutral-400 font-sans">
                  {selectedGroup.subject} • Section {selectedGroup.section} • {selectedGroup.students.length} Students
                </p>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-4">
              <h4 className="text-sm font-semibold text-neutral-700 mb-3 font-sans">Student Directory</h4>

              {selectedGroup.students.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400 font-sans">No students added to this group yet.</p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                  {selectedGroup.students.map((student, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-50/70 border border-transparent hover:border-neutral-100 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-orange-50 text-[#F97316] font-bold font-bricolage text-xs flex items-center justify-center flex-shrink-0">
                          {student.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-neutral-700 font-medium font-sans">{student}</span>
                      </div>
                      <Badge variant="outline" className="bg-neutral-50 text-neutral-400 font-normal text-[10px]">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedGroup(null)} className="rounded-xl px-5 bg-neutral-900 text-white hover:bg-neutral-800">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Group Modal ── */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-100 w-full max-w-xl rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { setIsCreateOpen(false); setCreateError(null); }}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F97316]">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-bricolage text-[#303030]">Create Class Group</h3>
                <p className="text-xs text-neutral-400 font-sans">Define a new class cohort to map assignments.</p>
              </div>
            </div>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 font-sans">{createError}</p>
              </div>
            )}

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label htmlFor="new-subject" className="text-xs font-semibold text-neutral-600 font-sans">
                    Subject Title <span className="text-red-400">*</span>
                  </label>
                  <Input
                    id="new-subject"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Biology, Mathematics"
                    required
                    className="h-11 rounded-xl"
                    disabled={isCreating}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="new-group-name" className="text-xs font-semibold text-neutral-600 font-sans">
                    Cohort Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    id="new-group-name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Geometry Honors"
                    required
                    className="h-11 rounded-xl"
                    disabled={isCreating}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label htmlFor="new-grade" className="text-xs font-semibold text-neutral-600 font-sans">Grade</label>
                    <select
                      id="new-grade"
                      value={newGrade}
                      onChange={(e) => setNewGrade(e.target.value)}
                      disabled={isCreating}
                      className="w-full h-11 bg-white border border-neutral-200 rounded-xl px-3 text-sm text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#F97316] disabled:opacity-60"
                    >
                      {["K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"].map((g) => (
                        <option key={g} value={g}>{g} Grade</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="new-section" className="text-xs font-semibold text-neutral-600 font-sans">Section</label>
                    <select
                      id="new-section"
                      value={newSection}
                      onChange={(e) => setNewSection(e.target.value)}
                      disabled={isCreating}
                      className="w-full h-11 bg-white border border-neutral-200 rounded-xl px-3 text-sm text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#F97316] disabled:opacity-60"
                    >
                      {["A", "B", "C", "D", "E", "F"].map((s) => (
                        <option key={s} value={s}>Sec {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="new-students" className="text-xs font-semibold text-neutral-600 font-sans flex items-center justify-between">
                  <span>Student Roster (One name per line)</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Optional — max 500 students</span>
                </label>
                <textarea
                  id="new-students"
                  value={newStudentsRaw}
                  onChange={(e) => setNewStudentsRaw(e.target.value)}
                  placeholder={"John Smith\nEmily Johnson\nMichael Brown"}
                  disabled={isCreating}
                  className="w-full h-28 p-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#F97316] font-sans resize-none disabled:opacity-60"
                />
                {newStudentsRaw && (
                  <p className="text-[10px] text-neutral-400 font-sans">
                    {newStudentsRaw.split("\n").filter((s) => s.trim()).length} student(s) entered
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-neutral-100 pt-4">
                <Button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); setCreateError(null); }}
                  variant="outline"
                  className="rounded-xl px-5 h-11"
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !newGroupName.trim() || !newSubject.trim()}
                  className="rounded-xl px-6 h-11 bg-[#F97316] text-white hover:bg-orange-600 shadow-md flex items-center gap-1.5 font-medium disabled:opacity-70"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Create Group
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
      `}</style>
    </div>
  );
}
