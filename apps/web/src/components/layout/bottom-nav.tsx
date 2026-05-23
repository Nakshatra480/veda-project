"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Custom premium SVG Icons for Bottom Navigation Tabs
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("w-5 h-5", className)} fill="currentColor">
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
      <rect x="13" y="13" width="7" height="7" rx="2" />
    </svg>
  );
}

function AssignmentsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("w-5 h-5", className)} fill="none" stroke="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="3" strokeWidth="2.2" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 2v3M8 2v3M4 9h16M9 14h6" />
    </svg>
  );
}

function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("w-5 h-5", className)} fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8 6h11M8 12h11M8 18h7M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

function ToolkitIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("w-5 h-5", className)} fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9.663 17h4.673M12 3v1M21 12h-1M4 12H3M12 18.75a3.374 3.374 0 002.535-1.045l.535-.536M9.465 17.17l-.535-.536A3.374 3.374 0 006.393 15M12 7a5 5 0 00-5 5 5 5 0 005 5 5 5 0 005-5 5 5 0 00-5-5z" />
    </svg>
  );
}

const tabs = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/assignments", label: "Assignments", icon: AssignmentsIcon },
  { href: "/library", label: "Library", icon: LibraryIcon },
  { href: "/toolkit", label: "AI Toolkit", icon: ToolkitIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div 
      className="md:hidden fixed bottom-[34px] left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-[13px] w-[373px] max-w-[calc(100vw-20px)] select-none pointer-events-none"
    >
      {/* Floating Action Button (FAB) Row - Frame 1984077612 */}
      <div className="w-full flex justify-end pointer-events-auto pr-0">
        <Link href="/assignments/create">
          <button
            className="w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-[0px_16px_48px_rgba(0,0,0,0.12),_0px_32px_48px_rgba(0,0,0,0.2)]"
            style={{ borderRadius: "100px" }}
          >
            {/* Bold red-orange plus sign - Vector 5 & Vector 6 */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#FF5623]" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m-8-8h16" />
            </svg>
          </button>
        </Link>
      </div>

      {/* Floating Bottom Nav Bar Pill - Frame 1984077613 */}
      <nav 
        className="w-full h-[72px] bg-[#181818] rounded-[24px] flex items-center justify-between px-6 py-2 pointer-events-auto"
        style={{
          boxShadow: "0px 16px 48px rgba(0, 0, 0, 0.12), 0px 32px 48px rgba(0, 0, 0, 0.2)"
        }}
      >
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/dashboard"
              ? pathname === "/" || pathname === "/dashboard"
              : pathname === tab.href || pathname.startsWith(tab.href + "/");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-1.5 flex-1 py-1 transition-all group"
            >
              {/* Tab Icon */}
              <tab.icon 
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-white" : "text-white/25 group-hover:text-white/50"
                )} 
              />
              
              {/* Tab Text Label */}
              <span 
                className={cn(
                  "text-[12px] font-semibold tracking-tight transition-colors leading-[140%]",
                  isActive ? "text-white" : "text-white/25 group-hover:text-white/50"
                )}
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  letterSpacing: "-0.04em"
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
