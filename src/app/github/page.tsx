"use client";

import { useState, useEffect } from "react";
import GitHubRepoCard from "@/components/GitHubRepoCard";
import type { WeeklySnapshot } from "@/lib/github";

export default function GitHubTrendingPage() {
  const [data, setData] = useState<WeeklySnapshot | null>(null);
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const url = selectedWeek
          ? `/api/github/trending?week=${selectedWeek}`
          : "/api/github/trending";
        const res = await fetch(url);
        const json = await res.json();
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
          if (json.availableWeeks) {
            setAvailableWeeks(json.availableWeeks);
          }
        }
      } catch {
        setError("加载失败，请稍后重试。");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedWeek]);

  const displayDate =
    data?.startDate && data?.endDate
      ? `${data.startDate} — ${data.endDate}`
      : "";

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-[--color-text] mb-2">
          GitHub 热门项目
        </h1>
        <p className="text-sm text-[--color-text-secondary]">
          每周增长最快的 10 个开源项目
          {displayDate && (
            <span className="ml-2 text-[--color-text-tertiary]">· {displayDate}</span>
          )}
        </p>
      </header>

      {/* Week selector */}
      {availableWeeks.length > 0 && (
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scroll-thin">
          <button
            onClick={() => setSelectedWeek("")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0 ${
              selectedWeek === ""
                ? "border-[--color-text] text-[--color-text] bg-[--color-bg-secondary]"
                : "border-[--color-border] text-[--color-text-secondary] hover:text-[--color-text] hover:border-[--color-text-tertiary]"
            }`}
          >
            本周
          </button>
          {availableWeeks.map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0 ${
                selectedWeek === w
                  ? "border-[--color-text] text-[--color-text] bg-[--color-bg-secondary]"
                  : "border-[--color-border] text-[--color-text-secondary] hover:text-[--color-text] hover:border-[--color-text-tertiary]"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="border border-[--color-border] rounded-[--radius-lg] p-5 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="h-8 w-8 bg-[--color-border] rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-[--color-border] rounded w-48 mb-3" />
                  <div className="h-3 bg-[--color-border] rounded w-full mb-2" />
                  <div className="h-3 bg-[--color-border] rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-sm text-[--color-text-secondary]">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && (!data?.repos || data.repos.length === 0) && (
        <div className="text-center py-12">
          <p className="text-sm text-[--color-text-secondary]">暂无数据。</p>
        </div>
      )}

      {/* Repo list */}
      {!loading && !error && data?.repos && data.repos.length > 0 && (
        <div className="space-y-3">
          {data.repos.map((repo) => (
            <GitHubRepoCard key={repo.name} repo={repo} />
          ))}
        </div>
      )}
    </div>
  );
}
