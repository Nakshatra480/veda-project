import type {
  Assignment,
  CreateAssignmentInput,
  QuestionPaper,
  ListAssignmentsQuery,
} from "@vedaai/shared";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface PaginatedResult {
  items: Assignment[];
  total: number;
  page: number;
  totalPages: number;
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }

  return json.data as T;
}

export async function createAssignment(
  data: CreateAssignmentInput
): Promise<Assignment> {
  return request<Assignment>("/api/assignments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listAssignments(
  query?: ListAssignmentsQuery
): Promise<PaginatedResult> {
  const params = new URLSearchParams();
  if (query?.search) params.set("search", query.search);
  if (query?.status) params.set("status", query.status);
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));

  const qs = params.toString();
  return request<PaginatedResult>(`/api/assignments${qs ? `?${qs}` : ""}`);
}

export async function getAssignment(id: string): Promise<Assignment> {
  return request<Assignment>(`/api/assignments/${id}`);
}

export async function regenerateAssignment(id: string): Promise<Assignment> {
  return request<Assignment>(`/api/assignments/${id}/regenerate`, {
    method: "POST",
  });
}

export async function deleteAssignment(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/api/assignments/${id}`, {
    method: "DELETE",
  });
}

export async function getQuestionPaper(paperId: string): Promise<QuestionPaper> {
  return request<QuestionPaper>(`/api/papers/${paperId}`);
}

export function getPaperPdfUrl(paperId: string): string {
  return `${API_BASE}/api/papers/${paperId}/pdf`;
}
