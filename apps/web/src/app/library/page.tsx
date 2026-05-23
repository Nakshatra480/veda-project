"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Library,
  Search,
  BookOpen,
  FileText,
  Video,
  Link2,
  Plus,
  Download,
  Eye,
  Star,
  Clock,
  Filter,
  Sparkles,
  BookMarked,
  GraduationCap,
  X,
  Trash2,
  Loader2,
  AlertTriangle,
  RefreshCcw,
  CheckCircle2,
  Upload,
} from "lucide-react";

import { API_BASE } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type ResourceType = "all" | "document" | "video" | "link" | "book";

interface Resource {
  _id: string;
  title: string;
  type: "document" | "video" | "link" | "book";
  subject: string;
  grade: string;
  description: string;
  size?: string;
  duration?: string;
  url?: string;
  fileKey?: string;
  fileName?: string;
  mimeType?: string;
  starred: boolean;
  createdAt: string;
  tags: string[];
}

interface LibraryStats {
  total: number;
  starred: number;
  subjects: number;
}

const TYPE_ICON = {
  document: FileText,
  video: Video,
  link: Link2,
  book: BookOpen,
};

const TYPE_COLOR = {
  document: { bg: "bg-blue-50", border: "border-blue-100", icon: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
  video: { bg: "bg-purple-50", border: "border-purple-100", icon: "text-purple-600", badge: "bg-purple-100 text-purple-700" },
  link: { bg: "bg-green-50", border: "border-green-100", icon: "text-green-600", badge: "bg-green-100 text-green-700" },
  book: { bg: "bg-amber-50", border: "border-amber-100", icon: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [stats, setStats] = useState<LibraryStats>({ total: 0, starred: 0, subjects: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeType, setActiveType] = useState<ResourceType>("all");
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  // Create resource modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // New Resource Form Fields
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"document" | "video" | "link" | "book">("document");
  const [newSubject, setNewSubject] = useState("");
  const [newGrade, setNewGrade] = useState("8th");
  const [newDescription, setNewDescription] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newTagsRaw, setNewTagsRaw] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Delete loading state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ─── Fetch Library Items ───────────────────────────────────────────────────

  const fetchLibrary = useCallback(async (search?: string, type?: ResourceType) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.set("search", search);
      if (type && type !== "all") params.set("type", type);

      const res = await fetch(`${API_BASE}/api/library?${params}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Server error ${res.status}`);
      }

      setResources(json.data.items);
      setStats(json.data.stats);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load library resources.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  // Debounced search & type filter effect
  useEffect(() => {
    const t = setTimeout(() => {
      fetchLibrary(searchTerm || undefined, activeType);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, activeType, fetchLibrary]);

  // ─── Toggle Star ───────────────────────────────────────────────────────────

  const toggleStar = async (id: string, currentStarred: boolean) => {
    // Optimistic UI update
    setResources((prev) =>
      prev.map((r) => (r._id === id ? { ...r, starred: !currentStarred } : r))
    );
    setStats((prev) => ({
      ...prev,
      starred: prev.starred + (currentStarred ? -1 : 1),
    }));

    try {
      const res = await fetch(`${API_BASE}/api/library/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: !currentStarred }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update star status");
      }
    } catch (err) {
      console.error("Star toggle error:", err);
      // Revert optimistic update on failure
      fetchLibrary(searchTerm || undefined, activeType);
    }
  };

  // ─── Delete Resource ───────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/library/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Delete failed");
      }

      if (previewResource?._id === id) setPreviewResource(null);
      await fetchLibrary(searchTerm || undefined, activeType);
    } catch (err) {
      console.error("Delete error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete resource");
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Drag and Drop Handlers ────────────────────────────────────────────────

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadFile(file);
      // UX auto-populate title if empty
      if (!newTitle) {
        const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        setNewTitle(baseName);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      // UX auto-populate title if empty
      if (!newTitle) {
        const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        setNewTitle(baseName);
      }
    }
  };

  // ─── Create Resource ───────────────────────────────────────────────────────

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSubject.trim() || !newDescription.trim()) return;

    setIsCreating(true);
    setCreateError(null);

    const formData = new FormData();
    formData.append("title", newTitle.trim());
    formData.append("type", newType);
    formData.append("subject", newSubject.trim());
    formData.append("grade", newGrade);
    formData.append("description", newDescription.trim());

    // Clean tags
    const tags = newTagsRaw
      ? newTagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    formData.append("tags", JSON.stringify(tags));

    // Handle File upload vs Link URL
    if (newType === "link") {
      if (newUrl.trim()) formData.append("url", newUrl.trim());
    } else {
      if (uploadFile) {
        formData.append("file", uploadFile);
      } else if (newUrl.trim()) {
        formData.append("url", newUrl.trim());
      }
      if (newSize.trim()) formData.append("size", newSize.trim());
      if (newDuration.trim()) formData.append("duration", newDuration.trim());
    }

    try {
      const res = await fetch(`${API_BASE}/api/library`, {
        method: "POST",
        body: formData, // Browser sets Content-Type boundary automatically
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Server error ${res.status}`);
      }

      await fetchLibrary(searchTerm || undefined, activeType);

      setIsCreateOpen(false);
      // Reset form
      setNewTitle("");
      setNewType("document");
      setNewSubject("");
      setNewGrade("8th");
      setNewDescription("");
      setNewUrl("");
      setNewSize("");
      setNewDuration("");
      setNewTagsRaw("");
      setUploadFile(null);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to add resource.");
    } finally {
      setIsCreating(false);
    }
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 px-4 animate-in fade-in slide-in-from-bottom-3 duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-bricolage text-[#303030] flex items-center gap-2">
            <Library className="w-8 h-8 text-[#F97316]" />
            My Library
          </h1>
          <p className="text-sm text-neutral-500 font-sans mt-1">
            Organize and access all your teaching resources, textbooks, videos, and links.
          </p>
        </div>
        <button
          onClick={() => { setIsCreateOpen(true); setCreateError(null); }}
          className="bg-[#272727] hover:bg-[#1f1f1f] text-white rounded-full px-5 py-2.5 flex items-center gap-2 shadow-md transition-all active:scale-[0.98] text-sm font-medium font-bricolage"
        >
          <Plus className="w-4 h-4" />
          Add Resource
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Resources", val: isLoading ? "—" : stats.total, icon: BookMarked, bg: "bg-orange-50", border: "border-orange-100", ic: "text-[#F97316]" },
          { label: "Starred Items", val: isLoading ? "—" : stats.starred, icon: Star, bg: "bg-yellow-50", border: "border-yellow-100", ic: "text-yellow-500" },
          { label: "Subjects Covered", val: isLoading ? "—" : stats.subjects, icon: GraduationCap, bg: "bg-blue-50", border: "border-blue-100", ic: "text-blue-600" },
          { label: "AI Suggestions", val: "4 New", icon: Sparkles, bg: "bg-purple-50", border: "border-purple-100", ic: "text-purple-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-neutral-100 rounded-2xl p-5 flex items-center gap-4 shadow-[0px_4px_16px_rgba(0,0,0,0.03)]">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${stat.bg} ${stat.border}`}>
              <stat.icon className={`w-6 h-6 ${stat.ic}`} />
            </div>
            <div>
              <p className="text-2xl font-bold font-bricolage text-[#303030] tracking-tight">{stat.val}</p>
              <p className="text-xs text-neutral-400 font-medium font-sans">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white border border-neutral-100 shadow-[0px_2px_12px_rgba(0,0,0,0.02)] p-3 rounded-2xl">

        {/* Type filter tabs */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Filter className="w-4 h-4 text-neutral-400 mr-1" />
          {(["all", "document", "video", "link", "book"] as ResourceType[]).map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold font-bricolage transition-all capitalize ${
                activeType === type
                  ? "bg-[#272727] text-white shadow-sm"
                  : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-neutral-200 hidden sm:block" />

        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources by title, subject, or tag…"
            className="w-full h-10 pl-10 pr-4 border border-neutral-200 rounded-xl text-sm text-neutral-700 font-sans placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#F97316] transition-all bg-white"
          />
        </div>
      </div>

      {/* ── Loading State ── */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-[#F97316] animate-spin" />
          <p className="text-sm text-neutral-400 font-sans animate-pulse">Loading library resources…</p>
        </div>
      )}

      {/* ── Fetch Error State ── */}
      {!isLoading && fetchError && (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-red-100 rounded-3xl p-8">
          <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-neutral-700 mb-1">Failed to Load Library</h3>
          <p className="text-sm text-neutral-400 max-w-sm text-center mb-6">{fetchError}</p>
          <button
            onClick={() => fetchLibrary(searchTerm || undefined, activeType)}
            className="px-5 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-full text-xs font-semibold font-bricolage transition-all active:scale-[0.98]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !fetchError && resources.length === 0 && (
        <div className="text-center py-20 bg-white border border-dashed border-neutral-200 rounded-3xl">
          <Library className="w-14 h-14 text-neutral-200 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-neutral-700 font-bricolage mb-1">No resources found</h3>
          <p className="text-sm text-neutral-400 font-sans">
            {searchTerm || activeType !== "all"
              ? "Try adjusting your search or filter, or add a new resource."
              : "Start by adding study materials, papers, or links to your library."}
          </p>
        </div>
      )}

      {/* Resources Grid */}
      {!isLoading && !fetchError && resources.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {resources.map((resource) => {
            const Icon = TYPE_ICON[resource.type] || FileText;
            const colors = TYPE_COLOR[resource.type] || TYPE_COLOR.document;
            const downloadUrl = `${API_BASE}/api/library/${resource._id}/download`;

            return (
              <div
                key={resource._id}
                className="group bg-white border border-neutral-100 hover:border-orange-500/20 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0px_8px_32px_rgba(249,115,22,0.06)] rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
              >
                {/* Card Top */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${colors.bg} ${colors.border}`}>
                      <Icon className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleStar(resource._id, resource.starred)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          resource.starred ? "text-yellow-400" : "text-neutral-200 hover:text-yellow-300"
                        }`}
                        title={resource.starred ? "Unstar" : "Star"}
                      >
                        <Star className={`w-4 h-4 ${resource.starred ? "fill-yellow-400" : ""}`} />
                      </button>
                      <button
                        onClick={() => handleDelete(resource._id)}
                        disabled={deletingId === resource._id}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        title="Delete resource"
                      >
                        {deletingId === resource._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Type badge + grade */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-sans capitalize ${colors.badge}`}>
                      {resource.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-500 font-sans">
                      Grade {resource.grade}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-[#F97316] border border-orange-100 font-sans">
                      {resource.subject}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold font-bricolage text-[#303030] leading-snug group-hover:text-[#F97316] transition-colors line-clamp-2">
                    {resource.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-neutral-400 font-sans leading-relaxed line-clamp-2">
                    {resource.description}
                  </p>

                  {/* Meta (size/duration + date) */}
                  <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-sans mt-auto">
                    {resource.size && (
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {resource.size}
                      </span>
                    )}
                    {resource.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {resource.duration}
                      </span>
                    )}
                    <span className="ml-auto">Added {formatDate(resource.createdAt)}</span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="border-t border-neutral-100 p-3 flex items-center gap-2 bg-neutral-50/40">
                  <button
                    onClick={() => setPreviewResource(resource)}
                    className="flex-1 h-9 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 text-xs font-medium font-sans flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-9 rounded-xl bg-[#303030] hover:bg-[#1f1f1f] text-white text-xs font-medium font-sans flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {resource.type === "link" ? "Visit" : "Download"}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewResource && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-100 w-full max-w-2xl rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setPreviewResource(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 mb-5">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 ${(TYPE_COLOR[previewResource.type] || TYPE_COLOR.document).bg} ${(TYPE_COLOR[previewResource.type] || TYPE_COLOR.document).border}`}>
                {(() => { const Icon = TYPE_ICON[previewResource.type] || FileText; return <Icon className={`w-6 h-6 ${(TYPE_COLOR[previewResource.type] || TYPE_COLOR.document).icon}`} />; })()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold font-bricolage text-[#303030] leading-snug">{previewResource.title}</h3>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">
                  {previewResource.subject} • Grade {previewResource.grade}
                </p>
              </div>
            </div>

            {/* Embedded Live File Preview Panel */}
            <div className="w-full">
              {(() => {
                const absoluteUrl = previewResource.url?.startsWith("http")
                  ? previewResource.url
                  : `${API_BASE}${previewResource.url}`;

                // Check PDF
                if (
                  previewResource.mimeType?.includes("pdf") ||
                  previewResource.url?.toLowerCase().endsWith(".pdf") ||
                  previewResource.fileName?.toLowerCase().endsWith(".pdf")
                ) {
                  return (
                    <iframe
                      src={`${absoluteUrl}#toolbar=0`}
                      className="w-full h-80 rounded-xl border border-neutral-100 mb-5 shadow-inner"
                    />
                  );
                }

                // Check Video
                if (
                  previewResource.type === "video" &&
                  (previewResource.fileKey || previewResource.url?.includes("/uploads/"))
                ) {
                  return (
                    <video
                      src={absoluteUrl}
                      controls
                      className="w-full max-h-80 rounded-xl bg-neutral-900 mb-5 border border-neutral-100 shadow-md"
                    />
                  );
                }

                // Check Image
                if (
                  previewResource.mimeType?.startsWith("image/") ||
                  /\.(jpg|jpeg|png|gif|webp)$/i.test(previewResource.url || "") ||
                  /\.(jpg|jpeg|png|gif|webp)$/i.test(previewResource.fileName || "")
                ) {
                  return (
                    <div className="w-full flex items-center justify-center bg-neutral-50 border border-neutral-100 rounded-xl p-4 mb-5 max-h-80 overflow-hidden shadow-inner">
                      <img
                        src={absoluteUrl}
                        alt={previewResource.title}
                        className="max-h-72 max-w-full object-contain rounded-lg"
                      />
                    </div>
                  );
                }

                // Generic Preview Box
                return (
                  <div className="w-full flex flex-col items-center justify-center border border-neutral-100 bg-neutral-50/50 rounded-xl p-8 mb-5 text-center shadow-inner">
                    <BookMarked className="w-12 h-12 text-neutral-300 mb-3" />
                    <p className="text-xs font-semibold text-neutral-500 font-bricolage capitalize">
                      {previewResource.type} Resource Preview
                    </p>
                    <p className="text-[10px] text-neutral-400 font-sans mt-1">
                      {previewResource.fileName || "No local attachment file"}
                    </p>
                  </div>
                );
              })()}
            </div>

            <p className="text-sm text-neutral-600 font-sans leading-relaxed mb-5">
              {previewResource.description}
            </p>

            {previewResource.tags && previewResource.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {previewResource.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-neutral-100 rounded-full text-[11px] text-neutral-500 font-sans font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-3 border-t border-neutral-100 pt-4">
              <button
                onClick={() => setPreviewResource(null)}
                className="flex-1 h-10 rounded-xl border border-neutral-200 text-neutral-600 text-sm font-medium font-sans hover:bg-neutral-50 transition-all"
              >
                Close
              </button>
              <a
                href={`${API_BASE}/api/library/${previewResource._id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-10 rounded-xl bg-[#303030] hover:bg-[#1f1f1f] text-white text-sm font-medium font-sans flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                {previewResource.type === "link" ? "Open Link" : "Download"}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-100 w-full max-w-xl rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => { setIsCreateOpen(false); setCreateError(null); setUploadFile(null); }}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F97316]">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-bricolage text-[#303030]">Add Library Resource</h3>
                <p className="text-xs text-neutral-400 font-sans">Store textbooks, curriculum files, lectures, or URLs.</p>
              </div>
            </div>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 font-sans">{createError}</p>
              </div>
            )}

            <form onSubmit={handleCreateResource} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 font-sans">Resource Type</label>
                  <select
                    value={newType}
                    onChange={(e) => {
                      setNewType(e.target.value as typeof newType);
                      setUploadFile(null);
                    }}
                    disabled={isCreating}
                    className="w-full h-11 bg-white border border-neutral-200 rounded-xl px-3 text-sm text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  >
                    <option value="document">Document</option>
                    <option value="video">Video Lecture</option>
                    <option value="link">Web Link</option>
                    <option value="book">E-Book</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 font-sans">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Science, Math"
                    required
                    className="w-full h-11 border border-neutral-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                    disabled={isCreating}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 font-sans">Grade Level</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    disabled={isCreating}
                    className="w-full h-11 bg-white border border-neutral-200 rounded-xl px-3 text-sm text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  >
                    {["K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"].map((g) => (
                      <option key={g} value={g}>{g} Grade</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PREMIUM DRAG-AND-DROP FILE UPLOADER (For books, docs, videos) */}
              {newType !== "link" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 font-sans">
                    Upload Resource File
                  </label>
                  
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`relative w-full border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center text-center ${
                      dragActive
                        ? "border-[#F97316] bg-orange-50/20"
                        : "border-neutral-200 hover:border-neutral-300 bg-neutral-50/50"
                    }`}
                  >
                    <input
                      type="file"
                      id="file-upload-input"
                      onChange={handleFileChange}
                      accept={
                        newType === "document"
                          ? ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                          : newType === "book"
                          ? ".pdf,.epub,.mobi,.txt"
                          : newType === "video"
                          ? "video/*"
                          : undefined
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isCreating}
                    />

                    {uploadFile ? (
                      <div className="space-y-2 z-10 pointer-events-none">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                        <p className="text-xs font-bold text-neutral-700 max-w-md truncate font-sans">
                          {uploadFile.name}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-sans">
                          {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • Click or drag to change
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 z-10 pointer-events-none">
                        <Upload className="w-10 h-10 text-neutral-400 mx-auto" />
                        <p className="text-xs font-semibold text-neutral-600 font-sans">
                          Drag & drop your file here, or <span className="text-[#F97316] font-bold">browse</span>
                        </p>
                        <p className="text-[10px] text-neutral-400 font-sans">
                          {newType === "document" && "Supports PDF, DOCX, PPTX, XLSX, TXT"}
                          {newType === "book" && "Supports PDF, EPUB, TXT"}
                          {newType === "video" && "Supports MP4, WebM, MOV"}
                          {" (Max 100MB)"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Title Field (Gets auto-filled on file drop/select) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-600 font-sans">
                  Resource Title <span className="text-red-400">*</span>
                </label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Grade 9 Geometry Textbook Chapter 3"
                  required
                  className="w-full h-11 border border-neutral-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  disabled={isCreating}
                />
              </div>

              {/* Fallback inputs */}
              {newType === "link" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 font-sans">Resource URL</label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://example.com/materials/fractions"
                    className="w-full h-11 border border-neutral-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                    disabled={isCreating}
                  />
                </div>
              )}

              {newType !== "link" && !uploadFile && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 font-sans flex items-center justify-between">
                    <span>Or enter Resource URL</span>
                    <span className="text-[10px] text-neutral-400 font-normal">Optional</span>
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://example.com/files/lesson.pdf"
                    className="w-full h-11 border border-neutral-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                    disabled={isCreating}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {newType === "video" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-600 font-sans">Video Duration</label>
                    <input
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      placeholder="e.g. 15 min, 1.5 hours"
                      className="w-full h-11 border border-neutral-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                      disabled={isCreating}
                    />
                  </div>
                )}
                {newType !== "video" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-600 font-sans flex items-center justify-between">
                      <span>File Size</span>
                      <span className="text-[10px] text-neutral-400 font-normal">Auto-filled if uploaded</span>
                    </label>
                    <input
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      placeholder="e.g. 2.5 MB"
                      className="w-full h-11 border border-neutral-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                      disabled={isCreating}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-600 font-sans">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the content, learning outcomes, or chapters included in this resource…"
                  required
                  className="w-full h-24 p-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#F97316] resize-none"
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-600 font-sans flex items-center justify-between">
                  <span>Tags (Comma-separated)</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Optional</span>
                </label>
                <input
                  value={newTagsRaw}
                  onChange={(e) => setNewTagsRaw(e.target.value)}
                  placeholder="NCERT, Chemistry, Lab, PDF"
                  className="w-full h-11 border border-neutral-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  disabled={isCreating}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); setCreateError(null); setUploadFile(null); }}
                  className="px-5 h-11 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-xl text-sm font-medium font-sans"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newTitle.trim() || !newSubject.trim() || !newDescription.trim()}
                  className="px-6 h-11 bg-[#F97316] text-white hover:bg-orange-600 rounded-xl shadow-md flex items-center gap-1.5 font-medium text-sm transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading Resource…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Add to Library
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
      `}</style>
    </div>
  );
}
