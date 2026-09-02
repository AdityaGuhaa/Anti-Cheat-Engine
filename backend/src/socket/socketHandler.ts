import { Server, Socket } from "socket.io";

// In-memory mapping for 100-user scale
// Key: clerkUserId, Value: socketId
const userSocketMap = new Map<string, string>();

// Key: examId, Value: Set of clerkUserIds
const examRooms = new Map<string, Set<string>>();

export const setupSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`connected: ${socket.id}`);

    // 1. Join Exam Logic
    socket.on("join_exam", ({ examId, userId, name }) => {
      // Map user to this specific connection
      userSocketMap.set(userId, socket.id);
      
      // Join the Socket.io room for broadcast events
      socket.join(examId);

      // Track who is active in this exam
      if (!examRooms.has(examId)) {
        examRooms.set(examId, new Set());
      }
      examRooms.get(examId)?.add(userId);

      console.log(`User ${name} (${userId}) joined Exam: ${examId}`);
      
      // Notify others in the room (Optional: for live proctoring view)
      socket.to(examId).emit("user_joined", { userId, name });
    });

    // 2. The Telemetry Pipe (The "Snapshot" Listener)
    socket.on("telemetry_packet", (data) => {
      const { examId, userId, payload, type } = data;
      
      // LOGIC: Instead of processing here, we eventually push to a Queue
      // For now, let's just log receipt
      console.log(`Received ${type} from ${userId} for ${examId}`);

      // If violation is high-level (e.g., Tab Switch), we can handle instantly
      if (type === "TAB_SWITCH") {
        // Update Truth Score logic will go here
      }
    });

    // 3. Cleanup on Disconnect
    socket.on("disconnect", () => {
      // Find which user this was and remove from maps
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          // Optional: Notify room that user disconnected
          break;
        }
      }
      console.log(`disconnected: ${socket.id}`);
    });
  });
};