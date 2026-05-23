"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  ClipboardList,
  Sparkles,
  Library,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/groups", label: "My Groups", icon: Users },
  { href: "/assignments", label: "Assignments", icon: ClipboardList, badge: 32 },
  { href: "/toolkit", label: "AI Teacher's Toolkit", icon: Sparkles },
  { href: "/library", label: "My Library", icon: Library },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col justify-between w-[304px] h-[calc(100vh-24px)] bg-white shadow-[0px_16px_48px_rgba(0,0,0,0.12),_0px_32px_48px_rgba(0,0,0,0.2)] rounded-[16px] p-6 m-3 sticky top-3 z-30 flex-shrink-0">

      {/* Top Section */}
      <div className="flex flex-col gap-[32px] w-full">

        {/* Logo - Frame 1618872393 */}
        <div className="flex items-center gap-2">
          {/* Logo square - Component 1 */}
          <div className="relative w-10 h-10 rounded-[12px] flex-shrink-0 overflow-hidden bg-[#303030]">
            {/* Left path */}
            <div className="absolute bg-white rounded-sm"
              style={{ left: "15%", right: "39.7%", top: "27.5%", bottom: "23.95%" }} />
            {/* Right path */}
            <div className="absolute bg-white rounded-sm"
              style={{ left: "39.85%", right: "15%", top: "27.5%", bottom: "23.94%" }} />
            {/* Overlay gradient path */}
            <div className="absolute left-0 right-0 top-0 bottom-0 opacity-20"
              style={{ background: "linear-gradient(180deg, rgba(255, 255, 255, 0) -8.5%, rgba(255, 255, 255, 0) 30.21%, #0E1513 80.66%, #0E1513 108.81%)" }} />
          </div>
          
          {/* VedaAI Brand Text */}
          <span
            className="text-[#303030] font-bold tracking-[-0.06em]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "28px", lineHeight: "20px" }}
          >
            VedaAI
          </span>
        </div>

        {/* AI Teacher's Toolkit Call-to-Action - Frame 17 */}
        <Link href="/toolkit" className="w-full">
          <button
            className="w-full h-[42px] flex items-center justify-center gap-2 rounded-[100px] text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "#272727",
              boxShadow:
                "0px 16px 48px rgba(255, 255, 255, 0.12), 0px 32px 48px rgba(255, 255, 255, 0.2), inset 0px -1px 3.5px rgba(177, 177, 177, 0.6), inset 0px 0px 34.5px rgba(255, 255, 255, 0.25)",
            }}
          >
            <Sparkles className="w-[18.32px] h-[17.32px] text-white fill-white" />
            <span
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "16px", letterSpacing: "-0.04em" }}
            >
              AI Teacher’s Toolkit
            </span>
          </button>
        </Link>

        {/* Menu Navigation */}
        <nav className="flex flex-col gap-2 w-full">
          {navItems.map((item) => {
            const isActive =
              item.label === "Home"
                ? pathname === "/" || pathname === "/dashboard"
                : item.label === "Assignments"
                ? pathname.startsWith("/assignments")
                : pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "w-full h-10 flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 group",
                  isActive
                    ? "bg-[#F0F0F0] text-[#303030]"
                    : "text-[rgba(94,94,94,0.8)] hover:bg-neutral-50"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive ? "text-[#303030] stroke-[2.5px]" : "text-[rgba(94,94,94,0.8)]"
                  )}
                />
                <span
                  className="flex-1 truncate"
                  style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: isActive ? 500 : 400,
                    fontSize: "16px",
                    lineHeight: "140%",
                    letterSpacing: "-0.04em",
                    color: isActive ? "#303030" : "rgba(94,94,94,0.8)",
                  }}
                >
                  {item.label}
                </span>
                {item.badge != null && (
                  <span className="flex-shrink-0 min-w-[37px] h-5 flex items-center justify-center rounded-[48px] bg-[#FF5623] text-white text-[14px] font-semibold px-2"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: "-0.04em" }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-3 w-full">
        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150",
            pathname === "/settings"
              ? "text-[#303030]"
              : "text-[rgba(94,94,94,0.8)] hover:bg-neutral-50"
          )}
        >
          <Settings className="w-5 h-5 text-[rgba(94,94,94,0.8)] flex-shrink-0" />
          <span
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 400,
              fontSize: "16px",
              letterSpacing: "-0.04em",
              color: "rgba(94,94,94,0.8)",
            }}
          >
            Settings
          </span>
        </Link>

        {/* School profile card - Frame 39959 */}
        <div className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-[#F0F0F0] mt-1">
          {/* Avatar / image 3 */}
          <div
            className="w-[59px] h-[60px] rounded-full flex-shrink-0 bg-cover bg-center border border-white bg-white/40"
            style={{ backgroundImage: "url(/30576685_7705305.jpg)" }}
          />
          <div className="flex flex-col items-start min-w-0">
            <p
              className="text-[#303030] truncate w-full"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 700,
                fontSize: "16px",
                lineHeight: "140%",
                letterSpacing: "-0.04em",
              }}
            >
              Delhi Public School
            </p>
            <p
              className="text-[#5E5E5E] truncate w-full"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "140%",
                letterSpacing: "-0.04em",
              }}
            >
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
