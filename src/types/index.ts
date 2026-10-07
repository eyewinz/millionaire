// ——— Category ———
export type Category =
  | "Cinema"
  | "Science"
  | "Maths"
  | "Language"
  | "Politics"
  | "Puzzle"
  | "Sports"
  | "Mythology"
  | "History"
  | "Food"
  | "Geography"
  | "Nature";

// ——— Question ———
export interface Question {
  id: string;
  category: Category;
  round: number;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

// ——— Lifelines ———
export type LifelineType = "phone" | "fifty" | "mystery" | "lastChance";

export interface Lifelines {
  phone: boolean;
  fifty: boolean;
  mystery: boolean;
  lastChance: boolean;
}

// ——— Team ———
export interface Team {
  name: string;
  score: number;
  lifelines: Lifelines;
  roundCorrect: number;
  roundAnswered: number;
}

// ——— Game phase ———
export type GamePhase =
  | "start"
  | "category-select"
  | "question"
  | "result"
  | "round-summary"
  | "round-review"
  | "game-over";

// ——— Lifeline result ———
export interface LifelineResult {
  type: LifelineType;
  resolvedAs: "phone" | "fifty";
  hiddenIndices?: number[];
}

// ——— Game state ———
export interface GameState {
  phase: GamePhase;
  teams: [Team, Team];
  currentTeamIndex: 0 | 1;
  currentRound: number;
  currentQuestionInRound: number;
  overallQuestionNumber: number;
  selectedCategory: Category | null;
  availableCategories: Category[];
  currentQuestion: Question | null;
  selectedAnswerIndex: number | null;
  isAnswerRevealed: boolean;
  activeLifeline: LifelineResult | null;
  fiftyFiftyIndices: number[];
  questionsAnswered: {
    questionId: string;
    teamIndex: number;
    correct: boolean;
  }[];
  skippedQuestionIds: string[];
}

// ——— Game actions (discriminated union) ———
export type GameAction =
  | { type: "START_GAME" }
  | { type: "SELECT_CATEGORY"; category: Category }
  | { type: "SELECT_ANSWER"; index: number }
  | { type: "REVEAL_ANSWER" }
  | { type: "NEXT_QUESTION" }
  | { type: "USE_LIFELINE"; lifeline: LifelineType }
  | { type: "DISMISS_LIFELINE" }
  | { type: "SHOW_ROUND_REVIEW" }
  | { type: "CONTINUE_AFTER_ROUND" }
  | { type: "RESET_GAME" };
