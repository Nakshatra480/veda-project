"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Set background color dynamically based on path to match exact design specification
  const isPaperPage = pathname.match(/^\/assignments\/[^/]+\/paper$/);
  const bgColor = isPaperPage ? "bg-[#E6E6E6]" : "bg-[#CECECE] md:bg-[#F5F5F7]";

  return (
    <div className={`flex h-screen overflow-hidden ${bgColor} transition-colors duration-300`}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="p-4 md:p-6 pt-0">{children}</div>
        </main>
      </div>
      <BottomNav />
      
      {/* Simulated iOS Home Indicator at the very bottom (mockup accuracy) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[34px] flex items-center justify-center pointer-events-none z-50">
        <div className="w-[135px] h-[5px] bg-[#DDDDDD] rounded-full" />
      </div>
    </div>
  );
}
