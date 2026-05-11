# Agents Guide — Who Wants to Be a Millionaire? Team Edition

This document describes the project for AI coding agents working on the codebase.

---

## Project Overview

A two-team quiz game built with React + TypeScript (Create React App). Two teams alternate answering questions across 5 rounds. Each round offers all 11 categories in a shared pool; once a category is picked by either team, it's removed for the rest of that round.

---

## Tech Stack

- **React 18** with functional components and hooks
- **TypeScript** (strict mode)
- **React Context + useReducer** for all state management (no external libraries)
- **CSS3** (single `App.css` file, no CSS modules or preprocessors)
- **Create React App** toolchain (Webpack, Babel, ESLint under the hood)
- **No testing library currently configured** (setupTests.ts exists but no test files)

---

## Directory Layout

```
millionaire/
├── public/                  # Static HTML shell
├── src/
│   ├── components/          # UI components (one per file)
│   │   ├── StartScreen.tsx
│   │   ├── GameHeader.tsx
│   │   ├── CategorySelect.tsx
│   │   ├── QuestionScreen.tsx
│   │   ├── RoundSummary.tsx
│   │   └── GameOver.tsx
│   ├── context/
│   │   └── GameContext.tsx   # State, reducer, actions, helpers
│   ├── data/
│   │   └── questions.json   # 55 questions nested as { r1: { Category: Q }, ... }
│   ├── types/
│   │   └── index.ts         # All TypeScript types/interfaces
│   ├── App.tsx              # Root — renders current phase component
│   ├── App.css              # All component styles
│   └── index.css            # Global resets/base styles
├── package.json
├── tsconfig.json
└── README.md
```

---

## Architecture

### State Management

All game state lives in a single `GameState` object managed by `useReducer` in `GameContext.tsx`. The state is provided globally via React Context.

**Key state fields:**
- `phase` — determines which screen to render (`start`, `category-select`, `question`, `result`, `round-summary`, `game-over`)
- `teams` — tuple of two `Team` objects (scores, lifelines, round stats)
- `currentTeamIndex` — `0 | 1`, alternates each question
- `currentRound` — 1 through 5
- `availableCategories` — shared `Category[]` pool, starts with all 11 each round
- `currentQuestion` — the active `Question` object (or null)
- `questionsAnswered` — history of all answered questions with correctness

**Actions (dispatched events):**
- `START_GAME` — initialise and begin round 1
- `SELECT_CATEGORY` — team picks a category, a question is loaded
- `SELECT_ANSWER` — team selects an option (before confirming)
- `REVEAL_ANSWER` — lock in answer, update scores (only dispatched after user confirms via the confirmation modal)
- `NEXT_QUESTION` — advance to next team/question or end round
- `USE_LIFELINE` — activate a lifeline (phone, fifty, mystery, lastChance)
- `DISMISS_LIFELINE` — close the lifeline overlay
- `CONTINUE_AFTER_ROUND` — apply penalties, advance to next round or end game
- `RESET_GAME` — return to initial state

### Component Rendering by Phase

| Phase | Component |
|-------|-----------|
| `start` | `StartScreen` |
| `category-select` | `GameHeader` + `CategorySelect` |
| `question` | `GameHeader` + `QuestionScreen` |
| `result` | `GameHeader` + `QuestionScreen` (answer revealed) |
| `round-summary` | `GameHeader` + `RoundSummary` |
| `game-over` | `GameOver` |

> **Note:** `QuestionScreen` manages a local `showConfirmModal` boolean state via `useState` for the answer confirmation flow. This is a **UI-only** concern — no reducer actions or global state changes were needed. The flow is:
> 1. `SELECT_ANSWER` dispatch → answer option highlights
> 2. User clicks "Final Answer" → `setShowConfirmModal(true)` (modal appears)
> 3. User clicks **Confirm** → `setShowConfirmModal(false)` + `REVEAL_ANSWER` dispatch (answer locked in)
> 4. User clicks **Go Back** → `setShowConfirmModal(false)` (returns to question, selection preserved)

### Scoring

Exponential doubling per round:
- Formula: `basePoints × 2^(correctCount - 1)`
- Base points: R1=25, R2=50, R3=100, R4=200, R5=500
- Score is awarded incrementally after each correct answer
- Penalty: if a team gets < 3 correct in a round, their **total score is halved**

### Category Pool Mechanic

- Each round starts with all 11 categories available in a single shared array
- When either team picks a category, it's removed from the pool
- 10 questions per round (5 per team) means 10 categories get used, 1 remains unused
- Pool resets to all 11 at the start of each new round

### Question Lookup

The nested JSON is flattened into a `Question[]` array at import time (`GameContext.tsx` adds `round` and `category` fields derived from the JSON keys). When a category is selected, the game:
1. First searches for an unused question in that category **from the current round**
2. If none found, falls back to **any round's** questions for that category
3. Questions already answered or skipped are excluded

---

## Key Conventions

- **No external state libraries** — keep everything in Context + useReducer
- **No prop drilling** — components use `useGame()` hook to access state/dispatch
- **Single CSS file** — all styles in `App.css`, BEM-ish class naming (e.g. `header-team--active`, `header-correct-badge--safe`)
- **Immutable state updates** — reducer always returns new objects, spreads arrays
- **Types-first** — all interfaces/types defined in `types/index.ts`, imported everywhere

---

## Common Tasks

### Adding a new question

Add an entry inside the appropriate round and category in `src/data/questions.json`:
```json
{
  "r{round}": {
    "{Category}": {
      "id": "r{round}_{category}",
      "text": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswerIndex": 0
    }
  }
}
```
The `round` and `category` fields are NOT stored on the question object — they're derived from the JSON keys at runtime by `GameContext.tsx`.

### Adding a new category

1. Add the category string to the `Category` type union in `types/index.ts`
2. Add it to `ALL_CATEGORIES` in `context/GameContext.tsx`
3. Add an emoji mapping in `CategorySelect.tsx` (`CATEGORY_EMOJI` record)
4. Add a question entry per round for the new category in `questions.json` (under each `r1`...`r5` key)

### Adding a new lifeline

1. Add the lifeline key to `LifelineType` union and `Lifelines` interface in `types/index.ts`
2. Initialize it in `freshTeam()` in `GameContext.tsx`
3. Handle it in the `USE_LIFELINE` case of the reducer
4. Add UI for it in `QuestionScreen.tsx`
5. Add the emoji/icon in `GameHeader.tsx`'s `TeamPanel`

### Adding a new game phase

1. Add the phase string to `GamePhase` union in `types/index.ts`
2. Add a case in `App.tsx`'s phase switch to render the new component
3. Create the component in `src/components/`
4. Add transitions to/from the phase in the reducer

---

## Build & Run

```bash
npm install          # install dependencies
npm start            # dev server at localhost:3000
npm run build        # production build to /build
npx tsc --noEmit     # type-check without emitting
```

---

## Gotchas

- `questions.json` is a nested object (`{ r1: { Category: Q } }`), NOT an array. It's flattened into `Question[]` at import time in `GameContext.tsx`.
- The round/category on each runtime `Question` object is derived from the JSON keys — don't add `round` or `category` fields to the JSON question objects.
- The `round` key on questions is a preference hint, not a strict filter. The fallback ensures every category always has a question available regardless of which round it is.
- `team.roundCorrect` only tracks correct answers; `team.roundAnswered` tracks all answers (correct + wrong) in the current round.
- The penalty check happens in `CONTINUE_AFTER_ROUND`, not immediately when the 3rd wrong answer occurs.
- Lifelines are per-team and persist across rounds (they don't reset).
- `Last Chance` lifeline has special unlock rules: only available from Round 4+, and only after all other 3 lifelines are used.
