import { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server"; // Import Clerk server helper
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 1. Fetch the user on the server
  const user = await currentUser();

  // If the middleware didn't catch them, redirect manually
  if (!user) return redirect("/sign-in");

  // 2. Extract the role from metadata (default to 'candidate' if missing)
  const role = (user.publicMetadata?.role as "examiner" | "candidate") || "candidate";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 3. Pass the dynamic role to the Sidebar */}
      <Sidebar role={role} />

      {/* Main Content Area */}
      <div className="pl-64">
        <Header />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}