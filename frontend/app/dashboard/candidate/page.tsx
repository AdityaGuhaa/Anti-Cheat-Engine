"use client";

import { Trophy, Target, TrendingUp, CheckCircle2, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useUser } from "@clerk/nextjs";

export default function CandidateDashboard() {
  const { user } = useUser();
  const { fetchWithAuth } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const data = await fetchWithAuth("/api/candidate/dashboard");
        setData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, []);

  if (loading) return <div>Loading stats...</div>;

  return (
    <div className="space-y-8 w-full">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName || "Candidate"}!
          </h1>
          <p className="text-sm text-gray-500">
            Here is your performance summary.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Award size={16} />
          View Certificate
        </Button>
      </div>

      {/* 1. Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Exams Completed"
          value={data?.stats?.totalExams || 0}
          sub="Total Assessments"
          icon={<CheckCircle2 className="text-blue-600" size={20} />}
        />
        <StatCard
          title="Average Score"
          value={`${data?.stats?.avgScore || 0}%`}
          sub="Top 15% of candidates"
          icon={<TrendingUp className="text-green-600" size={20} />}
          trend="up"
        />
        <StatCard
          title="Trust Score"
          value={`${data?.stats?.avgTruthScore || 0}/100`}
          sub="High Integrity Rating"
          icon={<Target className="text-purple-600" size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Past Records / Recent Performance (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">
                Recent Performance History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data?.history?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 text-sm">
                      {item.score}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {item.examTitle}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">
                      {item.score}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 3. Top Performances (Right Column) */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm h-full bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">
                Top Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {data?.achievements && data.achievements.length > 0 ? (
                data.achievements.map((badge: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 ${badge.color ? badge.color.replace("text-", "border-") : "border-gray-200"}`}
                  >
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        {/* Render dynamic icon based on backend string */}
                        {badge.icon === "trophy" && (
                          <Trophy className={badge.color} size={24} />
                        )}
                        {badge.icon === "medal" && (
                          <Award className={badge.color} size={24} />
                        )}
                        {badge.icon === "badge" && (
                          <Target className={badge.color} size={24} />
                        )}
                        {badge.icon === "book" && (
                          <TrendingUp className="text-blue-500" size={24} />
                        )}

                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full bg-white shadow-sm ${badge.color}`}
                        >
                          Earned
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900">{badge.title}</h4>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-xl text-gray-400 text-sm">
                  Take more exams to earn achievement badges!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---
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
          {trend && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              +{trend}
            </span>
          )}
          <span className="text-xs text-gray-400">{sub}</span>
        </div>
      </CardContent>
    </Card>
  );
}
