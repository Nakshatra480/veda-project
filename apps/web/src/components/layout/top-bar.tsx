"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Bell, ChevronDown, LayoutGrid } from "lucide-react";
import { useAssignmentStore } from "@/stores/assignment-store";

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();

  // Track navigation depth within the app so we know if back() is safe
  const navDepth = useRef(0);
  useEffect(() => {
    navDepth.current += 1;
  }, [pathname]);

  const handleBack = () => {
    // If the user has navigated at least once within the app, use true browser back
    if (navDepth.current > 1) {
      window.history.back();
    } else {
      // No prior in-app history — go home
      router.push("/dashboard");
    }
  };

  const { searchQuery, setSearch } = useAssignmentStore();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchQuery) {
        setSearch(localSearch);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, searchQuery, setSearch]);

  // Check if we are on the paper page
  const isPaperPage = pathname.match(/^\/assignments\/[^/]+\/paper$/);

  return (
    <>
      {/* Desktop Header */}
      <header 
        className="hidden md:flex sticky top-3 mx-3 mb-3 z-30 items-center justify-between h-[56px] px-6 bg-white/75 backdrop-blur-md border border-white/20 rounded-[16px] transition-all duration-300"
        style={{
          boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.02)"
        }}
      >
        {/* Left: back arrow + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-colors text-[#303030] shadow-sm border border-gray-100"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Layout grid icon breadcrumb */}
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#A9A9A9]" />
            <span
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 600,
                fontSize: "16px",
                letterSpacing: "-0.04em",
                color: isPaperPage ? "#A9A9A9" : "#303030", // Create New in grey for paper view
              }}
            >
              {isPaperPage ? "Create New" : "Assignment"}
            </span>
          </div>
        </div>

        {/* Right: bell + user */}
        <div className="flex items-center gap-3">
          {/* Notification bell - Frame 1618872411 */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-[#F6F6F6] hover:bg-gray-200/80 transition-colors">
            <Bell className="w-5 h-5 text-[#303030]" strokeWidth={2} />
            {/* Orange notification dot - Ellipse 9 */}
            <span className="absolute top-[1px] right-[27px] w-2 h-2 rounded-full bg-[#FF5623]" />
          </button>

          {/* User profile - Frame 1984077287 */}
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-[12px] bg-white border border-gray-100 cursor-pointer hover:bg-gray-50 transition-all select-none"
            style={{
              filter: "drop-shadow(0px 16px 48px rgba(0, 0, 0, 0.12)) drop-shadow(0px 32px 48px rgba(0, 0, 0, 0.2))"
            }}
          >
            {/* Avatar - Frame 1618872412 */}
            <div
              className="w-8 h-8 rounded-full bg-cover bg-center border border-gray-100 flex-shrink-0 bg-white"
              style={{ backgroundImage: "url(/30576685_7705305.jpg)" }}
            />
            <span
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 600,
                fontSize: "16px",
                letterSpacing: "-0.04em",
                color: "#303030",
              }}
            >
              John Doe
            </span>
            <ChevronDown className="w-4 h-4 text-[#303030]" strokeWidth={2} />
          </div>
        </div>
      </header>

      {/* Mobile Header (Figma Frame 1618872397 - Pixel-Perfect) */}
      <header 
        className="flex md:hidden sticky top-3 mx-3 mb-3 z-30 items-center justify-between h-[56px] px-[12px] bg-white border border-gray-100 rounded-[16px] transition-all duration-300"
        style={{
          boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.02)"
        }}
      >
        {/* Left Side: VedaAI Branding (Frame 1984077294) */}
        <div className="flex items-center gap-2">
          {/* Logo square - Component 1 */}
          <div className="relative w-7 h-7 flex-shrink-0 overflow-hidden rounded-[8.4px] shadow-[0px_2px_6px_rgba(226,60,60,0.12)]">
            <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoBgMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFA65E" />
                  <stop offset="50%" stopColor="#E43F3F" />
                  <stop offset="100%" stopColor="#820721" />
                </linearGradient>
                <linearGradient id="leftRibbonMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#E2E2E2" />
                </linearGradient>
                <filter id="foldShadowMobile" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="-2" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.2" />
                </filter>
              </defs>
              <rect width="100" height="100" rx="30" fill="url(#logoBgMobile)" />
              <path d="M 50 72 L 72 28" stroke="#FFFFFF" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 28 28 L 50 72" stroke="url(#leftRibbonMobile)" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" filter="url(#foldShadowMobile)" />
            </svg>
          </div>
          
          {/* Brand Name Text */}
          <span
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700,
              fontSize: "20px",
              lineHeight: "140%",
              letterSpacing: "-0.06em",
              color: "#303030",
            }}
          >
            VedaAI
          </span>
        </div>

        {/* Right Side Controls (Frame 1984077614) */}
        <div className="flex items-center gap-3">
          {/* Notification bell - Frame 1618872411 */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-[#F6F6F6] hover:bg-gray-200/80 transition-colors">
            <Bell className="w-5 h-5 text-[#303030]" strokeWidth={2} />
            {/* Orange notification dot - Ellipse 9 */}
            <span className="absolute top-[2px] right-[2px] w-2 h-2 rounded-full bg-[#FF5623]" />
          </button>

          {/* User profile image - Frame 1618872412 */}
          <div
            className="w-8 h-8 rounded-full bg-cover bg-center border border-gray-100 flex-shrink-0 bg-white shadow-sm"
            style={{ backgroundImage: "url(/30576685_7705305.jpg)" }}
          />

          {/* Hamburger Menu - menu */}
          <button className="w-6 h-6 flex items-center justify-center text-[#1D1B20] hover:opacity-80 transition-opacity">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
    </>
  );
}
