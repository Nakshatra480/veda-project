"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function EmptyState() {
  return (
    <>
      {/* Desktop Empty State (Existing - Grand Layout) */}
      <div
        className="hidden md:flex flex-col items-center justify-center min-h-[678px] w-full max-w-[1100px] mx-auto py-12 px-6 rounded-[32px] relative overflow-hidden select-none"
        style={{
          background: "linear-gradient(180deg, #EEEEEE 0%, #DADADA 100%)",
        }}
      >
        {/* Background glow blur */}
        <div className="absolute w-[800px] h-[300px] bg-neutral-600/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Frame 1984077553 */}
        <div className="flex flex-col justify-center items-center gap-8 w-full max-w-[486px] z-10">
          
          {/* Frame 1984077554 — Illustrations Container */}
          <div className="flex flex-col items-center gap-3 w-full h-[408px] relative">
            
            {/* Illustrations block (300x300) */}
            <div className="w-[300px] h-[300px] relative flex-shrink-0">
              
              {/* Background circle */}
              <div
                className="absolute w-[240px] h-[240px] rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -mt-[1px]"
                style={{
                  background: "linear-gradient(179.67deg, #F2F2F2 -15.9%, #EFEFEF 158.68%)",
                }}
              />

              {/* Doodles & Vector drawings container */}
              <svg
                className="absolute left-[7px] top-[60.57px] w-[284px] h-[178.65px] pointer-events-none z-10"
                viewBox="0 0 284 179"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M35 155 L 38 145 L 48 142 L 38 139 L 35 129 L 32 139 L 22 142 L 32 145 Z"
                  fill="#417BA4"
                />
                <path
                  d="M50 110 C 25 80, 20 120, 45 130 C 70 140, 60 70, 20 85"
                  stroke="#011625"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="235" cy="134" r="6" fill="#417BA4" />
              </svg>

              {/* Illustration found wrapper */}
              <div className="absolute w-[286.22px] h-[240px] left-[7px] top-[29px]">
                
                {/* Layered Page (White) */}
                <div
                  className="absolute w-[124.54px] h-[155.03px] left-[calc(50%-124.54px/2+1.27px)] top-[calc(50%-155.03px/2-8.93px)] bg-white rounded-[16px] p-5 flex flex-col gap-2.5 shadow-[0px_20px_30px_rgba(146,146,146,0.19)] z-0"
                >
                  <div className="w-[50px] h-[9.8px] bg-[#011625] rounded-full" />
                  <div className="w-full h-[9.8px] bg-[#D5D5D5] rounded-full" />
                  <div className="w-full h-[9.8px] bg-[#D5D5D5] rounded-full" />
                  <div className="w-full h-[9.8px] bg-[#D5D5D5] rounded-full" />
                  <div className="w-full h-[9.8px] bg-[#D5D5D5] rounded-full" />
                </div>

                {/* Status cloud pill */}
                <div
                  className="absolute w-[70.22px] h-[40.39px] left-[200px] top-[40.42px] bg-white rounded-xl shadow-[6px_4px_13px_rgba(27,119,139,0.09)] flex items-center justify-center gap-1.5 px-2 z-10"
                >
                  <div className="w-[10px] h-[10px] rounded-full bg-[#CCC6D9]" />
                  <div className="w-[28px] h-[10px] bg-[#D5D5D5] rounded-full" />
                </div>

                {/* Lens / Magnifying Glass */}
                <div className="absolute w-[163.11px] h-[163.17px] left-[110px] top-[95px] z-20">
                  <div
                    className="absolute w-[22.61px] h-[57.52px] bg-[#E1DCEB] rounded-full"
                    style={{
                      left: "128px",
                      top: "115px",
                      transform: "matrix(0.65, -0.76, 0.72, 0.69, 0, 0)",
                      transformOrigin: "center",
                    }}
                  />
                  
                  <div
                    className="absolute w-[125px] h-[125px] rounded-full border-[10px] border-[#CCC6D9] shadow-sm flex items-center justify-center overflow-hidden"
                    style={{
                      left: "25px",
                      top: "10px",
                      background: "linear-gradient(158.92deg, rgba(255,255,255,0.75) 13.91%, rgba(255,173,173,0.3) 122.3%)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <div className="w-[44px] h-[44px] bg-[#FF4040] rounded-full flex items-center justify-center shadow-md animate-pulse">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Title & Details Block */}
            <div className="flex flex-col justify-center items-center gap-2 w-full max-w-[486px] mt-4">
              <h2
                className="text-[#303030] tracking-[-0.04em]"
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: "20px",
                  lineHeight: "140%",
                }}
              >
                No assignments yet
              </h2>
              <p
                className="text-[rgba(94,94,94,0.8)] tracking-[-0.04em]"
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 400,
                  fontSize: "16px",
                  lineHeight: "140%",
                }}
              >
                Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
              </p>
            </div>

          </div>

          {/* Primary Action Button */}
          <Link href="/assignments/create" className="mt-4">
            <button
              className="w-[277px] h-[46px] bg-[#181818] hover:bg-[#2c2c2c] active:scale-[0.98] rounded-[48px] flex items-center justify-center gap-2 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
              <span
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "140%",
                  letterSpacing: "-0.04em",
                }}
              >
                Create Your First Assignment
              </span>
            </button>
          </Link>

        </div>
      </div>

      {/* Mobile Empty State (Figma Frame 1984077553 - Pixel-Perfect) */}
      <div 
        className="flex md:hidden flex-col justify-center items-center gap-[32px] w-full max-w-[373px] mx-auto min-h-[580px] py-4 select-none z-10 relative"
      >
        {/* Frame 1984077554 — Illustrations + Text Wrapper */}
        <div className="flex flex-col items-center gap-[12px] w-full max-h-[338px] flex-shrink-0 relative">
          
          {/* Illustrations (220px x 220px) */}
          <div className="w-[220px] h-[220px] relative flex-shrink-0">
            
            {/* Background circle (176px x 176px) */}
            <div
              className="absolute w-[176px] h-[176px] rounded-full left-[22px] top-[22px]"
              style={{
                background: "linear-gradient(179.67deg, #F2F2F2 -15.9%, #EFEFEF 158.68%)",
              }}
            />

            {/* Layered Page (White, 91.33px x 113.69px) */}
            <div
              className="absolute w-[91.33px] h-[113.69px] left-[65.27px] top-[46.61px] bg-white rounded-[11.7333px] px-[9px] py-[12px] flex flex-col gap-[7.2px] shadow-[0px_14.6667px_22px_rgba(146,146,146,0.19)] z-10"
            >
              {/* Title line (Navy) */}
              <div className="w-[36.67px] h-[7.19px] bg-[#011625] rounded-full flex-shrink-0" />
              {/* Text lines (Grey 2) */}
              <div className="w-[73.33px] h-[7.19px] bg-[#D5D5D5] rounded-full flex-shrink-0" />
              <div className="w-[73.33px] h-[7.19px] bg-[#D5D5D5] rounded-full flex-shrink-0" />
              <div className="w-[73.33px] h-[7.19px] bg-[#D5D5D5] rounded-full flex-shrink-0" />
              <div className="w-[73.33px] h-[7.19px] bg-[#D5D5D5] rounded-full flex-shrink-0" />
            </div>

            {/* Cloud (White, 51.49px x 29.62px) */}
            <div
              className="absolute w-[51.49px] h-[29.62px] left-[163.53px] top-[34.04px] bg-white rounded-lg shadow-[4.4px_2.93333px_9.53333px_rgba(27,119,139,0.09)] flex items-center justify-center gap-1 px-1.5 z-20"
            >
              {/* Circle (Grey 4) */}
              <div className="w-[8.8px] h-[8.8px] rounded-full bg-[#CCC6D9] flex-shrink-0" />
              {/* Rectangle 10 (Grey 2) */}
              <div className="w-[23.47px] h-[8.8px] bg-[#D5D5D5] rounded-full flex-shrink-0" />
            </div>

            {/* Magnifying Lens (119.61px x 119.65px) */}
            <div className="absolute w-[119.61px] h-[119.65px] left-[89.91px] top-[73.75px] z-30">
              {/* Handle vector (rotated) */}
              <div
                className="absolute w-[16.58px] h-[42.18px] bg-[#E1DCEB] rounded-full"
                style={{
                  left: "70.6px",
                  top: "70.8px",
                  transform: "matrix(0.65, -0.76, 0.72, 0.69, 0, 0)",
                  transformOrigin: "center",
                }}
              />
              
              {/* Lens circular rim / glass (Subtract/Union) */}
              <div
                className="absolute w-[112.02px] h-[112.4px] rounded-full border-[7px] border-[#CCC6D9] flex items-center justify-center overflow-hidden"
                style={{
                  left: "0px",
                  top: "0px",
                  background: "#17CB9E",
                  mixBlendMode: "normal",
                }}
              >
                {/* Lens gradient and glass layer with backdrop blur */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(158.92deg, #FFFFFF 13.91%, #FFADAD 122.3%)",
                    opacity: 0.85,
                    backdropFilter: "blur(2.93333px)"
                  }}
                />

                {/* Red Close circle icon (Close icon) */}
                <div className="w-[36.67px] h-[36.67px] bg-[#FF4040] rounded-full flex items-center justify-center shadow-md animate-pulse z-10">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Doodles Overlay (Inline SVG for exact pixel placement) */}
            <svg
              className="absolute inset-0 w-[220px] h-[220px] pointer-events-none z-10"
              viewBox="0 0 220 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Sparkle doodle bottom left */}
              <path
                d="M 40.78 157.09 Q 49.17 157.09 49.17 147.92 Q 49.17 157.09 57.56 157.09 Q 49.17 157.09 49.17 166.26 Q 49.17 157.09 40.78 157.09 Z"
                fill="#417BA4"
              />
              {/* Curly loop doodle top left */}
              <path
                d="M 50 45 C 20 40, 5 70, 20 85 C 35 95, 60 90, 50 70 C 40 50, 15 55, 10 75"
                stroke="#011625"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Active status indicator dot on the right */}
              <circle cx="204.6" cy="130.53" r="4.4" fill="#417BA4" />
            </svg>

          </div>

          {/* Title & Details Block (Frame 1984077347 - Pixel-Perfect) */}
          <div className="flex flex-col justify-center items-center gap-[12px] w-full px-4">
            <h2
              className="text-[#303030] tracking-[-0.04em] text-center font-bold text-[20px] leading-[140%]"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
              }}
            >
              No assignments yet
            </h2>
            <p
              className="text-[rgba(94,94,94,0.8)] tracking-[-0.04em] text-center font-normal text-[16px] leading-[140%]"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
              }}
            >
              Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
            </p>
          </div>

        </div>

        {/* Primary Action Button (Primary Button - Dark) */}
        <Link href="/assignments/create" className="z-10 mt-2 pointer-events-auto">
          <button
            className="w-[277px] h-[46px] bg-[#181818] rounded-[48px] flex items-center justify-center gap-2 text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
          >
            {/* Bold white SVG Plus icon */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m-8-8h16" />
            </svg>
            <span
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "140%",
                letterSpacing: "-0.04em",
              }}
            >
              Create Your First Assignment
            </span>
          </button>
        </Link>

      </div>
    </>
  );
}
