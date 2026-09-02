import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useExamSocket = (examId: string, userId: string, userName: string) => {
  const socketRef = useRef<Socket | null>(null);
  // Using state is necessary to let the ExamRoom know when the connection exists
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    
    const socketInstance = io(backendUrl, {
      transports: ["websocket"],
    });

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      console.log("✅ Socket Connected");
      socketInstance.emit("join_exam", { examId, userId, name: userName });
      
      // Moving setSocket here ensures it only updates 
      // AFTER the external system (Socket.io) is ready.
      setSocket(socketInstance);
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [examId, userId, userName]);

  const sendTelemetry = (type: string, payload: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("telemetry_packet", {
        examId,
        userId,
        type,
        payload,
        timestamp: Date.now(),
      });
    }
  };

  // We return the 'socket' state, not the 'ref.current'
  return { socket, sendTelemetry };
};