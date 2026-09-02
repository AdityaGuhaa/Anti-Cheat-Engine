"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs"; // 1. Import useClerk for logout
import {
  LayoutDashboard,
  BarChart3,
  CalendarClock,
  FileText,
  Settings,
  Plus,
  LogOut,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// 2. Updated links to match your folder structure (Plural: examinations)
const examinerLinks = [
  { label: "Dashboard", href: "/dashboard/examiner", icon: LayoutDashboard },
  {
    label: "Examinations",
    href: "/dashboard/examiner/examinations",
    icon: ClipboardList,
  },
  { label: "Results", href: "/dashboard/examiner/results", icon: BarChart3 },
  {
    label: "Scheduled",
    href: "/dashboard/examiner/scheduled",
    icon: CalendarClock,
  },
];

const candidateLinks = [
  { label: "Dashboard", href: "/dashboard/candidate", icon: LayoutDashboard },
  {
    label: "Examinations",
    href: "/dashboard/candidate/examinations",
    icon: FileText,
  },
];

export function Sidebar({
  role = "examiner",
}: {
  role?: "examiner" | "candidate";
}) {
  const pathname = usePathname();
  const { signOut } = useClerk(); // 3. Initialize signOut function

  const links = role === "examiner" ? examinerLinks : candidateLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-xl">T</span>
        </div>
        <span className="text-xl font-bold text-gray-900">TalentAI</span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
          {role === "examiner" ? "Examiner Menu" : "Candidate Menu"}
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        {/* 4. Dynamic Settings Link Fix */}
        <Link
          href={`/dashboard/${role.toLowerCase()}/settings`}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname.includes("/settings")
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
          )}
        >
          <Settings size={18} />
          Settings
        </Link>

        {/* 5. Functional Logout Button */}
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>

        {role === "examiner" && (
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 mt-4">
            <Plus size={16} />
            Create Exam
          </Button>
        )}
      </div>
    </aside>
  );
}
