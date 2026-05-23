import { Server as SocketIOServer } from "socket.io";
import { SOCKET_EVENTS } from "@vedaai/shared";

export function setupSocket(io: SocketIOServer): void {
  io.on("connection", (socket) => {
    socket.on(SOCKET_EVENTS.JOIN_ASSIGNMENT, (data: { assignmentId: string }) => {
      socket.join(data.assignmentId);
    });

    // Allow clients to explicitly leave an assignment room (e.g., on navigation away)
    socket.on("leave:assignment", (data: { assignmentId: string }) => {
      socket.leave(data.assignmentId);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket ${socket.id} disconnected: ${reason}`);
    });
  });
}

export function emitToAssignment(
  io: SocketIOServer,
  assignmentId: string,
  event: string,
  data: unknown
): void {
  io.to(assignmentId).emit(event, data);
}
