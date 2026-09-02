"use client";
import { useCallback, useEffect, useRef, useState, use } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useExamSocket } from "@/hooks/useExamSocket";
import { useProctoring } from "@/hooks/useProctoring";
import { useRouter } from "next/navigation";

interface ExamDetails {
  title: string;
  description: string;
  duration: number;
  questionCount: number;
}

export default function ExamRoom({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const examId = resolvedParams.id;

  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [examStarted, setExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>(
    {},
  );

  const userId = user?.id || "";
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { socket } = useExamSocket(
    examId,
    userId,
    user?.fullName || "Candidate",
  );
  const { startProctoring, stopProctoring } = useProctoring(
    examId,
    userId,
    getToken,
  );

  // 1. Fetch Exam Details & Questions on mount
  useEffect(() => {
    const fetchExamData = async () => {
      if (!examId) return;
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [detailsRes, questionsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/candidate/${examId}/details`, { headers }),
          fetch(`${BACKEND_URL}/api/candidate/${examId}/questions`, {
            headers,
          }),
        ]);

        // 🚨 ULTIMATE DEBUG ERROR HANDLER 🚨
        if (!detailsRes.ok) {
          const rawText = await detailsRes.text();
          throw new Error(
            `DETAILS API FAILED!\nStatus: ${detailsRes.status}\nURL: ${detailsRes.url}\nResponse: ${rawText.substring(0, 100)}`,
          );
        }

        if (!questionsRes.ok) {
          const rawText = await questionsRes.text();
          throw new Error(
            `QUESTIONS API FAILED!\nStatus: ${questionsRes.status}\nResponse: ${rawText.substring(0, 100)}`,
          );
        }

        const detailsData = await detailsRes.json();
        const questionsData = await questionsRes.json();

        setExamDetails(detailsData);
        setTimeLeft(detailsData.duration * 60);
        setQuestions(questionsData);
      } catch (err: any) {
        console.error("Fetch Error:", err.message);
        // This will print the EXACT reason it crashed to your screen
        alert(err.message);
        router.push("/dashboard/candidate");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamData();
  }, [examId, getToken, BACKEND_URL, router]);

  const handleSubmit = useCallback(async () => {
    stopProctoring();
    try {
      const token = await getToken();
      const response = await fetch(
        `${BACKEND_URL}/api/candidate/${examId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers: currentAnswers, userId }),
        },
      );

      if (response.ok) {
        alert("Exam Submitted Successfully!");
        router.push("/dashboard/candidate/examinations");
      }
    } catch (err) {
      console.error("Submission error:", err);
    }
    if (document.fullscreenElement) document.exitFullscreen();
  }, [
    currentAnswers,
    stopProctoring,
    examId,
    userId,
    router,
    getToken,
    BACKEND_URL,
  ]);

  useEffect(() => {
    if (!examStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timeLeft, handleSubmit]);

  const startExam = async () => {
    try {
      if (containerRef.current) await containerRef.current.requestFullscreen();
      setExamStarted(true);
    } catch (err) {
      alert("Could not enter fullscreen.");
    }
  };

  useEffect(() => {
    if (!examStarted) return;
    const timer = setTimeout(async () => {
      try {
        await startProctoring(videoRef);
      } catch (err) {
        console.error("Proctoring failed to start:", err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [examStarted, startProctoring]);

  useEffect(() => {
    const currentSocket = socket;
    if (!currentSocket) return;

    const handleWarning = (data: { message: string }) => {
      alert(`⚠️ PROCTOR ALERT: ${data.message}`);
    };

    currentSocket.on("proctor_warning", handleWarning);
    return () => {
      currentSocket.off("proctor_warning", handleWarning);
    };
  }, [socket]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading Secure Environment...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-y-auto bg-slate-950 text-white relative"
    >
      {!examStarted ? (
        /* REAL DATA START SCREEN */
        <div className="flex flex-col items-center justify-center min-h-screen space-y-6 py-12">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">
              {examDetails?.title || "Secure Assessment"}
            </h1>
            <p className="text-slate-400">
              Duration: {examDetails?.duration} Minutes | Questions:{" "}
              {examDetails?.questionCount || questions.length} MCQs
            </p>
            {examDetails?.description && (
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                {examDetails.description}
              </p>
            )}
          </div>
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 text-sm space-y-3">
            <p className="flex items-center gap-2">
              ⚠️ Fullscreen mode required
            </p>
            <p className="flex items-center gap-2">
              🎥 AI Camera & Mic monitoring active
            </p>
            <p className="flex items-center gap-2">
              🚫 Tab switching is prohibited
            </p>
          </div>
          <button onClick={startExam} className="btn btn-primary btn-lg px-12">
            Confirm & Start Exam
          </button>
        </div>
      ) : (
        /* LIVE EXAM ROOM */
        <div className="p-8 grid grid-cols-12 gap-6 min-h-full">
          <div className="col-span-9 space-y-8">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-lg border border-slate-800">
              <span className="text-xl font-mono text-yellow-400 font-bold">
                TIME REMAINING: {formatTime(timeLeft)}
              </span>
              <button onClick={handleSubmit} className="btn btn-success btn-sm">
                Finish & Submit
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-6 pb-12">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-slate-900 p-6 rounded-xl border border-slate-800 transition-all hover:border-slate-700"
                >
                  <p className="text-lg mb-4 font-medium">
                    <span className="text-slate-500 mr-2">{idx + 1}.</span>{" "}
                    {q.text}
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {(typeof q.options === "string"
                      ? JSON.parse(q.options)
                      : q.options
                    ).map((opt: string) => (
                      <button
                        key={opt}
                        onClick={() =>
                          setCurrentAnswers({ ...currentAnswers, [q.id]: opt })
                        }
                        className={`btn btn-outline justify-start h-auto py-3 px-6 normal-case ${
                          currentAnswers[q.id] === opt
                            ? "btn-primary bg-primary/10"
                            : "text-slate-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SIDEBAR: PROCTORING FEED */}
          <div className="col-span-3">
            <div className="sticky top-8 space-y-4">
              <div className="rounded-lg overflow-hidden border-2 border-red-600 bg-black aspect-video relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  controls={false}
                  playsInline
                  onLoadedMetadata={(e) => {
                    e.currentTarget
                      .play()
                      .catch((err) => console.error("Autoplay failed:", err));
                  }}
                  className="w-full h-full object-cover shadow-2xl"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold">
                  <span className="animate-pulse">●</span> LIVE
                </div>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-500">
                  Security Logs
                </h3>
                <div className="text-[11px] space-y-2 text-slate-400">
                  <p className="flex justify-between">
                    <span>Biometric Check:</span>{" "}
                    <span className="text-green-500">Passed</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Environment:</span>{" "}
                    <span className="text-blue-400">Monitoring</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
