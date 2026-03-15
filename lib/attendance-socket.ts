/**
 * Socket.io client for attendance real-time code sync.
 * Connect to the standalone socket server; join room by classId and listen for code-update.
 */

import { io, type Socket } from "socket.io-client";

const SOCKET_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001")
    : "";

let sharedSocket: Socket | null = null;

/**
 * Get or create the shared Socket.io client (browser only).
 */
export function getAttendanceSocket(): Socket | null {
  if (typeof window === "undefined" || !SOCKET_URL) return null;
  if (!sharedSocket) {
    sharedSocket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
    });
  }
  return sharedSocket;
}

/**
 * Join the room for a class so this client receives code-update and record-added events.
 */
export function joinAttendanceRoom(
  socket: Socket | null,
  classId: string
): void {
  if (socket && classId) {
    socket.emit("join-class", classId);
  }
}

/**
 * Leave the room when switching class or unmounting.
 */
export function leaveAttendanceRoom(
  socket: Socket | null,
  classId: string
): void {
  if (socket && classId) {
    socket.emit("leave-class", classId);
  }
}
