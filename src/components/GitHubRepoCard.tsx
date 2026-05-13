"use client";

import { useState } from "react";
import type { GitHubRepo } from "@/lib/github";

interface Props {
  repo: GitHubRepo;
}

export default function GitHubRepoCard({ repo }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border border-[--color-border] rounded-[--radius-lg] bg-white transition-colors cursor-pointer ${
        expanded ? "border-[--color-text-tertiary]" : "hover:bg-[--color-bg-secondary]/50"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5">
        {/* Rank & Title */}
        <div className="flex items-start gap-4">
          <span className="text-2xl font-bold text-[--color-text-tertiary] tabular-nums shrink-0 mt-0.5">
            #{repo.rank}
          </span>
          <div className="min-w-0 flex-1">
            {/* Project name */}
            <h3 className="text-base font-semibold text-[--color-text]">
              {repo.name}
            </h3>

            {/* URL — visible only when expanded */}
            {expanded && (
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-[--color-text-tertiary] hover:text-[--color-accent] transition-colors break-all mt-0.5 inline-block"
              >
                {repo.url.replace("https://", "")}
              </a>
            )}

            {/* Brief description — always visible */}
            {repo.description && (
              <p className="text-sm text-[--color-text-secondary] mt-1.5 leading-relaxed line-clamp-2">
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
              {repo.topics.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="text-[10px] text-[--color-text-secondary] bg-[--color-bg-secondary] px-2 py-0.5 rounded-full"
                >
                  {t}
                </span>
              ))}
              <span className="ml-auto text-xs text-[--color-text-tertiary] flex items-center gap-1">
                ⭐ {repo.stars.toLocaleString()}
              </span>
            </div>

            {/* Expand indicator — collapsed */}
            {!expanded && repo.readme && (
              <span className="text-[10px] text-[--color-text-tertiary] mt-2 inline-block">
                点击查看详情 →
              </span>
            )}
          </div>
        </div>

        {/* Detailed intro / README — expanded */}
        {expanded && repo.readme && (
          <div className="mt-4 pt-4 border-t border-[--color-border]">
            <h4 className="text-xs font-medium text-[--color-text] mb-2 uppercase tracking-wider">
              项目介绍 / 功能
            </h4>
            <pre className="p-4 bg-[--color-bg-secondary] rounded-[--radius-sm] text-xs text-[--color-text-secondary] leading-relaxed overflow-x-auto max-h-80 overflow-y-auto font-mono whitespace-pre-wrap border-0">
              {repo.readme}
            </pre>
            <div className="mt-3 flex items-center justify-between">
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-[--color-text-secondary] hover:text-[--color-text] transition-colors underline underline-offset-2"
              >
                在 GitHub 上查看 →
              </a>
              <span className="text-[10px] text-[--color-text-tertiary]">
                点击收起
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
