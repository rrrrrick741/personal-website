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

export interface GitHubRepoDetail extends GitHubRepo {
  owner: string;
  repoName: string;
  homepage: string;
  forks: number;
  openIssues: number;
  license: string;
  updatedAt: string;
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

interface GitHubRepoItem extends GitHubSearchItem {
  name: string;
  owner: {
    login: string;
  };
  homepage: string | null;
  forks_count: number;
  open_issues_count: number;
  license: {
    name: string;
  } | null;
  updated_at: string;
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

export async function fetchRepoDetail(fullName: string): Promise<GitHubRepoDetail> {
  const url = `${GITHUB_API}/repos/${fullName}`;
  const item: GitHubRepoItem = await githubFetch(url);
  const readmeResult = await fetchRepoReadme(item.full_name).catch(() => ({
    content: "",
    lang: "en" as const,
  }));

  return {
    rank: 0,
    name: item.full_name,
    owner: item.owner.login,
    repoName: item.name,
    url: item.html_url,
    description: item.description || "",
    stars: item.stargazers_count,
    language: item.language || "Unknown",
    topics: item.topics || [],
    readme: readmeResult.content,
    readmeLang: readmeResult.lang,
    starsGrowth: item.stargazers_count,
    homepage: item.homepage || "",
    forks: item.forks_count,
    openIssues: item.open_issues_count,
    license: item.license?.name || "未声明",
    updatedAt: item.updated_at,
  };
}

export function getRepoDetailHref(fullName: string): string {
  const [owner, repo] = fullName.split("/");
  return `/github/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

export function getChineseRepoIntro(repo: GitHubRepo): string {
  const purpose = inferRepoPurpose(repo);
  const languageText =
    repo.language && repo.language !== "Unknown"
      ? `主要使用 ${repo.language} 开发`
      : "技术栈暂未标注";
  const topicText =
    repo.topics.length > 0
      ? `，关注 ${repo.topics.slice(0, 4).join("、")} 等方向`
      : "";
  const chineseDescription = hasChineseText(repo.description)
    ? `项目说明：${repo.description}`
    : "可结合 README、源码目录和 issue 活跃度继续判断是否值得深入学习。";

  return `${repo.name} 是一个面向${purpose}的开源项目，${languageText}${topicText}，目前获得 ${repo.stars.toLocaleString()} 个 Star。${chineseDescription}`;
}

export function getChineseFeaturePoints(repo: GitHubRepo): string[] {
  const purpose = inferRepoPurpose(repo);
  const points = [
    `核心用途偏向${purpose}，适合先从项目文档和示例代码了解它解决的问题。`,
    repo.language && repo.language !== "Unknown"
      ? `围绕 ${repo.language} 生态或相关工具链构建。`
      : "仓库语言信息暂未标注，可进入 GitHub 查看更完整的技术栈。",
    repo.topics.length > 0
      ? `覆盖 ${repo.topics.slice(0, 5).join("、")} 等方向，适合快速判断项目用途。`
      : "暂无主题标签，建议结合 README 和源码目录了解功能边界。",
    repo.readme
      ? "README 提供了项目说明、安装方式或使用示例，可作为上手入口。"
      : "当前没有读取到 README，建议直接打开 GitHub 仓库查看文档。",
  ];

  return points;
}

function inferRepoPurpose(repo: GitHubRepo): string {
  const text = `${repo.name} ${repo.description} ${repo.topics.join(" ")}`.toLowerCase();

  if (matchesAny(text, ["trading", "trade", "dex", "perp", "crypto", "defi", "bot"])) {
    return "自动化交易、量化策略或加密货币工具";
  }

  if (matchesAny(text, ["ai", "llm", "agent", "chatgpt", "model", "rag"])) {
    return "人工智能应用、模型工具或智能体开发";
  }

  if (matchesAny(text, ["dashboard", "admin", "panel", "analytics", "monitor"])) {
    return "数据看板、后台管理或监控分析";
  }

  if (matchesAny(text, ["ui", "component", "frontend", "react", "next", "vue"])) {
    return "前端界面、组件库或 Web 应用开发";
  }

  if (matchesAny(text, ["cli", "terminal", "command-line", "tool"])) {
    return "命令行工具或开发效率提升";
  }

  if (matchesAny(text, ["game", "roblox", "warzone", "call-of-duty", "minecraft"])) {
    return "游戏资料、游戏工具或相关实验项目";
  }

  if (matchesAny(text, ["docs", "documentation", "template", "example", "starter"])) {
    return "文档模板、示例工程或快速启动项目";
  }

  if (matchesAny(text, ["api", "sdk", "library", "framework"])) {
    return "API、SDK、框架或基础库建设";
  }

  return "具体技术场景";
}

function matchesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function hasChineseText(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
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
