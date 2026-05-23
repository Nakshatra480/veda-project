"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Settings as SettingsIcon,
  User,
  Building,
  Key,
  Bell,
  CheckCircle2,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Save,
  Loader2,
  AlertTriangle,
  RefreshCcw,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { API_BASE } from "@/lib/api";

type ThemeMode = "light" | "dark" | "system";
type ToastType = "success" | "error";

interface SettingsData {
  teacherName: string;
  schoolName: string;
  defaultSubject: string;
  openRouterApiKeyMasked: string;
  hasApiKey: boolean;
  defaultModel: string;
  emailDigests: boolean;
  generationAlerts: boolean;
  themeMode: ThemeMode;
  updatedAt?: string;
}

const MODELS = [
  { value: "minimax/minimax-m2.5", label: "Minimax M2.5 (High Speed)" },
  { value: "openai/gpt-4o", label: "GPT-4o (Standard Precision)" },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet (Advanced)" },
  { value: "google/gemini-pro-1.5", label: "Gemini Pro 1.5 (Multimodal)" },
  { value: "meta-llama/llama-3.1-70b-instruct", label: "Llama 3.1 70B (Open Source)" },
];

// ─── Toggle Component ─────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#F97316]/50 disabled:opacity-50 ${
        checked ? "bg-[#F97316]" : "bg-neutral-200"
      }`}
      aria-checked={checked}
      role="switch"
    >
      <div
        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  // Loading / error states
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Form fields
  const [teacherName, setTeacherName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [defaultSubject, setDefaultSubject] = useState("");

  const [apiKeyInput, setApiKeyInput] = useState(""); // raw input from the user
  const [apiKeyPlaceholder, setApiKeyPlaceholder] = useState(""); // masked suffix shown when unchanged
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyEditing, setApiKeyEditing] = useState(false); // true when user has started editing

  const [defaultModel, setDefaultModel] = useState("minimax/minimax-m2.5");
  const [emailDigests, setEmailDigests] = useState(true);
  const [generationAlerts, setGenerationAlerts] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const toastTimer = useRef<NodeJS.Timeout | null>(null);

  const showToast = (type: ToastType, message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  // ─── Load settings from API ────────────────────────────────────────────────

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Server error ${res.status}`);
      }

      const s: SettingsData = json.data;
      setTeacherName(s.teacherName || "");
      setSchoolName(s.schoolName || "");
      setDefaultSubject(s.defaultSubject || "");
      setApiKeyPlaceholder(s.openRouterApiKeyMasked || "");
      setHasApiKey(s.hasApiKey);
      setApiKeyInput(""); // clear any previous raw input
      setApiKeyEditing(false);
      setDefaultModel(s.defaultModel || "minimax/minimax-m2.5");
      setEmailDigests(s.emailDigests ?? true);
      setGenerationAlerts(s.generationAlerts ?? true);
      setThemeMode((s.themeMode as ThemeMode) || "light");
      if (s.updatedAt) setLastSaved(s.updatedAt);
      setIsDirty(false);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [loadSettings]);

  // Synchronise browser theme classes instantly when themeMode state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (themeMode === "dark") {
        document.body.classList.add("dark-mode");
      } else if (themeMode === "light") {
        document.body.classList.remove("dark-mode");
      } else {
        // System preference matching
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark) {
          document.body.classList.add("dark-mode");
        } else {
          document.body.classList.remove("dark-mode");
        }
      }
    }
  }, [themeMode]);

  // Mark dirty whenever any field changes after initial load
  const markDirty = () => setIsDirty(true);

  // ─── Save settings to API ──────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload: Record<string, unknown> = {
        teacherName,
        schoolName,
        defaultSubject,
        defaultModel,
        emailDigests,
        generationAlerts,
        themeMode,
      };

      // Only send the API key if the user actually typed a new one
      if (apiKeyEditing && apiKeyInput.trim().length > 6) {
        payload.openRouterApiKey = apiKeyInput.trim();
      }

      const res = await fetch(`${API_BASE}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Server error ${res.status}`);
      }

      // Refresh masked key from server response
      const s: SettingsData = json.data;
      setApiKeyPlaceholder(s.openRouterApiKeyMasked || "");
      setHasApiKey(s.hasApiKey);
      setApiKeyInput("");
      setApiKeyEditing(false);
      if (s.updatedAt) setLastSaved(s.updatedAt);
      setIsDirty(false);
      showToast("success", "Settings saved successfully.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-[#F97316] animate-spin" />
        <p className="text-sm text-neutral-400 font-sans animate-pulse">Loading workspace settings…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-4xl mx-auto py-20 flex flex-col items-center gap-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center max-w-md">
          <AlertTriangle className="w-10 h-10 text-red-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-700 mb-1">Failed to Load Settings</h3>
          <p className="text-sm text-neutral-400 mb-5">{loadError}</p>
          <Button onClick={loadSettings} variant="outline" className="rounded-full gap-2">
            <RefreshCcw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 px-4 animate-in fade-in slide-in-from-bottom-3 duration-300 relative">

      {/* ── Toast Notification ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 z-50 border animate-in slide-in-from-bottom-5 fade-in duration-200 ${
            toast.type === "success"
              ? "bg-[#272727] text-white border-neutral-700/60"
              : "bg-red-600 text-white border-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-200 flex-shrink-0" />
          )}
          <div className="font-sans">
            <p className="text-sm font-semibold">{toast.type === "success" ? "Settings Saved" : "Save Failed"}</p>
            <p className="text-xs opacity-70">{toast.message}</p>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-bricolage text-[#303030] flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-[#F97316]" />
            Workspace Settings
          </h1>
          <p className="text-sm text-neutral-500 font-sans mt-1">
            Manage profiles, OpenRouter API keys, model selections, and UI configurations.
          </p>
        </div>
        {lastSaved && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-sans mt-1 flex-shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>Saved {new Date(lastSaved).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        )}
      </div>

      {/* Unsaved changes indicator */}
      {isDirty && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-medium font-sans">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          You have unsaved changes — click &ldquo;Save Configuration&rdquo; to persist them.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* ── Teacher Profile ── */}
        <Card className="border-neutral-100 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] rounded-2xl bg-white overflow-hidden">
          <CardHeader className="bg-neutral-50/50 border-b border-neutral-100">
            <CardTitle className="text-base font-bold font-bricolage text-neutral-700 flex items-center gap-2">
              <User className="w-5 h-5 text-[#F97316]" />
              Teacher Profile Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="teacher-name" className="text-xs font-semibold text-neutral-600 font-sans">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  id="teacher-name"
                  value={teacherName}
                  onChange={(e) => { setTeacherName(e.target.value); markDirty(); }}
                  placeholder="e.g. John Doe"
                  className="pl-9 rounded-xl h-11 border-neutral-200 focus-visible:ring-[#F97316]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="school-name" className="text-xs font-semibold text-neutral-600 font-sans">
                Institution Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  id="school-name"
                  value={schoolName}
                  onChange={(e) => { setSchoolName(e.target.value); markDirty(); }}
                  placeholder="e.g. Veda Academy"
                  className="pl-9 rounded-xl h-11 border-neutral-200 focus-visible:ring-[#F97316]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="default-subject" className="text-xs font-semibold text-neutral-600 font-sans">
                Default Subject Focus
              </label>
              <Input
                id="default-subject"
                value={defaultSubject}
                onChange={(e) => { setDefaultSubject(e.target.value); markDirty(); }}
                placeholder="e.g. Biology"
                className="rounded-xl h-11 border-neutral-200 focus-visible:ring-[#F97316]"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* ── API & Engine ── */}
        <Card className="border-neutral-100 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] rounded-2xl bg-white overflow-hidden">
          <CardHeader className="bg-neutral-50/50 border-b border-neutral-100">
            <CardTitle className="text-base font-bold font-bricolage text-neutral-700 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" />
              API &amp; Engine Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="api-key" className="text-xs font-semibold text-neutral-600 font-sans">
                  OpenRouter API Key
                </label>
                <div className="flex items-center gap-2">
                  {hasApiKey && !apiKeyEditing && (
                    <Badge variant="outline" className="bg-emerald-50 border-emerald-100 text-emerald-700 text-[10px]">
                      ✓ Key Saved
                    </Badge>
                  )}
                  {!apiKeyEditing ? (
                    <button
                      type="button"
                      onClick={() => { setApiKeyEditing(true); setApiKeyInput(""); markDirty(); }}
                      className="text-[10px] text-[#F97316] hover:underline font-medium font-sans"
                    >
                      {hasApiKey ? "Change Key" : "Add Key"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setApiKeyEditing(false); setApiKeyInput(""); }}
                      className="text-[10px] text-neutral-400 hover:text-neutral-600 font-medium font-sans"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {!apiKeyEditing ? (
                // Show masked key display
                <div className="flex items-center h-11 px-3 bg-neutral-50 border border-neutral-200 rounded-xl gap-2">
                  <Key className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  <span className="text-sm text-neutral-500 font-sans tracking-wider flex-grow">
                    {hasApiKey
                      ? `sk-or-v1-••••••••••••••••${apiKeyPlaceholder}`
                      : "No API key configured"}
                  </span>
                </div>
              ) : (
                // Show editable key input
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => { setApiKeyInput(e.target.value); markDirty(); }}
                    placeholder="sk-or-v1-..."
                    className="pl-9 pr-10 rounded-xl h-11 border-neutral-200 focus-visible:ring-[#F97316]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}

              <p className="text-[10px] text-neutral-400 font-sans leading-normal">
                Your API key is stored securely on the server and never exposed in full to the browser.{" "}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F97316] hover:underline"
                >
                  Get a key →
                </a>
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="default-model" className="text-xs font-semibold text-neutral-600 font-sans">
                Preferred Generation LLM
              </label>
              <select
                id="default-model"
                value={defaultModel}
                onChange={(e) => { setDefaultModel(e.target.value); markDirty(); }}
                className="w-full h-11 bg-white border border-neutral-200 rounded-xl px-3 text-sm text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <p className="text-[10px] text-neutral-400 font-sans">
                Selected model will be used for all exam paper generation tasks.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Notifications + Theme ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Notifications */}
          <Card className="border-neutral-100 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-neutral-50/50 border-b border-neutral-100">
              <CardTitle className="text-base font-bold font-bricolage text-neutral-700 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                Notification Center
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-700 font-sans">Daily Activity Digest</p>
                  <p className="text-xs text-neutral-400 font-sans mt-0.5">Receive summary reports of class performance.</p>
                </div>
                <Toggle
                  checked={emailDigests}
                  onChange={(v) => { setEmailDigests(v); markDirty(); }}
                />
              </div>

              <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-700 font-sans">Paper Generation Alerts</p>
                  <p className="text-xs text-neutral-400 font-sans mt-0.5">Browser notification when generation completes.</p>
                </div>
                <Toggle
                  checked={generationAlerts}
                  onChange={(v) => { setGenerationAlerts(v); markDirty(); }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme */}
          <Card className="border-neutral-100 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-neutral-50/50 border-b border-neutral-100">
              <CardTitle className="text-base font-bold font-bricolage text-neutral-700 flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                Interface Visual Theme
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { mode: "light" as ThemeMode, label: "Light", icon: Sun, color: "text-amber-500" },
                  { mode: "dark" as ThemeMode, label: "Dark", icon: Moon, color: "text-blue-500" },
                  { mode: "system" as ThemeMode, label: "Auto", icon: SettingsIcon, color: "text-neutral-400" },
                ].map((t) => (
                  <button
                    key={t.mode}
                    type="button"
                    onClick={() => { setThemeMode(t.mode); markDirty(); }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                      themeMode === t.mode
                        ? "border-[#F97316] bg-orange-50/20 shadow-sm"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    <t.icon className={`w-5 h-5 mb-1.5 ${t.color}`} />
                    <span className="text-xs font-semibold text-neutral-600 font-sans">{t.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Footer Save ── */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={loadSettings}
            className="text-xs text-neutral-400 hover:text-neutral-600 font-sans flex items-center gap-1.5 transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Reload from server
          </button>

          <Button
            type="submit"
            disabled={isSaving || !isDirty}
            className="rounded-xl px-6 h-11 bg-[#F97316] text-white hover:bg-orange-600 shadow-md font-semibold flex items-center gap-1.5 disabled:opacity-60 transition-all"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4" /> Save Configuration</>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}
