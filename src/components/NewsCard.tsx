import type { NewsItem } from "@/lib/news";

interface Props {
  item: NewsItem;
}

const categoryLabel: Record<NewsItem["category"], string> = {
  politics: "Politics",
  economics: "Economics",
  ai: "AI",
};

export default function NewsCard({ item }: Props) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-[--color-border] rounded-lg p-5 bg-white hover:bg-[--color-bg-secondary] transition-colors no-underline group"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-[--color-text-secondary] bg-[--color-bg-secondary] px-2 py-0.5 rounded">
          {categoryLabel[item.category]}
        </span>
        <span className="text-xs text-[--color-text-secondary]">
          {item.source}
        </span>
      </div>
      <h3 className="text-base font-medium text-[--color-text] mb-2 group-hover:text-[--color-accent] transition-colors line-clamp-2">
        {item.title}
      </h3>
      <p className="text-sm text-[--color-text-secondary] leading-relaxed line-clamp-2">
        {item.summary}
      </p>
      <time className="text-xs text-[--color-text-secondary] mt-2 block">
        {new Date(item.pubDate).toLocaleDateString("zh-CN")}
      </time>
    </a>
  );
}
