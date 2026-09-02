import { useRef, useCallback } from "react";

export const useProctoring = (
  examId: string,
  userId: string,
  getToken: () => Promise<string | null>,
) => {
  const mediaStream = useRef<MediaStream | null>(null);
  const videoElement = useRef<HTMLVideoElement | null>(null);
  const telemetryInterval = useRef<NodeJS.Timeout | null>(null);

  const captureFrame = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!videoElement.current) return resolve(null);
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoElement.current, 0, 0);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7);
      } else {
        resolve(null);
      }
    });
  }, []);

  const sendToBackend = useCallback(
    async (image: Blob, audio: Blob) => {
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const token = await getToken();
      const formData = new FormData();
      formData.append("image", image, "frame.jpg");
      formData.append("audio", audio, "audio.webm");
      formData.append("userId", userId);
      formData.append("examId", examId);
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/candidate/telemetry/upload`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          },
        );
        console.log("📡 Telemetry response status:", res.status);
      } catch (err) {
        console.error("❌ Fetch Error (Telemetry):", err);
      }
    },
    [examId, userId, getToken],
  );

  const startProctoring = useCallback(
    async (videoRef: React.RefObject<HTMLVideoElement | null>) => {
      console.log("🎬 startProctoring called...");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: true,
        });
        console.log("✅ Camera/Mic stream obtained");
        mediaStream.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          console.log("📺 Video element playing");
        } else {
          console.error("❌ videoRef.current is NULL");
        }

        videoElement.current = videoRef.current;
        const audioOnlyStream = new MediaStream(stream.getAudioTracks());
        const mimeType = MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg";
        console.log(`🎙️ Using MIME type: ${mimeType}`);

        // --- NEW LOGIC: Discrete recording chunks ---
        console.log("⏱️ Telemetry loop started (5s intervals)");
        
        telemetryInterval.current = setInterval(async () => {
          // 1. Capture the image frame instantly
          const imageBlob = await captureFrame();
          if (!imageBlob) return;

          // 2. Start a fresh recorder for exactly 4 seconds of audio
          const recorder = new MediaRecorder(audioOnlyStream, { mimeType });
          const chunks: BlobPart[] = [];

          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) chunks.push(event.data);
          };

          recorder.onstop = () => {
            // Because we stopped it, this blob is a fully finalized, valid WebM file!
            const audioBlob = new Blob(chunks, { type: mimeType });
            console.log(`📦 Telemetry packaged! Audio Size: ${audioBlob.size}`);
            sendToBackend(imageBlob, audioBlob);
          };

          recorder.start();

          // Let it record for 4000ms, then stop it so it packages the file and sends it.
          // (We use 4000ms inside a 5000ms interval to ensure the network request has time to fire).
          setTimeout(() => {
            if (recorder.state === "recording") {
              recorder.stop();
            }
          }, 4000);
          
        }, 5000);

      } catch (err) {
        console.error("❌ startProctoring failed:", err);
        alert("Browser blocked camera/mic. Check site permissions.");
      }
    },
    [captureFrame, sendToBackend],
  );

  const stopProctoring = useCallback(() => {
    console.log("🛑 Stopping proctoring...");
    if (telemetryInterval.current) {
      clearInterval(telemetryInterval.current);
    }
    mediaStream.current?.getTracks().forEach((track) => track.stop());
  }, []);

  return { startProctoring, stopProctoring };
};