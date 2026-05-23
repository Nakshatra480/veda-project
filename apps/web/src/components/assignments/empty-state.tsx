"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[678px] w-full max-w-[1100px] mx-auto py-12 px-6 rounded-[32px] relative overflow-hidden select-none"
      style={{
        background: "linear-gradient(180deg, #EEEEEE 0%, #DADADA 100%)",
      }}
    >
      {/* Background glow blur (Ellipse 16 like effect) */}
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
              {/* Star doodle bottom left (Vector) */}
              <path
                d="M35 155 L 38 145 L 48 142 L 38 139 L 35 129 L 32 139 L 22 142 L 32 145 Z"
                fill="#417BA4"
              />
              {/* Loop doodle on the left (Vector) */}
              <path
                d="M50 110 C 25 80, 20 120, 45 130 C 70 140, 60 70, 20 85"
                stroke="#011625"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Active status indicator dot on the right (Ellipse 67) */}
              <circle cx="235" cy="134" r="6" fill="#417BA4" />
            </svg>

            {/* Illustration found wrapper */}
            <div className="absolute w-[286.22px] h-[240px] left-[7px] top-[29px]">
              
              {/* Layered Page (White) */}
              <div
                className="absolute w-[124.54px] h-[155.03px] left-[calc(50%-124.54px/2+1.27px)] top-[calc(50%-155.03px/2-8.93px)] bg-white rounded-[16px] p-5 flex flex-col gap-2.5 shadow-[0px_20px_30px_rgba(146,146,146,0.19)] z-0"
              >
                {/* Title */}
                <div className="w-[50px] h-[9.8px] bg-[#011625] rounded-full" />
                {/* Text lines */}
                <div className="w-full h-[9.8px] bg-[#D5D5D5] rounded-full" />
                <div className="w-full h-[9.8px] bg-[#D5D5D5] rounded-full" />
                <div className="w-full h-[9.8px] bg-[#D5D5D5] rounded-full" />
                <div className="w-full h-[9.8px] bg-[#D5D5D5] rounded-full" />
              </div>

              {/* Status cloud pill (Cloud) */}
              <div
                className="absolute w-[70.22px] h-[40.39px] left-[200px] top-[40.42px] bg-white rounded-xl shadow-[6px_4px_13px_rgba(27,119,139,0.09)] flex items-center justify-center gap-1.5 px-2 z-10"
              >
                {/* Circle */}
                <div className="w-[10px] h-[10px] rounded-full bg-[#CCC6D9]" />
                {/* Rectangle 10 */}
                <div className="w-[28px] h-[10px] bg-[#D5D5D5] rounded-full" />
              </div>

              {/* Lens / Magnifying Glass */}
              <div className="absolute w-[163.11px] h-[163.17px] left-[110px] top-[95px] z-20">
                {/* Glass handle (Vector) */}
                <div
                  className="absolute w-[22.61px] h-[57.52px] bg-[#E1DCEB] rounded-full"
                  style={{
                    left: "128px",
                    top: "115px",
                    transform: "matrix(0.65, -0.76, 0.72, 0.69, 0, 0)",
                    transformOrigin: "center",
                  }}
                />
                
                {/* Glass rim / Metallic rim */}
                <div
                  className="absolute w-[125px] h-[125px] rounded-full border-[10px] border-[#CCC6D9] shadow-sm flex items-center justify-center overflow-hidden"
                  style={{
                    left: "25px",
                    top: "10px",
                    background: "linear-gradient(158.92deg, rgba(255,255,255,0.75) 13.91%, rgba(255,173,173,0.3) 122.3%)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {/* Close Red Circle Icon (Close icon) */}
                  <div className="w-[44px] h-[44px] bg-[#FF4040] rounded-full flex items-center justify-center shadow-md animate-pulse">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Frame 1984077347 - Title & Details Block */}
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

        {/* Primary Action Button (Primary Button - Dark) */}
        <Link href="/assignments/create" className="mt-4">
          <button
            className="w-[277px] h-[46px] bg-[#181818] hover:bg-[#2c2c2c] active:scale-[0.98] rounded-[48px] flex items-center justify-center gap-2 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {/* White Plus icon container */}
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
  );
}
