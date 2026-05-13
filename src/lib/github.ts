import fs from "fs";
import path from "path";

export interface GitHubRepo {
  rank: number;
  name: string; // "owner/repo"
  url: string;
  description: string;
  stars: number;
  language: string;
  topics: string[];
  readme: string;
  starsGrowth: number; // stars gained this week
}

export interface WeeklySnapshot {
  week: string;
  startDate: string;
  endDate: string;
  repos: GitHubRepo[];
}

const CONTENT_DIR = path.join(process.cwd(), "content", "github");

/** Generate ISO week key e.g. "2026-W20" */
export function getWeekKey(date: Date = new Date()): string {
  // Get the Monday of the current week
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  const year = monday.getFullYear();
  // ISO week number
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

export async function fetchWeeklyTrending(): Promise<GitHubRepo[]> {
  const weekKey = getWeekKey();
  const { startDate } = getWeekDates(weekKey);

  // Search repos created in the last 7 days, sorted by stars
  const query = `created:>=${startDate}`;
  const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`;

  const data = await githubFetch(url);
  const items: GitHubSearchItem[] = data.items || [];

  const repos: GitHubRepo[] = await Promise.all(
    items.slice(0, 10).map(async (item, i) => {
      const previousStars = 0; // New repos start at 0
      const readme = await fetchRepoReadme(item.full_name).catch(() => "");

      return {
        rank: i + 1,
        name: item.full_name,
        url: item.html_url,
        description: item.description || "",
        stars: item.stargazers_count,
        language: item.language || "Unknown",
        topics: item.topics || [],
        readme,
        starsGrowth: item.stargazers_count - previousStars,
      };
    })
  );

  return repos;
}

async function fetchRepoReadme(fullName: string): Promise<string> {
  const url = `${GITHUB_API}/repos/${fullName}/readme`;
  const data = await githubFetch(url);

  // README content is base64 encoded
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  // Truncate to 2000 chars for preview
  return content.length > 2000 ? content.substring(0, 2000) + "\n\n... (truncated)" : content;
}

export function saveWeeklySnapshot(repos: GitHubRepo[], weekKey?: string): void {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  const key = weekKey || getWeekKey();
  const { startDate, endDate } = getWeekDates(key);

  const snapshot: WeeklySnapshot = {
    week: key,
    startDate,
    endDate,
    repos,
  };

  const filePath = path.join(CONTENT_DIR, `${key}.json`);
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), "utf-8");
}

export function loadWeeklySnapshot(weekKey: string): WeeklySnapshot | null {
  const filePath = path.join(CONTENT_DIR, `${weekKey}.json`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as WeeklySnapshot;
}

export function listAllWeeks(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort()
    .reverse();
}
