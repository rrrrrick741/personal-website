import fs from "fs";
import path from "path";

export interface FocusSession {
  id: string;
  date: string;
  project: string;
  subject: string;
  duration: number; // minutes
  timestamp: string; // ISO datetime
  notes?: string;
}

export interface FocusStats {
  todayMinutes: number;
  todaySessions: number;
  weekMinutes: number;
  weekSessions: number;
  totalMinutes: number;
  totalSessions: number;
  projectBreakdown: { project: string; minutes: number }[];
  subjectBreakdown: { subject: string; minutes: number }[];
  dailyBreakdown: { date: string; minutes: number }[];
}

const DATA_DIR = path.join(process.cwd(), "content");
const FOCUS_FILE = path.join(DATA_DIR, "focus-sessions.json");

function readSessions(): FocusSession[] {
  if (!fs.existsSync(FOCUS_FILE)) {
    // Auto-migrate from old learning markdown files
    const migrated = migrateFromMarkdown();
    if (migrated.length > 0) {
      writeSessions(migrated);
      return migrated;
    }
    return [];
  }
  const raw = fs.readFileSync(FOCUS_FILE, "utf-8");
  return JSON.parse(raw);
}

function migrateFromMarkdown(): FocusSession[] {
  const learningDir = path.join(DATA_DIR, "learning");
  if (!fs.existsSync(learningDir)) return [];

  const files = fs.readdirSync(learningDir).filter((f) => f.endsWith(".md"));
  if (files.length === 0) return [];

  const sessions: FocusSession[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(learningDir, file), "utf-8");
    // Simple frontmatter extraction (avoid gray-matter dependency here)
    const match = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!match) continue;

    const fm = match[1];
    const dateMatch = fm.match(/date:\s*(.+)/);
    const subjectMatch = fm.match(/subject:\s*(.+)/);
    const durationMatch = fm.match(/duration:\s*(.+)/);
    const tagsMatch = fm.match(/tags:\s*\[(.+)\]/);

    if (dateMatch && subjectMatch && durationMatch) {
      const dateStr = dateMatch[1].trim();
      const tags = tagsMatch
        ? tagsMatch[1].split(",").map((t) => t.trim())
        : [];
      const allTags = tags.length > 0 ? tags : ["学习"];

      sessions.push({
        id: `migrated-${file.replace(".md", "")}`,
        date: dateStr,
        project: allTags[0],
        subject: subjectMatch[1].trim(),
        duration: parseInt(durationMatch[1]),
        timestamp: new Date(dateStr).toISOString(),
        notes: raw.replace(/^---[\s\S]*?---/, "").trim().substring(0, 200),
      });
    }
  }

  return sessions.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function writeSessions(sessions: FocusSession[]): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FOCUS_FILE, JSON.stringify(sessions, null, 2), "utf-8");
}

export function getAllFocusSessions(): FocusSession[] {
  return readSessions().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function addFocusSession(
  session: Omit<FocusSession, "id" | "timestamp">
): FocusSession {
  const sessions = readSessions();
  const newSession: FocusSession = {
    ...session,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    timestamp: new Date().toISOString(),
  };
  sessions.push(newSession);
  writeSessions(sessions);
  return newSession;
}

export function deleteFocusSession(id: string): boolean {
  const sessions = readSessions();
  const filtered = sessions.filter((s) => s.id !== id);
  if (filtered.length === sessions.length) return false;
  writeSessions(filtered);
  return true;
}

export function getFocusStats(): FocusStats {
  const sessions = readSessions();
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // Today
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  // This week
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekSessions = sessions.filter(
    (s) => new Date(s.timestamp) >= weekStart
  );
  const weekMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);

  // Total
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);

  // Project breakdown
  const projectMap = new Map<string, number>();
  for (const s of sessions) {
    projectMap.set(s.project, (projectMap.get(s.project) || 0) + s.duration);
  }
  const projectBreakdown = Array.from(projectMap.entries())
    .map(([project, minutes]) => ({ project, minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  // Subject breakdown
  const subjectMap = new Map<string, number>();
  for (const s of sessions) {
    subjectMap.set(s.subject, (subjectMap.get(s.subject) || 0) + s.duration);
  }
  const subjectBreakdown = Array.from(subjectMap.entries())
    .map(([subject, minutes]) => ({ subject, minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  // Daily breakdown (last 30 days)
  const dailyMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dailyMap.set(d.toISOString().split("T")[0], 0);
  }
  for (const s of sessions) {
    if (dailyMap.has(s.date)) {
      dailyMap.set(s.date, (dailyMap.get(s.date) || 0) + s.duration);
    }
  }
  const dailyBreakdown = Array.from(dailyMap.entries()).map(
    ([date, minutes]) => ({ date, minutes })
  );

  return {
    todayMinutes,
    todaySessions: todaySessions.length,
    weekMinutes,
    weekSessions: weekSessions.length,
    totalMinutes,
    totalSessions: sessions.length,
    projectBreakdown,
    subjectBreakdown,
    dailyBreakdown,
  };
}
