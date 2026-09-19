export const QUIZ_CATEGORIES = {
  fysica: "Fysica & apparatuur",
  anatomie: "Anatomie",
  bezenuwing: "Bezenuwing",
  motoriek: "Motoriek",
  blocktechniek: "Blocktechniek",
  indicatie: "Indicatie",
  farmacologie: "Farmacologie",
  complicaties: "Complicaties",
  fysiologie: "Fysiologie",
  speciale: "Speciale groepen",
  statistiek: "Statistiek",
} as const;

export type QuizCategoryId = keyof typeof QUIZ_CATEGORIES;

export interface QuizQuestion {
  id: string;
  category: QuizCategoryId;
  stem: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export const QUIZ_ROUND_SIZE = 5;

export const QUIZ_CATEGORY_LIST = Object.entries(QUIZ_CATEGORIES) as [
  QuizCategoryId,
  (typeof QUIZ_CATEGORIES)[QuizCategoryId],
][];
