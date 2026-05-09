import type { NewsItem } from "@/lib/news";

interface Props {
  item: NewsItem;
}

const categoryLabel: Record<NewsItem["category"], string> = {
  politics: "政治",
  economics: "经济",
  ai: "AI",
};

export default function NewsCard({ item }: Props) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-[--color-border] rounded-[--radius-lg] p-5 bg-white hover:bg-[--color-bg-secondary] transition-colors no-underline group"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-[--color-text-secondary] bg-[--color-bg-secondary] px-2 py-0.5 rounded-full">
          {categoryLabel[item.category]}
        </span>
        <span className="text-xs text-[--color-text-tertiary]">
          {item.source}
        </span>
        <span className="ml-auto text-[10px] text-[--color-text-tertiary] opacity-0 group-hover:opacity-100 transition-opacity">
          阅读原文 →
        </span>
      </div>
      <h3 className="text-base font-medium text-[--color-text] mb-2 group-hover:text-[--color-accent] transition-colors line-clamp-2">
        {item.title}
      </h3>
      <p className="text-sm text-[--color-text-secondary] leading-relaxed line-clamp-2">
        {item.summary}
      </p>
      <div className="flex items-center justify-between mt-2">
        <time className="text-xs text-[--color-text-tertiary]">
          {new Date(item.pubDate).toLocaleDateString("zh-CN")}
        </time>
        <span className="text-xs text-[--color-text-secondary] underline underline-offset-2 opacity-0 group-hover:opacity-100 transition-opacity">
          阅读原文
        </span>
      </div>
    </a>
  );
}
