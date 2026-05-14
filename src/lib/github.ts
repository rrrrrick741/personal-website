export interface GitHubRepo {
  rank: number;
  name: string;
  url: string;
  description: string;
  stars: number;
  language: string;
  topics: string[];
  readme: string;
  readmeLang: "zh" | "en";
  starsGrowth: number;
}

export interface WeeklySnapshot {
  week: string;
  startDate: string;
  endDate: string;
  repos: GitHubRepo[];
}

/** Generate ISO week key e.g. "2026-W20" */
export function getWeekKey(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  const year = monday.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const weekNum = Math.ceil(
    ((monday.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7
  );

  return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

/** Get Monday and Sunday for a given week key */
export function getWeekDates(weekKey: string): { startDate: string; endDate: string } {
  const [year, weekPart] = weekKey.split("-W");
  const weekNum = parseInt(weekPart, 10);

  const jan1 = new Date(parseInt(year), 0, 1);
  const daysOffset = (weekNum - 1) * 7 - jan1.getDay() + 1;
  const monday = new Date(jan1);
  monday.setDate(jan1.getDate() + daysOffset);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { startDate: fmt(monday), endDate: fmt(sunday) };
}

/** Generate list of recent week keys for the selector */
export function getRecentWeekKeys(count: number = 8): string[] {
  const today = new Date();
  const weeks: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i * 7);
    weeks.push(getWeekKey(d));
  }
  return [...new Set(weeks)];
}

const GITHUB_API = "https://api.github.com";

const headers: Record<string, string> = {
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "personal-website",
};

interface GitHubSearchItem {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  topics: string[];
}

async function githubFetch(url: string) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error: ${res.status} ${text.substring(0, 200)}`);
  }
  return res.json();
}

export async function fetchWeeklyTrending(startDate?: string): Promise<GitHubRepo[]> {
  const date = startDate || getWeekDates(getWeekKey()).startDate;

  const query = `created:>=${date}`;
  const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`;

  const data = await githubFetch(url);
  const items: GitHubSearchItem[] = data.items || [];

  const repos: GitHubRepo[] = await Promise.all(
    items.slice(0, 10).map(async (item, i) => {
      const readmeResult = await fetchRepoReadme(item.full_name).catch(() => ({
        content: "",
        lang: "en" as const,
      }));

      return {
        rank: i + 1,
        name: item.full_name,
        url: item.html_url,
        description: item.description || "",
        stars: item.stargazers_count,
        language: item.language || "Unknown",
        topics: item.topics || [],
        readme: readmeResult.content,
        readmeLang: readmeResult.lang,
        starsGrowth: item.stargazers_count,
      };
    })
  );

  return repos;
}

async function fetchRepoReadme(
  fullName: string
): Promise<{ content: string; lang: "zh" | "en" }> {
  const chineseVariants = [
    "README_CN.md",
    "README.zh-CN.md",
    "README.zh.md",
    "README-zh.md",
    "README-cn.md",
    "README_zh.md",
    "readme.zh-CN.md",
    "README-CN.md",
    "README_zh-CN.md",
  ];

  // Try Chinese README variants first
  for (const variant of chineseVariants) {
    try {
      const url = `${GITHUB_API}/repos/${fullName}/contents/${variant}`;
      const data = await githubFetch(url);
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      return {
        content: content.length > 2000 ? content.substring(0, 2000) + "\n\n... (截断)" : content,
        lang: "zh",
      };
    } catch {
      // Not found, try next variant
    }
  }

  // Fallback to default English README
  const url = `${GITHUB_API}/repos/${fullName}/readme`;
  const data = await githubFetch(url);

  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return {
    content: content.length > 2000 ? content.substring(0, 2000) + "\n\n... (truncated)" : content,
    lang: "en",
  };
}
