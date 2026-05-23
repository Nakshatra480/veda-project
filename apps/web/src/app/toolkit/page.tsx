"use client";

import { useState } from "react";
import {
  BookOpen,
  Settings,
  Sparkles,
  Copy,
  Check,
  FileText,
  CheckCircle2,
  HelpCircle,
  BrainCircuit,
  Grid3X3,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type ActiveTab = "lesson" | "rubric" | "enhance";

// ─── Markdown renderer ───────────────────────────────────────────────────────

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="text-xl font-bold font-bricolage text-[#303030] mt-6 mb-2 first:mt-0">
          {line.replace("## ", "")}
        </h3>
      );
    }
    // H3
    else if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="text-base font-bold font-bricolage text-[#F97316] mt-4 mb-1.5">
          {line.replace("### ", "")}
        </h4>
      );
    }
    // H1
    else if (line.startsWith("# ")) {
      elements.push(
        <h2 key={i} className="text-2xl font-bold font-bricolage text-[#303030] mt-4 mb-2">
          {line.replace("# ", "")}
        </h2>
      );
    }
    // Horizontal rule
    else if (line.trim() === "---") {
      elements.push(<hr key={i} className="border-neutral-200 my-4" />);
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={i}
          className="border-l-4 border-orange-400 pl-4 py-2 my-3 bg-orange-50/40 rounded-r-xl text-neutral-700 font-medium italic"
        >
          {inlineFormat(line.replace("> ", ""))}
        </blockquote>
      );
    }
    // Bullet list item (- or *)
    else if (/^[-*]\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(
          <li key={i} className="text-sm text-neutral-600 mt-1">
            {inlineFormat(lines[i].replace(/^[-*]\s/, ""))}
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="ml-5 list-disc space-y-0.5 my-2">
          {items}
        </ul>
      );
      continue;
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(
          <li key={i} className="text-sm text-neutral-600 mt-1">
            {inlineFormat(lines[i].replace(/^\d+\.\s/, ""))}
          </li>
        );
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="ml-5 list-decimal space-y-0.5 my-2">
          {items}
        </ol>
      );
      continue;
    }
    // Markdown table
    else if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      // Filter separator rows
      const nonSepRows = tableLines.filter((l) => !l.match(/^\|[\s-|]+\|$/));
      const parsedRows = nonSepRows.map((l) =>
        l
          .split("|")
          .map((c) => c.trim())
          .filter(Boolean)
      );
      if (parsedRows.length > 0) {
        const [header, ...bodyRows] = parsedRows;
        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-4 rounded-xl border border-neutral-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  {header.map((col, ci) => (
                    <th
                      key={ci}
                      className="px-3 py-2 text-left font-bold text-neutral-700"
                      dangerouslySetInnerHTML={{ __html: col.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-neutral-50/50"}>
                    {row.map((col, ci) => (
                      <td
                        key={ci}
                        className="px-3 py-2 border-t border-neutral-100 text-neutral-600 align-top"
                        dangerouslySetInnerHTML={{ __html: col.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }
    // Empty line
    else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    }
    // Plain paragraph
    else {
      elements.push(
        <p key={i} className="text-sm text-neutral-600 leading-relaxed">
          {inlineFormat(line)}
        </p>
      );
    }

    i++;
  }

  return elements;
}

function inlineFormat(text: string): React.ReactNode {
  // Process **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={idx}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={idx}>{part.slice(1, -1)}</em>;
        }
        return part;
      })}
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ToolkitPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("lesson");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lesson Planner States
  const [lessonTopic, setLessonTopic] = useState("");
  const [lessonGrade, setLessonGrade] = useState("6th");
  const [lessonTime, setLessonTime] = useState("45 Minutes");

  // Rubric States
  const [rubricTopic, setRubricTopic] = useState("");
  const [rubricLevels, setRubricLevels] = useState<"3" | "4">("3");

  // Enhancer States
  const [questionText, setQuestionText] = useState("");

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setOutput(null);
    setError(null);

    try {
      let endpoint = "";
      let body: Record<string, string> = {};

      if (activeTab === "lesson") {
        if (!lessonTopic.trim()) {
          setError("Please enter a lesson topic before generating.");
          setIsGenerating(false);
          return;
        }
        endpoint = "/api/toolkit/lesson";
        body = { topic: lessonTopic.trim(), grade: lessonGrade, duration: lessonTime };
      } else if (activeTab === "rubric") {
        if (!rubricTopic.trim()) {
          setError("Please enter an assessment topic before generating.");
          setIsGenerating(false);
          return;
        }
        endpoint = "/api/toolkit/rubric";
        body = { topic: rubricTopic.trim(), levels: rubricLevels };
      } else if (activeTab === "enhance") {
        if (!questionText.trim()) {
          setError("Please enter a question to enhance before generating.");
          setIsGenerating(false);
          return;
        }
        endpoint = "/api/toolkit/enhance";
        body = { question: questionText.trim() };
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiBase}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || `Server error: ${response.status}`);
      }

      setOutput(json.data.output);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 px-4 animate-in fade-in slide-in-from-bottom-3 duration-300">

      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-bricolage text-[#303030] flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-[#F97316]" />
          AI Teacher&apos;s Toolkit
        </h1>
        <p className="text-sm text-neutral-500 font-sans mt-1">
          Access high-quality AI assistants to instantly create lesson outlines, optimize quiz questions, or build rubrics.
        </p>
      </div>

      {/* Tabs list grid */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-neutral-100/70 border border-neutral-200/50 rounded-2xl">
        {[
          { id: "lesson", label: "Lesson Planner AI", icon: FileText },
          { id: "rubric", label: "Smart Rubric Builder", icon: Grid3X3 },
          { id: "enhance", label: "Bloom's Enhancer", icon: BrainCircuit },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as ActiveTab);
              setOutput(null);
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium font-bricolage transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-[#F97316] shadow-sm border border-neutral-200/40"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <tab.icon className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main interface split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Control Card: Inputs */}
        <Card className="lg:col-span-5 border-neutral-100 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-bricolage text-[#303030] flex items-center gap-1.5">
              <Settings className="w-5 h-5 text-neutral-400" />
              Configure AI Output
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {activeTab === "lesson" && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="lesson-topic" className="text-xs font-semibold text-neutral-600 font-sans">
                    Lesson Topic / Focus <span className="text-red-400">*</span>
                  </label>
                  <Input
                    id="lesson-topic"
                    value={lessonTopic}
                    onChange={(e) => setLessonTopic(e.target.value)}
                    placeholder="e.g. Mitosis, Photosynthesis, Earthquakes"
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="lesson-grade" className="text-xs font-semibold text-neutral-600 font-sans">
                      Grade Target
                    </label>
                    <select
                      id="lesson-grade"
                      value={lessonGrade}
                      onChange={(e) => setLessonGrade(e.target.value)}
                      className="w-full h-11 bg-white border border-neutral-200 rounded-xl px-3 text-sm text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                    >
                      {["K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"].map((g) => (
                        <option key={g} value={g}>{g} Grade</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="lesson-time" className="text-xs font-semibold text-neutral-600 font-sans">
                      Time Duration
                    </label>
                    <select
                      id="lesson-time"
                      value={lessonTime}
                      onChange={(e) => setLessonTime(e.target.value)}
                      className="w-full h-11 bg-white border border-neutral-200 rounded-xl px-3 text-sm text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                    >
                      {["30 Minutes", "45 Minutes", "60 Minutes", "75 Minutes", "90 Minutes"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {activeTab === "rubric" && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="rubric-topic" className="text-xs font-semibold text-neutral-600 font-sans">
                    Assessment / Project Topic <span className="text-red-400">*</span>
                  </label>
                  <Input
                    id="rubric-topic"
                    value={rubricTopic}
                    onChange={(e) => setRubricTopic(e.target.value)}
                    placeholder="e.g. Informative Science Essay, Group Lab Report"
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="rubric-levels" className="text-xs font-semibold text-neutral-600 font-sans">
                    Grading Scale Levels
                  </label>
                  <select
                    id="rubric-levels"
                    value={rubricLevels}
                    onChange={(e) => setRubricLevels(e.target.value as "3" | "4")}
                    className="w-full h-11 bg-white border border-neutral-200 rounded-xl px-3 text-sm text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  >
                    <option value="3">3 Levels (Novice, Proficient, Expert)</option>
                    <option value="4">4 Levels (Below Basic, Basic, Proficient, Advanced)</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === "enhance" && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="enhance-question" className="text-xs font-semibold text-neutral-600 font-sans">
                    Raw Question to Enhance <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="enhance-question"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="e.g. What is the role of the nucleus? or Explain cellular respiration."
                    className="w-full h-28 p-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#F97316] font-sans resize-none"
                  />
                </div>
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs text-blue-700 font-sans leading-relaxed">
                    <strong>Tip:</strong> Works best with questions 5+ words long. The AI will generate three increasingly complex versions across Bloom&apos;s Taxonomy levels.
                  </p>
                </div>
              </>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full rounded-xl bg-[#F97316] text-white hover:bg-orange-600 h-11 flex items-center justify-center gap-2 mt-4 font-medium transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? "Generating with AI…" : "Generate AI Assets"}
            </Button>

            {isGenerating && (
              <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-3">
                <p className="text-xs text-orange-700 font-sans leading-relaxed text-center animate-pulse">
                  ✨ Consulting the AI model — this may take 10-30 seconds…
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Output Card: Results */}
        <Card className="lg:col-span-7 border-neutral-100 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] rounded-2xl bg-white min-h-[480px] flex flex-col overflow-hidden">

          <CardHeader className="border-b border-neutral-100 bg-neutral-50/50 py-4 flex flex-row items-center justify-between flex-shrink-0">
            <CardTitle className="text-sm font-bold font-bricolage text-neutral-600 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Assisted Draft Output
            </CardTitle>
            <div className="flex items-center gap-2">
              {output && (
                <>
                  <Badge variant="outline" className="bg-emerald-50 border-emerald-100 text-emerald-700 text-[10px] font-sans">
                    AI Generated
                  </Badge>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    variant="ghost"
                    className="h-8 rounded-lg text-xs flex items-center gap-1.5 px-2 text-neutral-500 hover:text-neutral-700"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </Button>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="h-8 rounded-lg text-xs flex items-center gap-1.5 px-3"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Draft</span>
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardHeader>

          <div className="flex-grow overflow-y-auto p-6 font-sans text-sm text-neutral-700 bg-white custom-scrollbar-toolkit">

            {/* Loading state */}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center h-full space-y-4 py-16">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-[#F97316] animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-4 h-4 text-[#F97316]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-neutral-700 font-bricolage">AI is crafting your content…</p>
                  <p className="text-xs text-neutral-400 mt-1 font-sans">This usually takes 10–30 seconds</p>
                </div>
              </div>
            )}

            {/* Error state */}
            {!isGenerating && error && (
              <div className="flex flex-col items-center justify-center h-full py-16">
                <div className="w-full max-w-sm bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                  <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-red-700 mb-1 font-bricolage">Generation Failed</h4>
                  <p className="text-xs text-red-600 leading-relaxed font-sans mb-4">{error}</p>
                  <Button
                    onClick={handleGenerate}
                    variant="outline"
                    className="rounded-xl h-9 text-xs border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Output state */}
            {!isGenerating && !error && output && (
              <div className="space-y-1 leading-relaxed">
                {renderMarkdown(output)}
              </div>
            )}

            {/* Empty state */}
            {!isGenerating && !error && !output && (
              <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto py-16">
                <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-4">
                  <HelpCircle className="w-7 h-7 text-neutral-300" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-1.5 font-bricolage">No Output Generated</h4>
                <p className="text-xs text-neutral-400 leading-normal font-sans">
                  Configure your options on the left and click{" "}
                  <span className="font-semibold text-neutral-500">&ldquo;Generate AI Assets&rdquo;</span>{" "}
                  to get an AI-crafted draft here.
                </p>
                <div className="flex items-center gap-2 mt-4">
                  {["Lesson Planner", "Rubric Builder", "Bloom's Enhancer"].map((label) => (
                    <Badge key={label} variant="outline" className="text-[10px] bg-neutral-50 border-neutral-200 text-neutral-400 font-normal">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Styled scrollbar helpers */}
      <style jsx global>{`
        .custom-scrollbar-toolkit::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-toolkit::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-toolkit::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 99px;
        }
        .custom-scrollbar-toolkit::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>
    </div>
  );
}
