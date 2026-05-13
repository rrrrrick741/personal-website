"use client";

import { useState } from "react";
import type { GitHubRepo } from "@/lib/github";

interface Props {
  repo: GitHubRepo;
}

export default function GitHubRepoCard({ repo }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-[--color-border] rounded-[--radius-lg] bg-white hover:bg-[--color-bg-secondary]/50 transition-colors">
      <div className="p-5">
        {/* Rank & Title */}
        <div className="flex items-start gap-4">
          <span className="text-2xl font-bold text-[--color-text-tertiary] tabular-nums shrink-0">
            #{repo.rank}
          </span>
          <div className="min-w-0 flex-1">
            {/* Repo name */}
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold text-[--color-text] hover:text-[--color-accent] transition-colors no-underline"
            >
              {repo.name}
            </a>

            {/* Description */}
            {repo.description && (
              <p className="text-sm text-[--color-text-secondary] mt-1.5 leading-relaxed">
                {repo.description}
              </p>
            )}

            {/* Meta: language, topics, stars */}
            <div className="flex flex-wrap items-center gap-3 mt-2.5">
              {repo.language && (
                <span className="text-xs text-[--color-text-tertiary] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[--color-accent] inline-block" />
                  {repo.language}
                </span>
              )}
              {repo.topics.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-[10px] text-[--color-text-secondary] bg-[--color-bg-secondary] px-2 py-0.5 rounded-full"
                >
                  {t}
                </span>
              ))}
              <span className="ml-auto text-xs text-[--color-text-tertiary] flex items-center gap-3">
                <span title="Total stars">⭐ {repo.stars.toLocaleString()}</span>
                {/* <span title="Growth this week" className="text-[--color-success]">
                  +{repo.starsGrowth.toLocaleString()}
                </span> */}
              </span>
            </div>
          </div>
        </div>

        {/* Toggle README */}
        {repo.readme && (
          <div className="mt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-[--color-text-secondary] hover:text-[--color-text] transition-colors flex items-center gap-1"
            >
              <span className={expanded ? "rotate-90 transition-transform" : "transition-transform"}>
                ▸
              </span>
              {expanded ? "收起介绍" : "查看介绍 / 代码"}
            </button>
            {expanded && (
              <pre className="mt-2 p-4 bg-[--color-bg-secondary] rounded-[--radius-sm] text-xs text-[--color-text-secondary] leading-relaxed overflow-x-auto max-h-80 overflow-y-auto font-mono whitespace-pre-wrap border-0">
                {repo.readme}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
