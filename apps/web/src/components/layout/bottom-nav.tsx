"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, PlusCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/assignments/create", label: "Create", icon: PlusCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors",
                isActive ? "text-[#F97316]" : "text-gray-400"
              )}
            >
              <tab.icon className={cn("w-5 h-5", isActive && "text-[#F97316]")} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
