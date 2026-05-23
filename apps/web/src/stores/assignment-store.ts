import { create } from "zustand";
import type {
  Assignment,
  QuestionPaper,
  CreateAssignmentInput,
  QuestionConfig,
} from "@vedaai/shared";
import * as api from "@/lib/api";

interface WizardData {
  title: string;
  subject: string;
  grade: string;
  dueDate?: string;
  instructions?: string;
  questionConfig: QuestionConfig[];
  sourceFileName?: string;
  sourceFileContent?: string;
}

interface AssignmentState {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  currentPaper: QuestionPaper | null;
  isLoadingList: boolean;
  isLoadingDetail: boolean;
  isLoadingPaper: boolean;
  isCreating: boolean;
  isRegenerating: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  searchQuery: string;
  statusFilter: string | null;

  currentStep: number;
  wizardData: WizardData;

  fetchAssignments: () => Promise<void>;
  fetchAssignment: (id: string) => Promise<void>;
  fetchPaper: (paperId: string) => Promise<void>;
  setSearch: (query: string) => void;
  setStatusFilter: (status: string | null) => void;
  setPage: (page: number) => void;
  createAssignment: (data: CreateAssignmentInput) => Promise<Assignment>;
  deleteAssignment: (id: string) => Promise<void>;
  regenerate: (id: string) => Promise<void>;
  clearCurrentAssignment: () => void;

  setStep: (step: number) => void;
  updateWizardData: (data: Partial<WizardData>) => void;
  resetWizard: () => void;
}

const initialWizardData: WizardData = {
  title: "",
  subject: "",
  grade: "",
  dueDate: undefined,
  instructions: undefined,
  questionConfig: [
    { type: "mcq", count: 5, marksPerQuestion: 1 },
  ],
  sourceFileName: undefined,
  sourceFileContent: undefined,
};

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  assignments: [],
  currentAssignment: null,
  currentPaper: null,
  isLoadingList: false,
  isLoadingDetail: false,
  isLoadingPaper: false,
  isCreating: false,
  isRegenerating: false,
  error: null,
  pagination: { page: 1, totalPages: 1, total: 0 },
  searchQuery: "",
  statusFilter: null,

  currentStep: 0,
  wizardData: { ...initialWizardData },

  fetchAssignments: async () => {
    const { searchQuery, statusFilter, pagination } = get();
    set({ isLoadingList: true, error: null });
    try {
      const result = await api.listAssignments({
        search: searchQuery || undefined,
        status: (statusFilter as "pending" | "processing" | "done" | "failed") || undefined,
        page: pagination.page,
        limit: 12,
      });
      set({
        assignments: result.items,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
        },
        isLoadingList: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch assignments",
        isLoadingList: false,
      });
    }
  },

  fetchAssignment: async (id: string) => {
    set({ isLoadingDetail: true, error: null });
    try {
      const assignment = await api.getAssignment(id);
      set({ currentAssignment: assignment, isLoadingDetail: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch assignment",
        isLoadingDetail: false,
      });
    }
  },

  fetchPaper: async (paperId: string) => {
    set({ isLoadingPaper: true, error: null });
    try {
      const paper = await api.getQuestionPaper(paperId);
      set({ currentPaper: paper, isLoadingPaper: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch paper",
        isLoadingPaper: false,
      });
    }
  },

  setSearch: (query: string) => {
    set({ searchQuery: query, pagination: { ...get().pagination, page: 1 } });
  },

  setStatusFilter: (status: string | null) => {
    set({ statusFilter: status, pagination: { ...get().pagination, page: 1 } });
  },

  setPage: (page: number) => {
    set({ pagination: { ...get().pagination, page } });
  },

  createAssignment: async (data: CreateAssignmentInput) => {
    set({ isCreating: true, error: null });
    try {
      const assignment = await api.createAssignment(data);
      set({ isCreating: false });
      return assignment;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to create assignment",
        isCreating: false,
      });
      throw err;
    }
  },

  deleteAssignment: async (id: string) => {
    set({ error: null });
    try {
      await api.deleteAssignment(id);
      // Refresh list or remove from local state
      await get().fetchAssignments();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete assignment",
      });
    }
  },

  regenerate: async (id: string) => {
    set({ isRegenerating: true, error: null });
    try {
      const assignment = await api.regenerateAssignment(id);
      set({ currentAssignment: assignment, currentPaper: null, isRegenerating: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to regenerate",
        isRegenerating: false,
      });
    }
  },

  clearCurrentAssignment: () => {
    set({ currentAssignment: null, currentPaper: null, error: null });
  },

  setStep: (step: number) => {
    set({ currentStep: step });
  },

  updateWizardData: (data: Partial<WizardData>) => {
    set({ wizardData: { ...get().wizardData, ...data } });
  },

  resetWizard: () => {
    set({ currentStep: 0, wizardData: { ...initialWizardData } });
  },
}));
