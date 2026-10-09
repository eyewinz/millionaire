# 🏆 Who Wants to Be a Millionaire? — Team Edition

A responsive React web application themed after *Who Wants to Be a Millionaire?*, designed for a **local multiplayer experience** between two teams. Built with **TypeScript** and **React** (Create React App).

---

## 📸 Overview

Two teams compete head-to-head across **5 rounds of 5 questions each** — **25 questions per team** (50 total). Every round, both teams choose from a **shared pool of all 12 knowledge categories**. Once a category is picked by either team, it's removed from the pool for the rest of that round. Every question is **timed** (3 minutes in rounds 1–3, 5 minutes in rounds 4–5), and only **one lifeline may be used per question**. After answering, a **full-screen Answer Result Screen** shows success or failure with animations before continuing. Each team has **4 lifelines** to use strategically. Points double with each correct answer, and from **round 2 onward** teams face a **graduated score penalty** if they answer fewer than 3 of 5 correctly in a round (**round 1 is a penalty-free grace round**). Game progress is **automatically saved** to the browser, so a refresh resumes exactly where you left off.

---

## 🎮 Game Rules

### Teams & Turns

- **Two teams**: Team A and Team B.
- Teams **alternate turns** throughout the game: Team A answers, then Team B answers, and so on.
- Each team answers **25 questions** over the course of the game (50 question events total).

### Rounds & Questions

- The game consists of **5 rounds**, each containing **10 question events** (5 per team).
- Within each round, teams alternate turns and select from a **shared category pool**.
- Each round starts with **all 12 categories** available. Once either team picks a category, it is **removed from the pool for both teams** for the remainder of that round.
- After 10 picks (5 per team), 2 categories remain unused. The pool **resets to all 12** at the start of the next round.

### Category Selection Flow (Example)

| Step | Team | Categories Available | Picks |
|------|------|---------------------|-------|
| R1 Q1 | Team A | All 12 | 🎬 Cinema |
| R1 Q1 | Team B | 11 remaining | ⚽ Sports |
| R1 Q2 | Team A | 10 remaining | 🔢 Maths |
| R1 Q2 | Team B | 9 remaining | 📜 History |
| ... | ... | ... | ... |
| R1 Q5 | Team B | 3 remaining | 🍕 Food |
| **R2 Q1** | **Team A** | **All 12 (reset)** | ... |

### Categories

The game features **12 knowledge categories**, all available every round:

| Emoji | Category | Description |
|-------|----------|-------------|
| 🎬 | Cinema | Movies, directors, actors, awards |
| 🔬 | Science | Physics, chemistry, biology, astronomy |
| 🔢 | Maths | Arithmetic, algebra, geometry, number theory |
| 📚 | Language | Linguistics, etymology, grammar, world languages |
| 🏛️ | Politics | Political systems, leaders, treaties, organizations |
| 🧩 | Puzzle | Logic puzzles, riddles, brain teasers |
| ⚽ | Sports | Football, Olympics, tennis, basketball, and more |
| 🏺 | Mythology | Greek, Norse, Egyptian, Hindu mythology |
| 📜 | History | World history events, figures, dates |
| 🍕 | Food | Cuisine, ingredients, cooking, food origins |
| 🌍 | Geography | Countries, capitals, landmarks, natural features |
| 🌿 | Nature | Animals, birds, plants, ecosystems |

### Answer Confirmation Flow

When a question is displayed, the answer flow follows a deliberate multi-step confirmation process:

1. **Select** — The player clicks an answer option. It highlights in green but is **not yet locked in**.
2. **Final Answer** — The player clicks the "Final Answer" button that appears below the options.
3. **Confirmation Modal** — A modal overlay appears asking **"Lock in your answer?"** with:
   - The selected answer displayed
   - A warning: *"This cannot be changed once confirmed."*
   - Two buttons: **Confirm** (green — locks in the answer) and **Go Back** (gray — returns to the question)
4. **Answer Feedback** — A full-screen intermediate page appears showing success (🎉 confetti animation) or failure (😢 sad emoji rain) with the result, correct answer (if wrong), round score, total score, and a Continue button.
5. **Continue** — Clicking Continue returns to the category selection screen for the next turn.

This prevents accidental answer submissions and adds dramatic tension — just like the TV show!

### Round Review (Unplayed Categories)

After the round summary, an intermediate **Round Review** screen lists the categories that **no team picked that round**, each with its question and the highlighted correct answer. This lets players see what they missed before the next round begins. Clicking **Continue** here applies the end-of-round penalty and advances to the next round (or the final results).

### Question Timer

Every question is on a countdown timer, shown in the header as two animated progress rings that flank the center heading:

- **Rounds 1–3:** 3 minutes per question.
- **Rounds 4–5:** 5 minutes per question.

The ring drains as time elapses and shifts colour from green → amber (under 60s) → red (under 30s), pulsing urgently in the final seconds. If the timer reaches **0:00**, the question is **automatically marked wrong** and the game jumps straight to the "Time's Up!" failure screen — even if the correct option was highlighted but never confirmed. Because the deadline is stored in game state, the countdown survives a page refresh and resumes with the correct remaining time.

### Penalty System

After each round, both teams are evaluated:

- Each team answers exactly **5 questions per round**.
- **Round 1 is a grace round — no penalty is ever applied, regardless of how many questions a team gets wrong.**
- From **Round 2 onward**, answering **at least 3 correctly** means **no penalty**.
- Otherwise, a **graduated penalty** reduces the team's **total accumulated score** based on the number of wrong answers in that round:

| Round | Wrong Answers | Correct Answers | Penalty |
|-------|---------------|-----------------|---------|
| 1 | any | any | **None (grace round)** |
| 2–5 | 0–2 | 3–5 | None |
| 2–5 | 3 | 2 | **−40%** of total score |
| 2–5 | 4 | 1 | **−50%** of total score |
| 2–5 | 5 (all wrong) | 0 | **−60%** of total score |

- There is **no elimination** — both teams always play all 5 rounds.
- This creates a strategic incentive to answer carefully: a penalty in an early round compounds over time!

### Saving & Resuming

Game state is **persisted to the browser's `localStorage`** after every change (there is no backend/server file — `localStorage` acts as the "state file"):

- Refreshing the page, or even closing and reopening the browser, **resumes the game exactly where you left off** (round, scores, lifelines, current question, and remaining time).
- The saved game is **never cleared automatically**. To wipe it, use **"Clear Saved Game"** on the Start screen (shown only when a save exists) or **"Quit & Clear"** in the in-game header.

### Scoring System

Points are awarded **immediately** after each correct answer using an **exponential doubling** formula:

**Round Score = Base Points × 2^(correct - 1)**

| Round | Base Points | 1 Correct | 2 Correct | 3 Correct | 4 Correct | 5 Correct |
|-------|------------|-----------|-----------|-----------|-----------|-----------|
| **1** | 25 | 25 | 50 | 100 | 200 | 400 |
| **2** | 50 | 50 | 100 | 200 | 400 | 800 |
| **3** | 100 | 100 | 200 | 400 | 800 | 1,600 |
| **4** | 200 | 200 | 400 | 800 | 1,600 | 3,200 |
| **5** | 500 | 500 | 1,000 | 2,000 | 4,000 | 8,000 |

**Maximum possible score: 14,000 points** (all 25 questions correct).

### Winning

- The game **always** ends after Round 5 — both teams complete all 5 rounds.
- The team with the **higher score wins**.
- If scores are tied, the result is a **draw**.

---

## 🖥️ Game Header (HUD)

The header bar is visible throughout gameplay and shows real-time status for both teams.

### Team Panels (Left & Right)

Each team's panel displays:

| Element | Description |
|---------|-------------|
| **Team Name** | "Team A" or "Team B" — highlighted with a green border when it's that team's turn |
| **Questions Left** | e.g. "3 Questions left" — how many of their 5 questions remain this round |
| **Total Score** | Cumulative score across all rounds |
| **Round Score** | Score earned in the current round only |
| **Correct Badge** | Shows correct answers out of 5 with a colour-coded background: 🔴 **Red** = fewer than 3 correct (penalty zone), 🟢 **Green** = 3 or more correct (penalty cleared) |
| **Lifelines** | Icons for each lifeline — greyed out when used |

### Center Panel

| Element | Description |
|---------|-------------|
| **Round Number** | Current round (e.g. "Round 3") |
| **Turn Label** | Whose turn it is (e.g. "Team A's Turn") |
| **Question Progress** | The active team's progress (e.g. "Question 2 of 5") |
| **Base Points** | The base point value for the current round |
| **Countdown Timers** | Two animated progress rings flanking the heading, showing the question's remaining time (colour-coded, pulsing when low) |
| **Quit & Clear** | Button to abandon the current game and delete the saved progress (returns to the Start screen) |

---

## 🆘 Lifelines

Each team has **4 lifelines**. **Only one lifeline may be used per question** — once a lifeline is used, the others are disabled until the next question. A confirmation banner ("You have successfully used the … lifeline") appears below the options for that question.

| Lifeline | Emoji | Availability | Effect |
|----------|-------|-------------|--------|
| **Phone a Friend** | 📞 | All rounds | Consult with your team members. Discuss the answer together! |
| **50/50** | ✂️ | All rounds | Removes **2 incorrect options**, leaving the correct answer and one wrong option. |
| **Mystery Box** | 🎁 | All rounds | A randomizer that triggers **either** Phone a Friend or 50/50 — you won't know which! |
| **Last Chance** | ↩️ | Round 4+ only | Swap the current question for a different one (even a different category). **Unlocks only after all other lifelines are used.** |

### Last Chance Details

The Last Chance lifeline has special unlock conditions:
1. Only available from **Round 4 onward**
2. All three standard lifelines (Phone, 50/50, Mystery Box) must have been **used already**
3. When activated, the current question is discarded and you return to category selection
4. You can pick the **same category** (to get a different question) or a **different category** entirely

---

## 🔊 Sound Effects

The game combines **two audio files** (in `public/`) with **programmatically synthesized** sounds (Web Audio API).

| Sound | Source | Trigger | Description |
|-------|--------|---------|-------------|
| **Question Music** | `public/game.wav` | Question screen | Loops very quietly (volume ~0.05) while a question is displayed; stops when the answer is locked in. |
| **Success** | `public/success.wav` | Answer Result (correct) | Plays when the answer is correct. |
| **Confirmation Chime** | Web Audio API | Final Answer modal | A short ascending chime when the "Final Answer" confirmation modal appears. |
| **Failure Sound** | Web Audio API | Answer Result (wrong / timeout) | A descending tone when the answer is wrong or the timer runs out. |

> **Note:** `game.wav` and `success.wav` live in `public/` and are played via HTML `Audio` elements. The confirmation chime and failure sound are still synthesized at runtime via the Web Audio API. (A legacy synthesized ticking clock and success fanfare remain in `audio.ts` but are no longer used on the question/result screens.)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 16.x
- **npm** ≥ 8.x (or **yarn**)

### Installation

```/dev/null/bash.sh#L1-7
# Clone the repository
git clone <your-repo-url>
cd millionaire

# Install dependencies
npm install

# Start the development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

### Building for Production

```/dev/null/bash.sh#L1
npm run build
```

This creates an optimized build in the `build/` folder.

---

## 📁 Project Structure

```/dev/null/tree.txt#L1-20
millionaire/
├── public/                  # Static assets (incl. game.wav, success.wav)
├── src/
│   ├── components/          # React UI components
│   │   ├── StartScreen.tsx      # Welcome screen with rules + Clear Saved Game
│   │   ├── GameHeader.tsx       # Persistent header bar (team panels + center HUD + timer rings + Quit & Clear)
│   │   ├── CategorySelect.tsx   # Shared category picker for the active team
│   │   ├── QuestionScreen.tsx   # Question display, options, lifelines, used-banner
│   │   ├── AnswerResult.tsx     # Full-screen answer feedback (success/failure/timeout animation)
│   │   ├── RoundSummary.tsx     # End-of-round results with graduated penalty
│   │   ├── ReviewUnusedQuestions.tsx # Post-round review of unplayed categories & answers
│   │   └── GameOver.tsx         # Final results and winner
│   ├── context/
│   │   └── GameContext.tsx      # Game state management (useReducer + Context) + helpers
│   ├── data/
│   │   └── questions.json       # Question bank (editable!)
│   ├── utils/
│   │   ├── audio.ts             # game.wav/success.wav playback + Web Audio API effects
│   │   └── storage.ts           # localStorage persistence (load/save/clear game state)
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces & types
│   ├── App.tsx                  # Root component
│   ├── App.css                  # Component styles (Millionaire theme)
│   └── index.css                # Global base styles
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📝 Updating the Question Bank

All questions live in **`src/data/questions.json`**. The file is a nested JSON object organized by round and category.

### JSON Structure

```/dev/null/structure.json#L1-16
{
  "r1": {
    "Cinema": { "id": "r1_cinema", "text": "...", "options": [...], "correctAnswerIndex": N },
    "Science": { ... },
    "Maths": { ... },
    "Language": { ... },
    "Politics": { ... },
    "Puzzle": { ... },
    "Sports": { ... },
    "Mythology": { ... },
    "History": { ... },
    "Food": { ... },
    "Geography": { ... },
    "Nature": { ... }
  },
  "r2": { ... },
  "r3": { ... },
  "r4": { ... },
  "r5": { ... }
}
```

- **Top-level keys**: `r1` through `r5` (one per round)
- **Second-level keys**: Category names (all 12 per round)
- **Values**: Question objects

### Question Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (format: `r{round}_{category}`, e.g. `r1_cinema`) |
| `text` | string | The question text |
| `options` | string[] | Exactly 4 answer options |
| `correctAnswerIndex` | number | 0-based index of the correct option (0–3) |

> **Note:** `round` and `category` are NOT stored on each question — they're implied by the JSON keys.

### Example Question

```/dev/null/example.json#L1-10
{
  "r2": {
    "Sports": {
      "id": "r2_sports",
      "text": "In which year were the first modern Olympic Games held?",
      "options": ["1888", "1896", "1900", "1904"],
      "correctAnswerIndex": 1
    }
  }
}
```

### Rules for Editing

1. **60 questions total** — 12 categories × 5 rounds = 1 question per category per round.
2. Each `id` must be **unique** (format: `r{round}_{category}`, e.g. `r1_cinema`, `r3_sports`).
3. `options` must contain **exactly 4 strings**.
4. `correctAnswerIndex` is **0-based** (0 = first option, 3 = last option).
5. Questions should increase in difficulty from Round 1 (easy) to Round 5 (expert).
6. The round key determines which round the question is **primarily intended for**. When a team picks a category, the game first looks for an unused question from the current round; if none is available, it falls back to questions from any round.

### Question Distribution

Every round contains **1 question for each of the 12 categories**:

| Round | Difficulty | Questions |
|-------|------------|----------|
| **1** | Easy | 12 (one per category) |
| **2** | Medium-Easy | 12 (one per category) |
| **3** | Medium | 12 (one per category) |
| **4** | Hard | 12 (one per category) |
| **5** | Expert | 12 (one per category) |

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety across all components and state logic |
| **React Context + useReducer** | Global state management |
| **CSS3** | Custom styling with animations (including confetti & emoji rain), gradients, and responsive design |
| **Web Audio API** | Programmatic sound effects (confirmation chime, failure tone); `game.wav` and `success.wav` are played via HTML `Audio` elements |
| **localStorage** | Automatic game-state persistence (save/resume, clear) |
| **Create React App** | Project scaffolding and build tooling |

---

## 🎨 Design Theme

The app features a dramatic, premium design inspired by the TV show:

- **Dark charcoal/black gradient** backgrounds (`#0a0a0a` → `#1a1a1a`)
- **Green (#4ade80) accents** for titles, buttons, highlights, and active borders
- **Glass-morphism** effects on cards and panels (semi-transparent `rgba` backgrounds)
- **Smooth animations** (fade-in, slide-up, pulse, glow)
- **Fully responsive** layout for desktop, tablet, and mobile
- **Large, bold round indicators** for clear game progression
- **Confirmation modal** with green/gray button styling for the answer lock-in flow
- **Answer Result Screen** with confetti animation (correct) and sad emoji rain (incorrect)
- **Programmatic sound effects** via the Web Audio API for ticking clock, chimes, and fanfare

---

## 📜 License

This project is provided for educational and entertainment purposes.
