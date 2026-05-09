"use client";

import { useState, useEffect } from "react";
import type { NewsItem } from "@/lib/news";
import NewsCard from "@/components/NewsCard";

const tabs: { key: NewsItem["category"]; label: string }[] = [
  { key: "politics", label: "Politics" },
  { key: "economics", label: "Economics" },
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
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setNews(data);
      } catch {
        setError("Failed to load news. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-[--color-text] mb-2">
          News
        </h1>
        <p className="text-[--color-text-secondary]">
          Daily top 10 stories across politics, economics, and AI.
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
                ? "border-[--color-text] text-[--color-text] font-medium"
                : "border-transparent text-[--color-text-secondary] hover:text-[--color-text]"
            }`}
          >
            {label}
            {!loading && news[key] && (
              <span className="ml-1.5 text-xs text-[--color-text-secondary]">
                ({news[key].length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="border border-[--color-border] rounded-lg p-5 animate-pulse"
            >
              <div className="h-3 bg-[--color-border] rounded w-20 mb-3" />
              <div className="h-4 bg-[--color-border] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[--color-border] rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-[--color-text-secondary]">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {news[activeTab]?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[--color-text-secondary]">
                No news available right now.
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
