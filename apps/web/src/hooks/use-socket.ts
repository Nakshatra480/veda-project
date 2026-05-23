"use client";

import { useEffect } from "react";
import { useSocketStore } from "@/stores/socket-store";

export function useSocket(assignmentId?: string) {
  const {
    connected,
    generationStatus,
    connect,
    disconnect,
    joinAssignment,
    leaveAssignment,
    resetStatus,
  } = useSocketStore();

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    if (assignmentId) {
      joinAssignment(assignmentId);

      return () => {
        leaveAssignment(assignmentId);
        resetStatus();
      };
    }
  }, [assignmentId, joinAssignment, leaveAssignment, resetStatus]);

  return {
    connected,
    generationStatus,
    resetStatus,
  };
}
