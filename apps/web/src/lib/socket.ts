import { io, Socket } from "socket.io-client";

let rawWsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

if (rawWsUrl && !rawWsUrl.startsWith("http://") && !rawWsUrl.startsWith("https://") && !rawWsUrl.startsWith("ws://") && !rawWsUrl.startsWith("wss://")) {
  rawWsUrl = `https://${rawWsUrl}`;
}

if (rawWsUrl.endsWith("/")) {
  rawWsUrl = rawWsUrl.slice(0, -1);
}

const WS_URL = rawWsUrl;

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
