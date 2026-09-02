"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  MapPin,
  MoreVertical,
  Filter,
  Plus,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { CreateExamSheet } from "@/components/dashboard/examiner/CreateExamSheet";
import { useApi } from "@/hooks/useApi";

export default function ExaminationsPage() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const { fetchWithAuth } = useApi();

  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);
  const [pastExams, setPastExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/api/examiner/exams")
      .then(data => {
        setUpcomingExams(data.upcoming || []);
        setPastExams(data.past || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Helper to format dates for the little calendar blocks
  const getDay = (dateString: string) => new Date(dateString).getDate();
  const getMonth = (dateString: string) => 
    new Date(dateString).toLocaleString('default', { month: 'short' });

  if (loading) return <div className="p-8 text-center text-gray-500">Loading exams...</div>;

  return (
    <div className="space-y-8 w-full max-w-none">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Examinations</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 text-gray-600">
            <Filter size={16} />
            Filter
          </Button>
          
          <Button 
            onClick={() => setCreateOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus size={16} />
            Create Exam
          </Button>
        </div>
      </div>

      {/* Upcoming Section */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Upcoming Examinations
        </h2>
        
        {upcomingExams.length === 0 ? (
           <div className="p-8 bg-gray-50 rounded-2xl text-center text-gray-400 text-sm border border-dashed border-gray-200">
             You don't have any active exams. Click 'Create Exam' to get started!
           </div>
        ) : (
          <div className="grid gap-4">
            {upcomingExams.map((exam) => (
              <div
                key={exam.id}
                className="group flex flex-col md:flex-row md:items-center gap-6 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all w-full"
              >
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xl font-bold text-gray-900">
                    {getDay(exam.createdAt)}
                  </span>
                  <span className="text-xs font-semibold text-gray-400 uppercase">
                    {getMonth(exam.createdAt)}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {exam.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {exam.duration} Mins
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {exam.isProctored ? "AI Proctored" : "Unproctored"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-6 mt-4 md:mt-0 w-full md:w-auto">
                  
                  {/* Safely pass the submission count as the 'extra' number */}
                  <CandidatePile
                    candidates={[]} // Empty array since we aren't fetching individual candidate avatars here yet
                    extra={exam._count?.submissions || 0}
                  />
                  
                  <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 px-4 py-1.5 text-xs font-medium rounded-full shadow-none">
                    {exam.status}
                  </Badge>
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Section */}
      <section className="space-y-4 pt-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Past Examinations
        </h2>
        
        {pastExams.length === 0 ? (
          <div className="p-8 bg-gray-50 rounded-2xl text-center text-gray-400 text-sm border border-dashed border-gray-200">
             No archived or completed exams.
          </div>
        ) : (
          <div className="grid gap-4">
            {pastExams.map((exam) => {
              // Calculate a dynamic average score from submissions if available
              const avgScore = exam.submissions?.length > 0 
                ? (exam.submissions.reduce((a: number, b: any) => a + (b.score || 0), 0) / exam.submissions.length).toFixed(0) + "%"
                : "N/A";

              return (
                <div
                  key={exam.id}
                  className="group flex flex-col md:flex-row md:items-center gap-6 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer w-full"
                >
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 bg-gray-50 rounded-xl border border-gray-100 text-gray-400">
                    <span className="text-lg font-bold">{getDay(exam.createdAt)}</span>
                    <span className="text-[10px] font-semibold uppercase">
                      {getMonth(exam.createdAt)}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {exam.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5 text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded text-xs">
                        <CheckCircle2 size={12} />
                        Completed
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <div className="text-xs">
                        Avg. Score:{" "}
                        <span className="font-medium text-gray-700">
                          {avgScore}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6 mt-2 md:mt-0 w-full md:w-auto">
                    <CandidatePile
                      candidates={[]}
                      extra={exam._count?.submissions || 0}
                    />
                    <ChevronRight
                      className="text-gray-300 group-hover:text-blue-600 transition-colors"
                      size={20}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <CreateExamSheet 
        isOpen={isCreateOpen} 
        onClose={() => setCreateOpen(false)} 
      />
    </div>
  );
}

// --- Helper Component ---
// Added a fallback to ensure candidates is always an array
function CandidatePile({
  candidates = [],
  extra = 0,
}: {
  candidates?: any[];
  extra?: number;
}) {
  return (
    <div className="flex items-center -space-x-3">
      {candidates?.map((c, i) => (
        <Avatar key={i} className="border-2 border-white w-8 h-8">
          <AvatarImage src={c.img} />
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      ))}
      
      {/* Ensure 0 doesn't render strangely */}
      {Number(extra) > 0 && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border-2 border-white text-[10px] font-bold text-gray-600">
          +{extra}
        </div>
      )}
    </div>
  );
}