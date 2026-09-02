"use client";
import { useUser } from "@clerk/nextjs";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header({ title = "Overview" }: { title?: string }) {
  const { user } = useUser();
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
      <h1 className="text-xl font-bold text-gray-800">{title}</h1>

      <div className="flex items-center gap-6">
        <button className="text-gray-400 hover:text-gray-600">
          <Search size={20} />
        </button>
        <button className="text-gray-400 hover:text-gray-600 relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-700">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {(user?.publicMetadata?.role as string) || "Candidate"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
