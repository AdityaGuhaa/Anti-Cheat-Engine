"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Clock, Play, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";

export default function StudentExaminationsPage() {
  const { fetchWithAuth } = useApi();
  const router = useRouter();
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExams = async () => {
      try {
        const [upcomingData, pastData] = await Promise.all([
          fetchWithAuth("/api/candidate/exams/upcoming"),
          fetchWithAuth("/api/candidate/exams/past"),
        ]);

        // FIX: Check if the data is wrapped in an object or is a direct array
        const upcomingArray = Array.isArray(upcomingData)
          ? upcomingData
          : upcomingData.exams || upcomingData.data || [];
        const pastArray = Array.isArray(pastData)
          ? pastData
          : pastData.exams || pastData.data || [];

        setUpcoming(upcomingArray);
        setPast(pastArray);
      } catch (err) {
        console.error("Exam fetch error:", err);
        setUpcoming([]); // Fallback to empty array on error
      } finally {
        setLoading(false);
      }
    };
    loadExams();
  }, []);

  const handleStartExam = async (examId: string) => {
    try {
      // Create the submission record in the DB
      const response = await fetchWithAuth("/api/candidate/exams/start", {
        method: "POST",
        body: JSON.stringify({ examId }),
      });

      if (response.submissionId) {
        // Redirect to the exam room using the exam ID
        router.push(`/exam/${examId}`);
      }
    } catch (err) {
      console.error("Failed to start exam:", err);
      alert("Could not start the exam. Please try again.");
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading your exams...</div>;

  return (
    <div className="space-y-8 w-full max-w-none">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Examinations</h1>
      </div>

      {/* 1. Upcoming / Active Exams */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          Ready to Start
        </h2>

        {upcoming.length === 0 ? (
          <div className="p-10 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
            <p className="text-gray-400 italic">
              No exams scheduled at the moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {upcoming.map((exam) => (
              <div
                key={exam.id}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-gray-900 text-xl">
                    {exam.title}
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    {exam.description}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {exam.duration} Mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />{" "}
                      {exam.startDate
                        ? new Date(exam.startDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            timeZone: "Asia/Kolkata",
                          })
                        : "Ongoing"}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => handleStartExam(exam.id)} // You need to implement this!
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Play size={18} fill="currentColor" /> Take Exam
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Past Exams */}
      {/* 2. Past Exams */}
      <section className="space-y-4 pt-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase">
          Past History
        </h2>
        {past.length === 0 ? (
          <div className="p-8 bg-gray-50 rounded-2xl text-center text-gray-400 text-sm">
            You haven't completed any exams yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {past.map((exam, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <CheckCircle2 size={20} className="text-green-600" />
                  <div>
                    {/* Fixed: Use examTitle to match backend */}
                    <h4 className="font-semibold text-gray-900">
                      {exam.examTitle}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Completed on{" "}
                      {new Date(exam.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <span className="block text-lg font-bold text-gray-900">
                      {Math.round(exam.score)}%
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">
                      Score
                    </span>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="block text-lg font-bold text-purple-600">
                      {Math.round(exam.truthScore)}/100
                    </span>
                    <span className="text-[10px] text-purple-300 uppercase font-semibold">
                      Integrity
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    View Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
