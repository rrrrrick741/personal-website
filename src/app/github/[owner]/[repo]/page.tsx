import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchRepoDetail,
  getChineseFeaturePoints,
  getChineseRepoIntro,
} from "@/lib/github";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

type Props = {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { owner, repo } = await params;

  return {
    title: `${owner}/${repo} — 项目详情`,
    description: `${owner}/${repo} 的 GitHub 项目详情`,
  };
}

export default async function GitHubRepoDetailPage({ params }: Props) {
  const { owner, repo } = await params;
  const fullName = `${owner}/${repo}`;
  const detail = await fetchRepoDetail(fullName).catch(() => null);

  if (!detail) {
    notFound();
  }

  const featurePoints = getChineseFeaturePoints(detail);
  const chineseIntro = getChineseRepoIntro(detail);
  const updatedDate = detail.updatedAt
    ? new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(detail.updatedAt))
    : "未知";

  return (
    <div className="page-shell py-16">
      <div className="mb-8">
        <Link
          href="/github"
          className="text-sm text-[--color-text-secondary] hover:text-[--color-text] transition-colors"
        >
          ← 返回 GitHub 热门项目
        </Link>
      </div>

      <header className="mb-8 border-b border-[--color-border] pb-8">
        <p className="eyebrow mb-3">Repository Detail</p>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {detail.language && detail.language !== "Unknown" && (
            <span className="warm-chip text-xs px-2 py-1 rounded-full">
              {detail.language}
            </span>
          )}
          {detail.topics.slice(0, 5).map((topic) => (
            <span
              key={topic}
              className="warm-chip text-xs px-2 py-1 rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[--color-text] break-words">
          {detail.name}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[--color-text-secondary]">
          {chineseIntro}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_240px]">
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-[--color-text] mb-3">
              项目简介
            </h2>
            <p className="text-sm leading-7 text-[--color-text-secondary]">
              {chineseIntro}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[--color-text] mb-3">
              项目功能
            </h2>
            <ul className="space-y-2">
              {featurePoints.map((point) => (
                <li
                  key={point}
                  className="text-sm leading-7 text-[--color-text-secondary] border-l-2 border-[--color-border] pl-3"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {detail.readme && (
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h2 className="text-lg font-semibold text-[--color-text]">
                  README 摘要
                </h2>
                <span className="text-[10px] text-[--color-text-tertiary] bg-[--color-bg-secondary] px-2 py-1 rounded-full">
                  {detail.readmeLang === "zh" ? "中文文档" : "原文摘录"}
                </span>
              </div>
              <pre className="p-4 bg-[--color-bg-secondary] rounded-[--radius-sm] text-xs text-[--color-text-secondary] leading-relaxed overflow-x-auto max-h-96 overflow-y-auto font-mono whitespace-pre-wrap border-0">
                {detail.readme}
              </pre>
            </div>
          )}
        </section>

        <aside className="space-y-3">
          <div className="warm-surface rounded-[--radius-lg] p-4">
            <p className="text-xs text-[--color-text-tertiary] mb-1">Star 数量</p>
            <p className="text-2xl font-semibold text-[--color-text]">
              ⭐ {detail.stars.toLocaleString()}
            </p>
          </div>

          <div className="warm-surface rounded-[--radius-lg] p-4 space-y-3">
            <div>
              <p className="text-xs text-[--color-text-tertiary] mb-1">项目链接</p>
              <a
                href={detail.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[--color-text] hover:text-[--color-accent-hover] underline underline-offset-4 break-all"
              >
                打开 GitHub 仓库
              </a>
            </div>
            {detail.homepage && (
              <div>
                <p className="text-xs text-[--color-text-tertiary] mb-1">项目主页</p>
                <a
                  href={detail.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[--color-text] hover:text-[--color-accent-hover] underline underline-offset-4 break-all"
                >
                  {detail.homepage}
                </a>
              </div>
            )}
          </div>

          <div className="warm-surface rounded-[--radius-lg] p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[--color-text-tertiary]">Fork</span>
              <span className="text-[--color-text]">{detail.forks.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[--color-text-tertiary]">Issue</span>
              <span className="text-[--color-text]">{detail.openIssues.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[--color-text-tertiary]">许可证</span>
              <span className="text-[--color-text] text-right">{detail.license}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[--color-text-tertiary]">最近更新</span>
              <span className="text-[--color-text]">{updatedDate}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
