import fs from "fs";
import path from "path";

export interface VocabWord {
  id: string;
  word: string;
  definition: string;
  example: string;
  tags: string[];
  mastered: boolean;
  createdAt: string;
  lastReviewed: string | null;
}

export interface EnglishStats {
  totalWords: number;
  masteredWords: number;
  todayAdded: number;
  todayReviewed: number;
  tagBreakdown: { tag: string; count: number }[];
}

const DATA_DIR = path.join(process.cwd(), "content");
const VOCAB_FILE = path.join(DATA_DIR, "vocabulary.json");

function readWords(): VocabWord[] {
  if (!fs.existsSync(VOCAB_FILE)) return [];
  return JSON.parse(fs.readFileSync(VOCAB_FILE, "utf-8"));
}

function writeWords(words: VocabWord[]): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(VOCAB_FILE, JSON.stringify(words, null, 2), "utf-8");
}

export function getAllWords(): VocabWord[] {
  return readWords().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addWord(word: Omit<VocabWord, "id" | "createdAt" | "lastReviewed" | "mastered">): VocabWord {
  const words = readWords();
  const newWord: VocabWord = {
    ...word,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    mastered: false,
    createdAt: new Date().toISOString(),
    lastReviewed: null,
  };
  words.push(newWord);
  writeWords(words);
  return newWord;
}

export function deleteWord(id: string): boolean {
  const words = readWords();
  const filtered = words.filter((w) => w.id !== id);
  if (filtered.length === words.length) return false;
  writeWords(filtered);
  return true;
}

export function toggleMastered(id: string): VocabWord | null {
  const words = readWords();
  const word = words.find((w) => w.id === id);
  if (!word) return null;
  word.mastered = !word.mastered;
  word.lastReviewed = new Date().toISOString();
  writeWords(words);
  return word;
}

export function getStats(): EnglishStats {
  const words = readWords();
  const today = new Date().toISOString().split("T")[0];

  const todayAdded = words.filter(
    (w) => w.createdAt.split("T")[0] === today
  ).length;
  const todayReviewed = words.filter(
    (w) => w.lastReviewed && w.lastReviewed.split("T")[0] === today
  ).length;

  const tagMap = new Map<string, number>();
  for (const w of words) {
    for (const tag of w.tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }
  const tagBreakdown = Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalWords: words.length,
    masteredWords: words.filter((w) => w.mastered).length,
    todayAdded,
    todayReviewed,
    tagBreakdown,
  };
}

// Seed some initial vocabulary if empty
export function seedIfEmpty(): void {
  const words = readWords();
  if (words.length > 0) return;

  const seeds: Omit<VocabWord, "id" | "createdAt" | "lastReviewed" | "mastered">[] = [
    { word: "ubiquitous", definition: "无所不在的", example: "Smartphones have become ubiquitous in modern life.", tags: ["形容词", "高级"] },
    { word: "ephemeral", definition: "短暂的，转瞬即逝的", example: "Fame is ephemeral; character lasts forever.", tags: ["形容词", "高级"] },
    { word: "pragmatic", definition: "务实的，实用的", example: "We need a pragmatic approach to this problem.", tags: ["形容词", "常用"] },
    { word: "ambiguous", definition: "模棱两可的，含糊的", example: "The contract language is deliberately ambiguous.", tags: ["形容词", "常用"] },
    { word: "resilient", definition: "有韧性的，能复原的", example: "Children are often more resilient than adults think.", tags: ["形容词", "常用"] },
    { word: "innovative", definition: "创新的", example: "The company is known for its innovative designs.", tags: ["形容词", "商务"] },
    { word: "scrutiny", definition: "仔细审查", example: "The proposal will face intense scrutiny from regulators.", tags: ["名词", "商务"] },
    { word: "consensus", definition: "共识，一致意见", example: "The team reached a consensus after hours of discussion.", tags: ["名词", "常用"] },
    { word: "implement", definition: "实施，执行", example: "We plan to implement the new system next month.", tags: ["动词", "商务"] },
    { word: "deteriorate", definition: "恶化", example: "The patient's condition began to deteriorate overnight.", tags: ["动词", "学术"] },
  ];

  const now = new Date();
  const seeded = seeds.map((s, i) => ({
    ...s,
    id: `seed-${i}`,
    mastered: i < 3,
    createdAt: new Date(now.getTime() - (seeds.length - i) * 86400000).toISOString(),
    lastReviewed: i < 3 ? new Date().toISOString() : null,
  }));

  writeWords(seeded);
}
