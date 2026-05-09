import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface LearningEntry {
  slug: string;
  date: string;
  subject: string;
  duration: number;
  tags: string[];
  content: string;
}

const LEARNING_DIR = path.join(process.cwd(), "content", "learning");

export function getAllLearningEntries(): LearningEntry[] {
  if (!fs.existsSync(LEARNING_DIR)) return [];

  const files = fs.readdirSync(LEARNING_DIR).filter((f) => f.endsWith(".md"));

  const entries = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(LEARNING_DIR, file), "utf-8");
      const { data, content } = matter(raw);

      const rawDate = data.date;
      const dateStr =
        rawDate instanceof Date
          ? rawDate.toISOString().split("T")[0]
          : String(rawDate || file.replace(/\.md$/, ""));

      return {
        slug: file.replace(/\.md$/, ""),
        date: dateStr,
        subject: data.subject || "Untitled",
        duration: data.duration || 0,
        tags: data.tags || [],
        content,
      } as LearningEntry;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return entries;
}

export function getLearningStats(entries: LearningEntry[]) {
  const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const thisWeekMinutes = entries
    .filter((e) => new Date(e.date) >= weekStart)
    .reduce((sum, e) => sum + e.duration, 0);
  const thisWeekHours = Math.round((thisWeekMinutes / 60) * 10) / 10;

  const uniqueSubjects = [...new Set(entries.map((e) => e.subject))];

  return {
    totalEntries: entries.length,
    totalHours,
    thisWeekHours,
    uniqueSubjects: uniqueSubjects.length,
  };
}

export function getRecentEntries(entries: LearningEntry[], count = 3) {
  return entries.slice(0, count);
}
