import Link from "next/link";

export const dynamic = "force-static";

export default function Home() {
  return (
    <div className="page-shell py-20 md:py-24">
      <section className="relative mb-16 overflow-hidden border-y border-[--color-border] py-14">
        <div className="absolute right-0 top-8 hidden h-px w-40 bg-[--color-accent-soft] md:block" />
        <div className="absolute right-0 top-8 hidden h-24 w-px bg-[--color-accent-soft] md:block" />
        <p className="eyebrow mb-4">Personal Workspace</p>
        <h1 className="max-w-2xl text-4xl font-semibold text-[--color-text] mb-5 md:text-5xl">
          你好，我是 Rick。
        </h1>
        <p className="text-base text-[--color-text-secondary] max-w-xl leading-8">
          一个极简的个人空间——追踪专注时间、管理每日待办、记录学习内容，
          浏览我关心的新闻，以及发现 GitHub 优质开源项目。
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
        <Link
          href="/focus"
          className="warm-surface warm-surface-hover block rounded-[--radius-xl] p-7 no-underline group"
        >
          <div className="eyebrow mb-4">
            深度工作
          </div>
          <h2 className="text-2xl font-semibold text-[--color-text] mb-3 group-hover:text-[--color-accent] transition-colors">
            专注追踪
          </h2>
          <p className="text-sm text-[--color-text-secondary] leading-7">
            番茄钟计时 · 项目记录 · 可视化统计 · 每日待办
          </p>
        </Link>
        <Link
          href="/news"
          className="warm-surface warm-surface-hover block rounded-[--radius-xl] p-7 no-underline group"
        >
          <div className="eyebrow mb-4">
            资讯速览
          </div>
          <h2 className="text-2xl font-semibold text-[--color-text] mb-3 group-hover:text-[--color-accent] transition-colors">
            新闻摘要
          </h2>
          <p className="text-sm text-[--color-text-secondary] leading-7">
            政治 · 经济 · AI — 每日 Top 10 精选
          </p>
        </Link>
        <Link
          href="/github"
          className="warm-surface warm-surface-hover block rounded-[--radius-xl] p-7 no-underline group"
        >
          <div className="eyebrow mb-4">
            开源趋势
          </div>
          <h2 className="text-2xl font-semibold text-[--color-text] mb-3 group-hover:text-[--color-accent] transition-colors">
            GitHub 热门
          </h2>
          <p className="text-sm text-[--color-text-secondary] leading-7">
            每周增长最快的 10 个开源项目
          </p>
        </Link>
      </section>

      <section className="flex items-center justify-center gap-4 text-center">
        <span className="h-px w-12 bg-[--color-border]" />
        <p className="text-xs text-[--color-text-tertiary]">
          日拱一卒，功不唐捐
        </p>
        <span className="h-px w-12 bg-[--color-border]" />
      </section>
    </div>
  );
}
