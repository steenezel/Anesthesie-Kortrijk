import type { QuizCategoryId, QuizQuestion } from "./types";

/** Fisher–Yates shuffle (in-place, returns same array). */
export function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

const SEEN_STORAGE_KEY = "kara-edra-quiz-seen-ids";

function readSeenIds(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeSeenIds(ids: string[]) {
  try {
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore quota / private mode */
  }
}

export function pickQuizQuestions(
  bank: QuizQuestion[],
  count: number,
  category: QuizCategoryId | "all"
): QuizQuestion[] {
  const pool = category === "all" ? bank : bank.filter((q) => q.category === category);
  if (pool.length === 0) return [];

  const seen = new Set(readSeenIds());
  let unused = pool.filter((q) => !seen.has(q.id));
  if (unused.length < count) {
    unused = [...pool];
    writeSeenIds([]);
  }

  const picked = shuffleInPlace([...unused]).slice(0, Math.min(count, unused.length));
  writeSeenIds([...readSeenIds(), ...picked.map((q) => q.id)]);
  return picked;
}

export type ShuffledQuestion = QuizQuestion & {
  displayOptions: string[];
  displayCorrectIndex: number;
};

export function shuffleQuestionOptions(question: QuizQuestion): ShuffledQuestion {
  const indexed = question.options.map((text, index) => ({ text, index }));
  shuffleInPlace(indexed);
  return {
    ...question,
    displayOptions: indexed.map((item) => item.text),
    displayCorrectIndex: indexed.findIndex((item) => item.index === question.correctIndex),
  };
}
