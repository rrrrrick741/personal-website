"use client";

import { useState, useEffect, useCallback } from "react";
import FocusTimer from "@/components/FocusTimer";
import TodoPanel from "@/components/TodoPanel";
import {
  FocusBarChart,
  FocusPieChart,
  FocusTrendChart,
  PieLegend,
} from "@/components/Charts";
import type { FocusSession, FocusStats } from "@/lib/focus";

// Preset harmonious accent colors
const ACCENT_COLORS = [
  { name: "墨黑", value: "#1a1a1a" },
  { name: "黛蓝", value: "#3b5998" },
  { name: "苍绿", value: "#4a7c59" },
  { name: "赭石", value: "#8b5e3c" },
  { name: "藕紫", value: "#6b5b7b" },
  { name: "檀红", value: "#9b4a4a" },
];

// Preset background options
const BACKGROUNDS = [
  { name: "纯白", value: "none", preview: "#ffffff" },
  {
    name: "网格",
    value: "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
    preview: "#fafafa",
    size: "20px 20px",
  },
  {
    name: "暖灰",
    value: "linear-gradient(135deg, #f5f5f5 0%, #fafafa 50%, #f0f0f0 100%)",
    preview: "#f5f5f5",
  },
  {
    name: "晨曦",
    value: "linear-gradient(135deg, #fefefe 0%, #f7f7f7 50%, #fafaf8 100%)",
    preview: "#fefefe",
  },
  {
    name: "雾灰",
    value: "linear-gradient(180deg, #f8f8f8 0%, #f0f0f0 100%)",
    preview: "#f8f8f8",
  },
];

export default function FocusPage() {
  const [stats, setStats] = useState<FocusStats | null>(null);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<"bar" | "pie" | "trend">(
    "bar"
  );

  // Add session modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addProject, setAddProject] = useState("");
  const [addSubject, setAddSubject] = useState("");
  const [addDuration, setAddDuration] = useState("25");
  const [addNotes, setAddNotes] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [accentColor, setAccentColor] = useState("#1a1a1a");
  const [bgImage, setBgImage] = useState("none");
  const [bgSize, setBgSize] = useState("auto");

  // Load settings from localStorage
  useEffect(() => {
    const savedAccent = localStorage.getItem("accent-color");
    if (savedAccent) {
      setAccentColor(savedAccent);
      document.documentElement.style.setProperty("--color-accent", savedAccent);
    }
    const savedBg = localStorage.getItem("bg-image");
    if (savedBg) setBgImage(savedBg);
    const savedBgSize = localStorage.getItem("bg-size");
    if (savedBgSize) setBgSize(savedBgSize);
  }, []);

  // Apply background
  useEffect(() => {
    if (bgImage === "none") {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
    } else {
      document.body.style.backgroundImage = bgImage;
      document.body.style.backgroundSize = bgSize || "auto";
    }
    localStorage.setItem("bg-image", bgImage);
    if (bgSize) localStorage.setItem("bg-size", bgSize);
  }, [bgImage, bgSize]);

  function setAccent(color: string) {
    setAccentColor(color);
    document.documentElement.style.setProperty("--color-accent", color);
    localStorage.setItem("accent-color", color);
  }

  const fetchData = useCallback(async () => {
    const [statsRes, sessionsRes] = await Promise.all([
      fetch("/api/focus?action=stats"),
      fetch("/api/focus"),
    ]);
    if (statsRes.ok) setStats(await statsRes.json());
    if (sessionsRes.ok) setSessions(await sessionsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleAddSession(e: React.FormEvent) {
    e.preventDefault();
    if (!addProject || !addSubject || !addDuration) return;
    setAddLoading(true);
    const res = await fetch("/api/focus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: addProject,
        subject: addSubject,
        duration: parseInt(addDuration),
        notes: addNotes,
      }),
    });
    if (res.ok) {
      setShowAddModal(false);
      setAddProject("");
      setAddSubject("");
      setAddDuration("25");
      setAddNotes("");
      fetchData();
    }
    setAddLoading(false);
  }

  function handleTimerComplete(duration: number) {
    // Auto-save focus session when timer completes
    const now = new Date();
    fetch("/api/focus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: "专注计时",
        subject: "番茄钟",
        duration,
        notes: `${now.toLocaleTimeString("zh-CN")} 完成一轮专注`,
      }),
    }).then(() => fetchData());
  }

  const hours = stats ? Math.floor(stats.todayMinutes / 60) : 0;
  const mins = stats ? stats.todayMinutes % 60 : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[--color-text] mb-1">
            专注
          </h1>
          <p className="text-sm text-[--color-text-secondary]">
            深度工作，持续进步
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-full bg-[--color-text] text-white text-sm font-medium hover:bg-[--color-accent-hover] transition-colors"
          >
            + 记录专注
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
              showSettings
                ? "border-[--color-text] bg-[--color-bg-secondary]"
                : "border-[--color-border] hover:border-[--color-text]"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="text-[--color-text-secondary]"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="mb-10 p-5 rounded-[--radius-lg] border border-[--color-border] bg-white">
          <h3 className="text-sm font-medium text-[--color-text] mb-4">
            个性化设置
          </h3>

          {/* Accent color */}
          <div className="mb-4">
            <p className="text-xs text-[--color-text-secondary] mb-2">
              主题色
            </p>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setAccent(c.value)}
                  className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: c.value,
                    borderColor:
                      accentColor === c.value
                        ? c.value
                        : "var(--color-border)",
                    boxShadow:
                      accentColor === c.value
                        ? `0 0 0 2px white, 0 0 0 4px ${c.value}`
                        : "none",
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Background */}
          <div>
            <p className="text-xs text-[--color-text-secondary] mb-2">
              背景样式
            </p>
            <div className="flex gap-2 flex-wrap">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.name}
                  onClick={() => {
                    setBgImage(bg.value);
                    if (bg.size) setBgSize(bg.size);
                    else setBgSize("auto");
                  }}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    bgImage === bg.value
                      ? "border-[--color-text] bg-[--color-text] text-white"
                      : "border-[--color-border] text-[--color-text-secondary] hover:border-[--color-text]"
                  }`}
                >
                  {bg.name}
                </button>
              ))}
              <button
                onClick={() => {
                  const url = prompt("输入背景图片 URL：");
                  if (url) {
                    setBgImage(`url(${url})`);
                    setBgSize("cover");
                  }
                }}
                className="px-3 py-1.5 text-xs rounded-full border border-dashed border-[--color-border] text-[--color-text-tertiary] hover:border-[--color-text] transition-colors"
              >
                + 自定义
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Today stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatCard
          label="今日专注"
          value={
            loading
              ? "--"
              : hours > 0
              ? `${hours} 小时 ${mins} 分钟`
              : `${mins} 分钟`
          }
        />
        <StatCard
          label="今日次数"
          value={loading ? "--" : `${stats?.todaySessions || 0} 次`}
        />
        <StatCard
          label="本周累计"
          value={
            loading
              ? "--"
              : `${Math.floor((stats?.weekMinutes || 0) / 60)} 小时`
          }
        />
        <StatCard
          label="总专注"
          value={
            loading
              ? "--"
              : `${Math.floor((stats?.totalMinutes || 0) / 60)} 小时`
          }
        />
      </div>

      {/* Timer Section */}
      <div className="mb-10">
        <div className="bg-white rounded-[--radius-xl] border border-[--color-border] p-8 flex flex-col items-center">
          <h2 className="text-sm text-[--color-text-secondary] mb-6 tracking-wide">
            番茄钟
          </h2>
          <FocusTimer onComplete={handleTimerComplete} />
        </div>
      </div>

      {/* Charts + Todo grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Charts */}
        <div className="md:col-span-2 bg-white rounded-[--radius-xl] border border-[--color-border] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[--color-text]">
              数据统计
            </h3>
            <div className="flex gap-1 bg-[--color-bg-secondary] rounded-full p-0.5">
              {[
                { key: "bar" as const, label: "直方图" },
                { key: "pie" as const, label: "饼图" },
                { key: "trend" as const, label: "趋势" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveChart(key)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    activeChart === key
                      ? "bg-white text-[--color-text] font-medium shadow-sm"
                      : "text-[--color-text-secondary] hover:text-[--color-text]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {activeChart === "bar" && (
            <FocusBarChart data={stats?.dailyBreakdown || []} />
          )}
          {activeChart === "pie" && (
            <div>
              <FocusPieChart
                data={
                  stats?.subjectBreakdown.map((s) => ({
                    name: s.subject,
                    minutes: s.minutes,
                  })) || []
                }
              />
              <PieLegend
                data={
                  stats?.subjectBreakdown.map((s) => ({
                    name: s.subject,
                    minutes: s.minutes,
                  })) || []
                }
              />
            </div>
          )}
          {activeChart === "trend" && (
            <FocusTrendChart data={stats?.dailyBreakdown || []} />
          )}
        </div>

        {/* Todo Panel */}
        <div className="md:col-span-1">
          <TodoPanel />
        </div>
      </div>

      {/* Recent sessions */}
      <div className="bg-white rounded-[--radius-xl] border border-[--color-border] p-5">
        <h3 className="text-sm font-medium text-[--color-text] mb-4">
          最近专注记录
        </h3>
        {sessions.length === 0 ? (
          <p className="text-xs text-[--color-text-tertiary] text-center py-6">
            还没有专注记录，开始你的第一次专注吧
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 8).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-2 px-3 rounded-[--radius-sm] hover:bg-[--color-bg-tertiary] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[--color-text] shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[--color-text] truncate">
                        {s.subject}
                      </span>
                      <span className="text-[10px] text-[--color-text-tertiary] bg-[--color-bg-secondary] px-1.5 py-0.5 rounded-full shrink-0">
                        {s.project}
                      </span>
                    </div>
                    {s.notes && (
                      <p className="text-xs text-[--color-text-tertiary] truncate mt-0.5">
                        {s.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="text-sm text-[--color-text] tabular-nums">
                    {s.duration} 分钟
                  </span>
                  <p className="text-[10px] text-[--color-text-tertiary]">
                    {s.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Session Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-[--radius-xl] border border-[--color-border] p-6 w-full max-w-sm mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[--color-text] mb-5">
              记录专注
            </h3>
            <form onSubmit={handleAddSession} className="space-y-4">
              <div>
                <label className="block text-xs text-[--color-text-secondary] mb-1.5">
                  专注项目
                </label>
                <input
                  type="text"
                  value={addProject}
                  onChange={(e) => setAddProject(e.target.value)}
                  placeholder="例如：编程学习"
                  required
                  className="w-full border border-[--color-border] rounded-[--radius-sm] px-3 py-2 text-sm text-[--color-text] bg-[--color-bg-tertiary] focus:outline-none focus:border-[--color-text] transition-colors placeholder:text-[--color-text-tertiary]"
                />
              </div>
              <div>
                <label className="block text-xs text-[--color-text-secondary] mb-1.5">
                  学习科目
                </label>
                <input
                  type="text"
                  value={addSubject}
                  onChange={(e) => setAddSubject(e.target.value)}
                  placeholder="例如：React"
                  required
                  className="w-full border border-[--color-border] rounded-[--radius-sm] px-3 py-2 text-sm text-[--color-text] bg-[--color-bg-tertiary] focus:outline-none focus:border-[--color-text] transition-colors placeholder:text-[--color-text-tertiary]"
                />
              </div>
              <div>
                <label className="block text-xs text-[--color-text-secondary] mb-1.5">
                  专注时长（分钟）
                </label>
                <input
                  type="number"
                  value={addDuration}
                  onChange={(e) => setAddDuration(e.target.value)}
                  min={1}
                  required
                  className="w-full border border-[--color-border] rounded-[--radius-sm] px-3 py-2 text-sm text-[--color-text] bg-[--color-bg-tertiary] focus:outline-none focus:border-[--color-text] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[--color-text-secondary] mb-1.5">
                  备注（可选）
                </label>
                <textarea
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  rows={2}
                  placeholder="今天学了什么..."
                  className="w-full border border-[--color-border] rounded-[--radius-sm] px-3 py-2 text-sm text-[--color-text] bg-[--color-bg-tertiary] focus:outline-none focus:border-[--color-text] transition-colors placeholder:text-[--color-text-tertiary] resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-full border border-[--color-border] text-sm text-[--color-text-secondary] hover:text-[--color-text] transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-2 rounded-full bg-[--color-text] text-white text-sm font-medium hover:bg-[--color-accent-hover] transition-colors disabled:opacity-50"
                >
                  {addLoading ? "保存中..." : "保存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-[--radius-lg] border border-[--color-border] p-4 text-center">
      <div className="text-2xl font-semibold text-[--color-text] mb-1 tabular-nums">
        {value}
      </div>
      <div className="text-[10px] text-[--color-text-tertiary] tracking-wider">
        {label}
      </div>
    </div>
  );
}
