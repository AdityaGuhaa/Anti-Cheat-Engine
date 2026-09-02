"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MoreHorizontal, TrendingUp, CheckCircle } from "lucide-react";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";

export default function ExaminerDashboard() {
  const { fetchWithAuth } = useApi();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // 🏁 FIXED: Pointing to the correct backend route
    fetchWithAuth("/api/examiner/dashboard")
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      {/* 1. Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Exams"
          value={stats?.activeExams || 0}
          sub="Currently Live"
          icon={<CheckCircle className="text-gray-400" size={18} />}
        />
        <StatCard
          title="Total Exams"
          value={stats?.totalExams || 0}
          sub="Created"
          icon={<Calendar className="text-gray-400" size={18} />}
          trend="up"
        />
        <StatCard
          title="Avg. Integrity"
          value={`${stats?.averageIntegrity || 0}%`}
          sub="Candidate Truth Score"
          icon={<TrendingUp className="text-gray-400" size={18} />}
          trend="up"
        />
        <StatCard
          title="Pending Review"
          value={stats?.pendingReviews || 0}
          sub="Flagged by AI"
          icon={<Clock className="text-gray-400" size={18} />}
        />
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Scheduled Today (Span 2) */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Scheduled Today
            </CardTitle>
            <Button
              variant="ghost"
              className="text-blue-600 text-sm font-medium"
            >
              View Calendar
            </Button>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {scheduledItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={item.avatar} />
                    <AvatarFallback>{item.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center text-sm text-gray-500 gap-1">
                    <Clock size={14} />
                    {item.time}
                  </div>
                  <Badge
                    variant={
                      item.status === "Pending Confirm"
                        ? "secondary"
                        : "outline"
                    }
                    className={
                      item.status === "Pending Confirm"
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                        : "text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-50"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Column: Latest Results (Span 1) */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Latest Results
            </CardTitle>
            <Button
              variant="ghost"
              className="text-blue-600 text-sm font-medium"
            >
              All Results
            </Button>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* 🏁 DYNAMIC DATA FROM BACKEND */}
            {stats?.latestResults?.map((result: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${getScoreColor(result.score)}`}
                  >
                    {result.score}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {result.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {result.role} • {result.date}
                    </p>
                  </div>
                </div>
                <MoreHorizontal
                  size={16}
                  className="text-gray-400 cursor-pointer"
                />
              </div>
            ))}

            {/* 🏁 Empty State Fallback */}
            {!stats?.latestResults?.length && (
              <p className="text-sm text-gray-500 text-center py-4">
                No completed exams yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Helper Components & Data ---

function StatCard({ title, value, sub, icon, trend }: any) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="text-sm font-medium text-gray-500">{title}</span>
          {icon}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <div
          className={`text-xs ${trend === "up" ? "text-green-600" : "text-gray-400"}`}
        >
          {sub}
        </div>
      </CardContent>
    </Card>
  );
}

function getScoreColor(score: number) {
  if (score >= 90) return "bg-green-100 text-green-700";
  if (score >= 70) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

// Mock Data for the left column (Kept as UI placeholder)
const scheduledItems = [
  {
    name: "James Anderson",
    role: "Senior Backend Engineer",
    time: "10:00 AM - 11:00 AM",
    status: "Upcoming",
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    name: "Li Wei",
    role: "UX Designer",
    time: "01:30 PM - 02:30 PM",
    status: "Upcoming",
    avatar: "https://i.pravatar.cc/150?u=2",
  },
  {
    name: "Marcus Johnson",
    role: "Product Manager",
    time: "03:00 PM - 04:00 PM",
    status: "Pending Confirm",
    avatar: "https://i.pravatar.cc/150?u=3",
  },
  {
    name: "Elena Rodriguez",
    role: "Data Scientist",
    time: "04:30 PM - 05:30 PM",
    status: "Upcoming",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
];