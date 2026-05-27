"use client";

import Link from "next/link";
import type { GitHubRepo } from "@/lib/github";
import { getChineseRepoIntro, getRepoDetailHref } from "@/lib/github";

interface Props {
  repo: GitHubRepo;
}

export default function GitHubRepoCard({ repo }: Props) {
  return (
    <Link
      href={getRepoDetailHref(repo.name)}
      className="warm-surface warm-surface-hover block rounded-[--radius-lg]"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <span className="text-2xl font-bold text-[--color-text-tertiary] tabular-nums shrink-0 mt-0.5">
            #{repo.rank}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-[--color-text]">
              {repo.name}
            </h3>

            <div className="mt-1.5">
              <span className="text-[10px] text-[--color-text-tertiary]">
                中文简介
              </span>
              <p className="text-sm text-[--color-text-secondary] mt-1.5 leading-relaxed line-clamp-2">
                {getChineseRepoIntro(repo)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2.5">
              {repo.language && (
                <span className="text-xs text-[--color-text-tertiary] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[--color-sage] inline-block" />
                  {repo.language}
                </span>
              )}
              {repo.topics.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="warm-chip text-[10px] px-2 py-0.5 rounded-full"
                >
                  {t}
                </span>
              ))}
              <span className="ml-auto text-xs text-[--color-text-tertiary] flex items-center gap-1">
                ⭐ {repo.stars.toLocaleString()}
              </span>
            </div>

            <span className="text-[10px] text-[--color-text-tertiary] mt-2 inline-block">
              点击进入项目详情 →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
