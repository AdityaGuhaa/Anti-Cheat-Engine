"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Trophy,
  Users,
  TrendingUp,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";

// --- 1. Mock Data ---

// List of Past Exams
/* const PAST_EXAMS = [
  { id: 101, title: "Senior Frontend Developer Assessment", date: "Oct 24", candidates: 12, avgScore: 88 },
  { id: 102, title: "Product Manager Case Study", date: "Oct 20", candidates: 8, avgScore: 92 },
  { id: 103, title: "DevOps Technical Assessment", date: "Oct 18", candidates: 15, avgScore: 76 },
  { id: 104, title: "Mobile App Developer Quiz", date: "Oct 12", candidates: 20, avgScore: 81 },
  { id: 105, title: "UI/UX Design Challenge", date: "Oct 05", candidates: 10, avgScore: 94 },
]; */

// List of ALL Candidates (linked to exams via examId)
/* const ALL_CANDIDATES = [
  { id: 1, name: "Sarah Jenning", role: "Snr. Product Manager", score: 94, truthScore: 98, examId: 102, img: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "Raj Patel", role: "Backend Engineer", score: 91, truthScore: 96, examId: 101, img: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "Mei Lin", role: "Data Scientist", score: 89, truthScore: 82, examId: 101, img: "https://i.pravatar.cc/150?u=3" },
  { id: 4, name: "David Okonjo", role: "DevOps Lead", score: 88, truthScore: 99, examId: 103, img: "https://i.pravatar.cc/150?u=4" },
  { id: 5, name: "Elena Rodriguez", role: "UX Designer", score: 85, truthScore: 95, examId: 105, img: "https://i.pravatar.cc/150?u=5" },
  { id: 6, name: "Marcus Thorn", role: "Frontend Dev", score: 84, truthScore: 78, examId: 101, img: "https://i.pravatar.cc/150?u=6" },
  { id: 7, name: "James Wilson", role: "Mobile Dev", score: 92, truthScore: 90, examId: 104, img: "https://i.pravatar.cc/150?u=7" },
  { id: 8, name: "Anita Roy", role: "Mobile Dev", score: 78, truthScore: 85, examId: 104, img: "https://i.pravatar.cc/150?u=8" },
]; */

export default function ResultsPage() {
  const { fetchWithAuth } = useApi();
  const [pastExams, setPastExams] = useState<any[]>([]);
  const [allCandidates, setAllCandidates] = useState<any[]>([]);

  // 🏁 FIX 1: Change number[] to string[] to match Prisma's CUID format
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);

  useEffect(() => {
    fetchWithAuth("/api/examiner/exams").then((data) => {
      if (data.past) setPastExams(data.past);
      if (data.upcoming) setPastExams((prev) => [...prev, ...data.upcoming]);
    });
  }, []);

  // 🏁 FIX 2: id is a string
  const handleToggleExam = async (id: string) => {
    const isCurrentlySelected = selectedExamIds.includes(id);

    if (isCurrentlySelected) {
      setSelectedExamIds((prev) => prev.filter((eId) => eId !== id));
      setAllCandidates((prev) => prev.filter((c) => c.examId !== id));
    } else {
      setSelectedExamIds((prev) => [...prev, id]);
      try {
        const results = await fetchWithAuth(
          `/api/examiner/exams/${id}/results`,
        );
        const candidatesWithExamId = results.map((r: any) => ({
          ...r,
          examId: id,
        }));
        setAllCandidates((prev) => [...prev, ...candidatesWithExamId]);
      } catch (err) {
        console.error("Failed to fetch candidates for exam");
      }
    }
  };

  const activeCandidates = useMemo(() => {
    if (selectedExamIds.length === 0) return allCandidates;
    return allCandidates.filter((c) => selectedExamIds.includes(c.examId));
  }, [selectedExamIds, allCandidates]);

  const stats = useMemo(() => {
    const totalCandidates = activeCandidates.length;
    const avgScore =
      totalCandidates > 0
        ? (
            activeCandidates.reduce((acc, curr) => acc + curr.score, 0) /
            totalCandidates
          ).toFixed(1)
        : "0.0";
    const avgTruthScore =
      totalCandidates > 0
        ? (
            activeCandidates.reduce((acc, curr) => acc + curr.truthScore, 0) /
            totalCandidates
          ).toFixed(1)
        : "0.0";

    return { totalCandidates, avgScore, avgTruthScore };
  }, [activeCandidates]);

  const topCandidates = useMemo(() => {
    return [...activeCandidates].sort((a, b) => b.score - a.score).slice(0, 5);
  }, [activeCandidates]);

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Examination Results
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {selectedExamIds.length === 0
              ? "Showing aggregate data for all past examinations."
              : `Showing filtered data for ${selectedExamIds.length} selected exam(s).`}
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter size={16} />
          All Active Examinations
        </Button>
      </div>

      {/* --- Top Stats Row (Reacts to Selection) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Candidates Selected"
          value={stats.totalCandidates}
          sub="Based on selection"
          trend="+12%"
          icon={<Users className="text-blue-600" size={20} />}
        />
        <StatCard
          title="Avg. Performance"
          value={`${stats.avgScore}%`}
          sub="Technical Score"
          trend="+2.4%"
          icon={<TrendingUp className="text-green-600" size={20} />}
        />
        <StatCard
          title="Avg. Truth Score"
          value={stats.avgTruthScore}
          sub="Integrity Rating"
          trend="Stable"
          icon={<CheckCircle2 className="text-purple-600" size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {/* --- Center Section: Exam List (The Filter) --- */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-gray-800">
                Past Examinations
              </CardTitle>
              <div className="relative w-64 hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Search exams..."
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
                Select exams to filter results
              </div>

              {pastExams.map((exam) => {
                const isChecked = selectedExamIds.includes(exam.id);

                // 🏁 FIX: Calculate real values from Prisma data
                const formattedDate = exam.createdAt
                  ? new Date(exam.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A";

                const candidateCount = exam._count?.submissions || 0;

                const avgScore =
                  exam.submissions?.length > 0
                    ? Math.round(
                        exam.submissions.reduce(
                          (acc: number, sub: any) => acc + (sub.score || 0),
                          0,
                        ) / exam.submissions.length,
                      )
                    : 0;

                return (
                  <div
                    key={exam.id}
                    onClick={() => handleToggleExam(exam.id)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md",
                      isChecked
                        ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-500/20"
                        : "bg-white border-gray-100 hover:border-blue-100",
                    )}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleToggleExam(exam.id)}
                      className="data-[state=checked]:bg-blue-600 border-gray-300 pointer-events-none"
                    />

                    <div className="flex-1">
                      <h4
                        className={cn(
                          "font-semibold text-sm",
                          isChecked ? "text-blue-900" : "text-gray-900",
                        )}
                      >
                        {exam.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formattedDate}
                        </div>
                        <span>•</span>
                        <span>{candidateCount} Candidates</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {avgScore}%
                      </div>
                      <div className="text-[10px] text-gray-400">Avg Score</div>
                    </div>
                  </div>
                );
              })}

              {pastExams.length === 0 && (
                <div className="text-center p-6 text-sm text-gray-400">
                  No exams found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* --- Right Sidebar: Top Candidates (The Result) --- */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm h-full bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-gray-800">
                Top Candidates
              </CardTitle>
              <MoreHorizontal
                className="text-gray-400 cursor-pointer"
                size={20}
              />
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {topCandidates.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No candidates found for selection.
                </p>
              ) : (
                topCandidates.map((candidate, i) => {
                  // Safely fall back if names are missing
                  const displayName =
                    candidate.candidateName &&
                    candidate.candidateName.trim() !== "null null"
                      ? candidate.candidateName
                      : "Unknown Candidate";

                  return (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-gray-100">
                          <AvatarImage src={candidate.img} />
                          <AvatarFallback>{displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {displayName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {candidate.role || "Candidate"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {Math.round(candidate.score || 0)}%
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "block text-[10px] px-1.5 py-0 h-auto mt-0.5",
                            candidate.truthScore >= 90
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700",
                          )}
                        >
                          {Math.round(candidate.truthScore || 0)} Truth
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}

              <Button variant="outline" className="w-full mt-4 text-xs h-9">
                View All Candidates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- Helper: Stat Card ---
function StatCard({ title, value, sub, icon, trend }: any) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
            {trend}
          </span>
          <span className="text-xs text-gray-400">{sub}</span>
        </div>
      </CardContent>
    </Card>
  );
}
