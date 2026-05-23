"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Set background color dynamically based on path to match exact design specification
  const isPaperPage = pathname.match(/^\/assignments\/[^/]+\/paper$/);
  const bgColor = isPaperPage ? "bg-[#E6E6E6]" : "bg-[#F5F5F7]";

  return (
    <div className={`flex h-screen overflow-hidden ${bgColor} transition-colors duration-300`}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 md:p-6 pt-0">{children}</div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
