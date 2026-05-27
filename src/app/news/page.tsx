"use client";

import { useState, useEffect } from "react";
import type { NewsItem } from "@/lib/news";
import NewsCard from "@/components/NewsCard";

const tabs: { key: NewsItem["category"]; label: string }[] = [
  { key: "politics", label: "政治" },
  { key: "economics", label: "经济" },
  { key: "ai", label: "AI" },
];

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState<NewsItem["category"]>("politics");
  const [news, setNews] = useState<
    Record<NewsItem["category"], NewsItem[]>
  >({ politics: [], economics: [], ai: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/news");
        if (!res.ok) throw new Error("获取失败");
        const data = await res.json();
        setNews(data);
      } catch {
        setError("加载失败，请稍后重试。");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="page-shell py-16">
      <header className="mb-10 border-b border-[--color-border] pb-8">
        <p className="eyebrow mb-3">Daily Brief</p>
        <h1 className="text-3xl font-semibold text-[--color-text] mb-2">
          新闻
        </h1>
        <p className="text-sm text-[--color-text-secondary]">
          每日精选 — 政治 · 经济 · AI 各 10 条
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[--color-border] mb-8">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-[1px] ${
              activeTab === key
                ? "border-[--color-accent] text-[--color-text] font-medium"
                : "border-transparent text-[--color-text-secondary] hover:text-[--color-text]"
            }`}
          >
            {label}
            {!loading && news[key] && (
              <span className="ml-1.5 text-xs text-[--color-text-tertiary]">
                ({news[key].length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="border border-[--color-border] rounded-[--radius-lg] p-5 animate-pulse"
            >
              <div className="h-3 bg-[--color-border] rounded w-16 mb-3" />
              <div className="h-4 bg-[--color-border] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[--color-border] rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-sm text-[--color-text-secondary]">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {news[activeTab]?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-[--color-text-secondary]">
                暂无新闻。
              </p>
            </div>
          )}
          <div className="space-y-3">
            {news[activeTab]?.map((item, i) => (
              <NewsCard key={i} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
