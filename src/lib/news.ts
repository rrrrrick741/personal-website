import Parser from "rss-parser";

const parser = new Parser();

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  category: "politics" | "economics" | "ai";
  pubDate: string;
  summary: string;
}

const RSS_SOURCES: { url: string; category: NewsItem["category"] }[] = [
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "politics" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", category: "politics" },
  {
    url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147",
    category: "economics",
  },
  {
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    category: "economics",
  },
  {
    url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
    category: "ai",
  },
  {
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    category: "ai",
  },
];

function parseSummary(item: any): string {
  const raw = item.contentSnippet || item.content || item.summary || "";
  return raw.replace(/\s+/g, " ").trim().substring(0, 200);
}

export async function fetchNewsByCategory(
  category: "politics" | "economics" | "ai"
): Promise<NewsItem[]> {
  const sources = RSS_SOURCES.filter((s) => s.category === category);

  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      return feed.items?.slice(0, 8).map((item) => ({
        title: item.title || "Untitled",
        link: item.link || "#",
        source: feed.title || source.url,
        category,
        pubDate: item.pubDate || new Date().toISOString(),
        summary: parseSummary(item),
      }));
    })
  );

  const allItems: NewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      allItems.push(...(result.value as NewsItem[]));
    }
  }

  return allItems
    .sort(
      (a, b) =>
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    )
    .slice(0, 10);
}

export async function fetchAllNews(): Promise<
  Record<NewsItem["category"], NewsItem[]>
> {
  const [politics, economics, ai] = await Promise.all([
    fetchNewsByCategory("politics"),
    fetchNewsByCategory("economics"),
    fetchNewsByCategory("ai"),
  ]);

  return { politics, economics, ai };
}
