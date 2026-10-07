import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import type {
  Category,
  Question,
  Team,
  GameState,
  GameAction,
  LifelineType,
  LifelineResult,
} from "../types";
import questionsData from "../data/questions.json";
import { loadGameState, saveGameState, clearGameState } from "../utils/storage";

// ---------------------------------------------------------------------------
// Flatten the nested JSON structure into a Question[] array.
// JSON shape: { r1: { Cinema: { id, text, options, correctAnswerIndex }, ... }, r2: {...}, ... }
// ---------------------------------------------------------------------------
const questions: Question[] = Object.entries(
  questionsData as Record<
    string,
    Record<
      string,
      {
        id: string;
        text: string;
        options: string[];
        correctAnswerIndex: number;
      }
    >
  >,
).flatMap(([roundKey, categories]) => {
  const round = parseInt(roundKey.replace("r", ""), 10);
  return Object.entries(categories).map(([category, q]) => ({
    id: q.id,
    category: category as Category,
    round,
    text: q.text,
    options: q.options,
    correctAnswerIndex: q.correctAnswerIndex,
  }));
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** All 11 categories available every round. */
const ALL_CATEGORIES: Category[] = [
  "Cinema",
  "Science",
  "Maths",
  "Language",
  "Politics",
  "Puzzle",
  "Sports",
  "Mythology",
  "History",
  "Food",
  "Geography",
  "Nature",
];

/** Base points awarded per round (multiplied by 2 for each additional correct). */
export const ROUND_BASE_POINTS: Record<number, number> = {
  1: 25,
  2: 50,
  3: 100,
  4: 200,
  5: 500,
};

const TOTAL_ROUNDS = 5;
const QUESTIONS_PER_TEAM_PER_ROUND = 5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return all questions that belong to a given round. */
function getQuestionsForRound(round: number): Question[] {
  return questions.filter((q) => q.round === round);
}

/**
 * Calculate the score earned in a round.
 * Formula: base × 2^(correct - 1)  for correct ≥ 1, else 0.
 */
export function calculateRoundScore(
  round: number,
  correctCount: number,
): number {
  if (correctCount <= 0) return 0;
  const base = ROUND_BASE_POINTS[round] ?? 0;
  return base * Math.pow(2, correctCount - 1);
}

/** Determine which team should play next (simple alternation). */
function nextTeamIndex(overallQuestionNumber: number): 0 | 1 {
  return ((overallQuestionNumber - 1) % 2) as 0 | 1;
}

/**
 * Return the questions for a round that were never played (neither answered
 * nor skipped) — i.e. the categories that no team selected that round.
 */
export function getUnusedQuestionsForRound(state: GameState): Question[] {
  const usedQuestionIds = new Set<string>([
    ...state.questionsAnswered.map((qa) => qa.questionId),
    ...state.skippedQuestionIds,
  ]);
  return questions.filter(
    (q) => q.round === state.currentRound && !usedQuestionIds.has(q.id),
  );
}

/** Pick 2 random incorrect option indices to hide (for 50/50). */
function computeFiftyFiftyIndices(
  correctIndex: number,
  totalOptions: number,
): number[] {
  const incorrectIndices = Array.from(
    { length: totalOptions },
    (_, i) => i,
  ).filter((i) => i !== correctIndex);
  // Fisher-Yates shuffle
  for (let i = incorrectIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [incorrectIndices[i], incorrectIndices[j]] = [
      incorrectIndices[j],
      incorrectIndices[i],
    ];
  }
  return incorrectIndices.slice(0, 2);
}

/** Resolve a lifeline (phone / fifty / mystery) to a LifelineResult. */
function resolveLifeline(
  lifelineType: LifelineType,
  currentQuestion: Question,
): LifelineResult {
  if (lifelineType === "phone") {
    return { type: "phone", resolvedAs: "phone" };
  }
  if (lifelineType === "fifty") {
    const hiddenIndices = computeFiftyFiftyIndices(
      currentQuestion.correctAnswerIndex,
      currentQuestion.options.length,
    );
    return { type: "fifty", resolvedAs: "fifty", hiddenIndices };
  }
  // Mystery box — randomly resolve to phone or fifty
  const resolvedAs = Math.random() < 0.5 ? "phone" : "fifty";
  if (resolvedAs === "phone") {
    return { type: "mystery", resolvedAs: "phone" };
  }
  const hiddenIndices = computeFiftyFiftyIndices(
    currentQuestion.correctAnswerIndex,
    currentQuestion.options.length,
  );
  return { type: "mystery", resolvedAs: "fifty", hiddenIndices };
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const freshTeam = (name: string): Team => ({
  name,
  score: 0,
  lifelines: { phone: true, fifty: true, mystery: true, lastChance: true },
  roundCorrect: 0,
  roundAnswered: 0,
});

const initialState: GameState = {
  phase: "start",
  teams: [freshTeam("Team A"), freshTeam("Team B")],
  currentTeamIndex: 0,
  currentRound: 1,
  currentQuestionInRound: 1,
  overallQuestionNumber: 1,
  selectedCategory: null,
  availableCategories: [...ALL_CATEGORIES],
  currentQuestion: null,
  selectedAnswerIndex: null,
  isAnswerRevealed: false,
  activeLifeline: null,
  fiftyFiftyIndices: [],
  lifelineUsedThisQuestion: null,
  questionsAnswered: [],
  skippedQuestionIds: [],
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // ---- START_GAME ----
    case "START_GAME": {
      return {
        ...initialState,
        phase: "category-select",
        teams: [freshTeam("Team A"), freshTeam("Team B")],
        availableCategories: [...ALL_CATEGORIES],
        fiftyFiftyIndices: [],
        questionsAnswered: [],
        skippedQuestionIds: [],
      };
    }

    // ---- SELECT_CATEGORY ----
    case "SELECT_CATEGORY": {
      const { category } = action;

      // Find an unused question for this category.
      // Prefer a question from the current round; fall back to any round.
      const usedIds = new Set(
        state.questionsAnswered.map((qa) => qa.questionId),
      );
      const skippedIds = new Set(state.skippedQuestionIds);
      const isAvailable = (q: Question) =>
        q.category === category && !usedIds.has(q.id) && !skippedIds.has(q.id);

      const roundQuestions = getQuestionsForRound(state.currentRound);
      const question =
        roundQuestions.find(isAvailable) ?? questions.find(isAvailable) ?? null;

      return {
        ...state,
        phase: "question",
        selectedCategory: category,
        currentQuestion: question,
        selectedAnswerIndex: null,
        isAnswerRevealed: false,
        activeLifeline: null,
        fiftyFiftyIndices: [],
        lifelineUsedThisQuestion: null,
      };
    }

    // ---- SELECT_ANSWER ----
    case "SELECT_ANSWER": {
      if (state.isAnswerRevealed) return state;
      return { ...state, selectedAnswerIndex: action.index };
    }

    // ---- REVEAL_ANSWER ----
    case "REVEAL_ANSWER": {
      if (!state.currentQuestion || state.selectedAnswerIndex === null)
        return state;

      const correct =
        state.selectedAnswerIndex === state.currentQuestion.correctAnswerIndex;

      const updatedTeams: [Team, Team] = [
        { ...state.teams[0], lifelines: { ...state.teams[0].lifelines } },
        { ...state.teams[1], lifelines: { ...state.teams[1].lifelines } },
      ];

      // Track total answered this round
      updatedTeams[state.currentTeamIndex].roundAnswered += 1;

      // Update roundCorrect and calculate incremental score
      if (correct) {
        const oldRC = updatedTeams[state.currentTeamIndex].roundCorrect;
        updatedTeams[state.currentTeamIndex].roundCorrect = oldRC + 1;

        // Incremental score: diff between new round total and old round total
        const oldRoundScore = calculateRoundScore(state.currentRound, oldRC);
        const newRoundScore = calculateRoundScore(
          state.currentRound,
          oldRC + 1,
        );
        updatedTeams[state.currentTeamIndex].score +=
          newRoundScore - oldRoundScore;
      }

      return {
        ...state,
        phase: "result",
        isAnswerRevealed: true,
        teams: updatedTeams,
        questionsAnswered: [
          ...state.questionsAnswered,
          {
            questionId: state.currentQuestion.id,
            teamIndex: state.currentTeamIndex,
            correct,
          },
        ],
      };
    }

    // ---- NEXT_QUESTION ----
    case "NEXT_QUESTION": {
      // Both teams always play — 5 questions each = 10 per round
      const maxQuestionsInRound = 2 * QUESTIONS_PER_TEAM_PER_ROUND;

      if (state.currentQuestionInRound === maxQuestionsInRound) {
        return { ...state, phase: "round-summary" };
      }

      const newQuestionInRound = state.currentQuestionInRound + 1;
      const newOverallQuestion = state.overallQuestionNumber + 1;
      const newTeamIndex = nextTeamIndex(newOverallQuestion);

      // Remove the used category from the shared pool
      const newAvailableCategories = state.selectedCategory
        ? state.availableCategories.filter((c) => c !== state.selectedCategory)
        : [...state.availableCategories];

      return {
        ...state,
        phase: "category-select",
        currentQuestionInRound: newQuestionInRound,
        overallQuestionNumber: newOverallQuestion,
        currentTeamIndex: newTeamIndex,
        availableCategories: newAvailableCategories,
        currentQuestion: null,
        selectedAnswerIndex: null,
        isAnswerRevealed: false,
        activeLifeline: null,
        fiftyFiftyIndices: [],
        selectedCategory: null,
      };
    }

    // ---- CONTINUE_AFTER_ROUND ----
    case "CONTINUE_AFTER_ROUND": {
      const updatedTeams: [Team, Team] = [
        { ...state.teams[0], lifelines: { ...state.teams[0].lifelines } },
        { ...state.teams[1], lifelines: { ...state.teams[1].lifelines } },
      ];

      // Penalty check: teams with fewer than 3 correct get their score halved
      for (let t = 0; t < 2; t++) {
        const teamRoundAnswers = state.questionsAnswered.filter((qa) => {
          if (qa.teamIndex !== t) return false;
          const q = questions.find((qn) => qn.id === qa.questionId);
          return q !== undefined && q.round === state.currentRound;
        });
        const totalCorrect = teamRoundAnswers.filter((qa) => qa.correct).length;

        if (totalCorrect < 3) {
          // Penalty: halve accumulated score
          updatedTeams[t].score = Math.floor(updatedTeams[t].score / 2);
        }
      }

      // Game over after the final round
      if (state.currentRound === TOTAL_ROUNDS) {
        return { ...state, phase: "game-over", teams: updatedTeams };
      }

      // Advance to next round
      const newRound = state.currentRound + 1;
      const newOverall = state.overallQuestionNumber + 1;
      const newTeam = nextTeamIndex(newOverall);

      updatedTeams[0].roundCorrect = 0;
      updatedTeams[1].roundCorrect = 0;
      updatedTeams[0].roundAnswered = 0;
      updatedTeams[1].roundAnswered = 0;

      return {
        ...state,
        phase: "category-select",
        teams: updatedTeams,
        currentRound: newRound,
        currentQuestionInRound: 1,
        overallQuestionNumber: newOverall,
        currentTeamIndex: newTeam,
        availableCategories: [...ALL_CATEGORIES],
        currentQuestion: null,
        selectedAnswerIndex: null,
        isAnswerRevealed: false,
        activeLifeline: null,
        fiftyFiftyIndices: [],
        selectedCategory: null,
      };
    }

    // ---- USE_LIFELINE ----
    case "USE_LIFELINE": {
      if (
        state.phase !== "question" ||
        state.isAnswerRevealed ||
        !state.currentQuestion
      ) {
        return state;
      }

      const { lifeline } = action;
      const team = state.teams[state.currentTeamIndex];

      // Only one lifeline may be used per question.
      if (state.lifelineUsedThisQuestion !== null) return state;

      // ---- Last Chance (special handling) ----
      if (lifeline === "lastChance") {
        if (state.currentRound < 4) return state;
        if (
          team.lifelines.phone ||
          team.lifelines.fifty ||
          team.lifelines.mystery
        ) {
          return state;
        }
        if (!team.lifelines.lastChance) return state;

        const updatedTeams: [Team, Team] = [
          { ...state.teams[0], lifelines: { ...state.teams[0].lifelines } },
          { ...state.teams[1], lifelines: { ...state.teams[1].lifelines } },
        ];
        updatedTeams[state.currentTeamIndex].lifelines.lastChance = false;

        return {
          ...state,
          teams: updatedTeams,
          skippedQuestionIds: [
            ...state.skippedQuestionIds,
            state.currentQuestion.id,
          ],
          phase: "category-select",
          currentQuestion: null,
          selectedAnswerIndex: null,
          isAnswerRevealed: false,
          activeLifeline: null,
          fiftyFiftyIndices: [],
          lifelineUsedThisQuestion: null,
          selectedCategory: null,
        };
      }

      // ---- Standard lifelines (phone / fifty / mystery) ----
      if (!team.lifelines[lifeline]) return state;

      const updatedTeams: [Team, Team] = [
        { ...state.teams[0], lifelines: { ...state.teams[0].lifelines } },
        { ...state.teams[1], lifelines: { ...state.teams[1].lifelines } },
      ];
      updatedTeams[state.currentTeamIndex].lifelines[lifeline] = false;

      const result = resolveLifeline(lifeline, state.currentQuestion);

      // Persist 50/50 hidden indices so they survive overlay dismissal
      const newFiftyFiftyIndices =
        result.resolvedAs === "fifty" && result.hiddenIndices
          ? result.hiddenIndices
          : state.fiftyFiftyIndices;

      return {
        ...state,
        teams: updatedTeams,
        activeLifeline: result,
        fiftyFiftyIndices: newFiftyFiftyIndices,
        lifelineUsedThisQuestion: lifeline,
      };
    }

    // ---- DISMISS_LIFELINE ----
    case "DISMISS_LIFELINE": {
      return { ...state, activeLifeline: null };
    }

    // ---- SHOW_ROUND_REVIEW ----
    case "SHOW_ROUND_REVIEW": {
      return { ...state, phase: "round-review" };
    }

    // ---- RESET_GAME ----
    case "RESET_GAME": {
      return {
        ...initialState,
        teams: [freshTeam("Team A"), freshTeam("Team B")],
        availableCategories: [...ALL_CATEGORIES],
        fiftyFiftyIndices: [],
        questionsAnswered: [],
        skippedQuestionIds: [],
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(
    gameReducer,
    initialState,
    // Lazy initializer: restore the saved state (if any) so a page refresh
    // continues exactly where the player left off.
    (fallback) => loadGameState() ?? fallback,
  );

  // Persist the state to storage whenever it changes.
  useEffect(() => {
    saveGameState(state);
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Custom hook
// ---------------------------------------------------------------------------

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

// Re-exported so UI (or the browser console) can wipe the saved state manually.
export { clearGameState };
