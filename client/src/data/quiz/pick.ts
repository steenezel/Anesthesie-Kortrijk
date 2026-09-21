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

export type QuizProgressRow = {
  questionId: string;
  dueAt?: string | Date | null;
  easeFactor?: number;
  intervalDays?: number;
};

/**
 * Prefer due / unseen cards (SRS), then fall back to local seen-rotation.
 */
export function pickQuizQuestions(
  bank: QuizQuestion[],
  count: number,
  category: QuizCategoryId | "all",
  srsProgress: QuizProgressRow[] = [],
): QuizQuestion[] {
  const pool = category === "all" ? bank : bank.filter((q) => q.category === category);
  if (pool.length === 0) return [];

  const now = Date.now();
  const byId = new Map(srsProgress.map((row) => [row.questionId, row]));
  const dueOrNew = pool.filter((q) => {
    const row = byId.get(q.id);
    if (!row) return true;
    const due = row.dueAt ? new Date(row.dueAt).getTime() : 0;
    return due <= now;
  });

  let candidate = dueOrNew.length >= count ? dueOrNew : pool;

  if (!srsProgress.length) {
    const seen = new Set(readSeenIds());
    let unused = candidate.filter((q) => !seen.has(q.id));
    if (unused.length < count) {
      unused = [...candidate];
      writeSeenIds([]);
    }
    candidate = unused;
  }

  const picked = shuffleInPlace([...candidate]).slice(0, Math.min(count, candidate.length));
  if (!srsProgress.length) {
    writeSeenIds([...readSeenIds(), ...picked.map((q) => q.id)]);
  }
  return picked;
}

export async function reportQuizResult(questionId: string, correct: boolean) {
  try {
    await fetch("/api/quiz/progress", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, correct }),
    });
  } catch {
    /* ignore */
  }
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
