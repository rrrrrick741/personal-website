import Link from "next/link";

export const dynamic = "force-static";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      {/* Hero */}
      <section className="mb-20">
        <h1 className="text-4xl font-bold tracking-tight text-[--color-text] mb-4">
          你好，我是 Rick。
        </h1>
        <p className="text-base text-[--color-text-secondary] max-w-xl leading-relaxed">
          一个极简的个人空间——追踪专注时间、管理每日待办、记录学习内容，
          浏览我关心的新闻，以及发现 GitHub 优质开源项目。
        </p>
      </section>

      {/* Section Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
        <Link
          href="/focus"
          className="block border border-[--color-border] rounded-[--radius-xl] p-8 hover:bg-[--color-bg-secondary] transition-colors no-underline group"
        >
          <div className="text-[10px] text-[--color-text-tertiary] uppercase tracking-widest mb-4">
            深度工作
          </div>
          <h2 className="text-2xl font-semibold text-[--color-text] mb-2 group-hover:text-[--color-accent] transition-colors">
            专注追踪
          </h2>
          <p className="text-sm text-[--color-text-secondary] leading-relaxed">
            番茄钟计时 · 项目记录 · 可视化统计 · 每日待办
          </p>
        </Link>
        <Link
          href="/news"
          className="block border border-[--color-border] rounded-[--radius-xl] p-8 hover:bg-[--color-bg-secondary] transition-colors no-underline group"
        >
          <div className="text-[10px] text-[--color-text-tertiary] uppercase tracking-widest mb-4">
            资讯速览
          </div>
          <h2 className="text-2xl font-semibold text-[--color-text] mb-2 group-hover:text-[--color-accent] transition-colors">
            新闻摘要
          </h2>
          <p className="text-sm text-[--color-text-secondary] leading-relaxed">
            政治 · 经济 · AI — 每日 Top 10 精选
          </p>
        </Link>
        <Link
          href="/github"
          className="block border border-[--color-border] rounded-[--radius-xl] p-8 hover:bg-[--color-bg-secondary] transition-colors no-underline group"
        >
          <div className="text-[10px] text-[--color-text-tertiary] uppercase tracking-widest mb-4">
            开源趋势
          </div>
          <h2 className="text-2xl font-semibold text-[--color-text] mb-2 group-hover:text-[--color-accent] transition-colors">
            GitHub 热门
          </h2>
          <p className="text-sm text-[--color-text-secondary] leading-relaxed">
            每周增长最快的 10 个开源项目
          </p>
        </Link>
      </section>

      {/* Bottom quote */}
      <section className="text-center">
        <p className="text-xs text-[--color-text-tertiary] tracking-wide">
          日拱一卒，功不唐捐
        </p>
      </section>
    </div>
  );
}
