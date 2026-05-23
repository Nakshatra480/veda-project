import { create } from "zustand";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { SOCKET_EVENTS } from "@vedaai/shared";

interface GenerationStatus {
  stage: string;
  message: string;
  progress: number;
}

interface SocketState {
  connected: boolean;
  generationStatus: GenerationStatus | null;
  joinAssignment: (assignmentId: string) => void;
  leaveAssignment: (assignmentId: string) => void;
  resetStatus: () => void;
  connect: () => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  connected: false,
  generationStatus: null,

  connect: () => {
    const socket = getSocket();

    socket.off("connect");
    socket.off("disconnect");

    socket.on("connect", () => {
      set({ connected: true });
    });

    socket.on("disconnect", () => {
      set({ connected: false });
    });
  },

  disconnect: () => {
    disconnectSocket();
    set({ connected: false, generationStatus: null });
  },

  joinAssignment: (assignmentId: string) => {
    const socket = getSocket();

    socket.off(SOCKET_EVENTS.GENERATION_STARTED);
    socket.off(SOCKET_EVENTS.GENERATION_PROGRESS);
    socket.off(SOCKET_EVENTS.GENERATION_COMPLETED);
    socket.off(SOCKET_EVENTS.GENERATION_FAILED);
    socket.off(SOCKET_EVENTS.PDF_READY);

    socket.emit(SOCKET_EVENTS.JOIN_ASSIGNMENT, { assignmentId });

    socket.on(SOCKET_EVENTS.GENERATION_STARTED, () => {
      set({
        generationStatus: {
          stage: "started",
          message: "Starting question generation...",
          progress: 10,
        },
      });
    });

    socket.on(
      SOCKET_EVENTS.GENERATION_PROGRESS,
      (data: { stage: string; progress: number }) => {
        set({
          generationStatus: {
            stage: data.stage,
            message: data.stage,
            progress: data.progress,
          },
        });
      }
    );

    socket.on(SOCKET_EVENTS.GENERATION_COMPLETED, () => {
      set({
        generationStatus: {
          stage: "completed",
          message: "Question paper generated successfully!",
          progress: 100,
        },
      });
    });

    socket.on(
      SOCKET_EVENTS.GENERATION_FAILED,
      (data: { error?: string }) => {
        set({
          generationStatus: {
            stage: "failed",
            message: data.error || "Generation failed",
            progress: 0,
          },
        });
      }
    );

    socket.on(SOCKET_EVENTS.PDF_READY, () => {
      set({
        generationStatus: {
          stage: "pdf_ready",
          message: "PDF is ready for download",
          progress: 100,
        },
      });
    });
  },

  leaveAssignment: (assignmentId: string) => {
    const socket = getSocket();
    socket.off(SOCKET_EVENTS.GENERATION_STARTED);
    socket.off(SOCKET_EVENTS.GENERATION_PROGRESS);
    socket.off(SOCKET_EVENTS.GENERATION_COMPLETED);
    socket.off(SOCKET_EVENTS.GENERATION_FAILED);
    socket.off(SOCKET_EVENTS.PDF_READY);
    socket.emit("leave:assignment", { assignmentId });
  },

  resetStatus: () => {
    set({ generationStatus: null });
  },
}));
