# 🏆 Who Wants to Be a Millionaire? — Team Edition

A responsive React web application themed after *Who Wants to Be a Millionaire?*, designed for a **local multiplayer experience** between two teams. Built with **TypeScript** and **React** (Create React App).

---

## 📸 Overview

Two teams compete head-to-head across **5 rounds of 5 questions each** — **25 questions per team** (50 total). Every round, both teams choose from a **shared pool of all 11 knowledge categories**. Once a category is picked by either team, it's removed from the pool for the rest of that round. Each team has **4 lifelines** to use strategically. Points double with each correct answer, and teams must answer at least 3 out of 5 correctly each round to avoid a score penalty!

---

## 🎮 Game Rules

### Teams & Turns

- **Two teams**: Team A and Team B.
- Teams **alternate turns** throughout the game: Team A answers, then Team B answers, and so on.
- Each team answers **25 questions** over the course of the game (50 question events total).

### Rounds & Questions

- The game consists of **5 rounds**, each containing **10 question events** (5 per team).
- Within each round, teams alternate turns and select from a **shared category pool**.
- Each round starts with **all 11 categories** available. Once either team picks a category, it is **removed from the pool for both teams** for the remainder of that round.
- After 10 picks (5 per team), 1 category remains unused. The pool **resets to all 11** at the start of the next round.

### Category Selection Flow (Example)

| Step | Team | Categories Available | Picks |
|------|------|---------------------|-------|
| R1 Q1 | Team A | All 11 | 🎬 Cinema |
| R1 Q1 | Team B | 10 remaining | ⚽ Sports |
| R1 Q2 | Team A | 9 remaining | 🔢 Maths |
| R1 Q2 | Team B | 8 remaining | 📜 History |
| ... | ... | ... | ... |
| R1 Q5 | Team B | 2 remaining | 🍕 Food |
| **R2 Q1** | **Team A** | **All 11 (reset)** | ... |

### Categories

The game features **11 knowledge categories**, all available every round:

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

### Penalty System

After each round, both teams are evaluated:

- Each team answers exactly **5 questions per round**.
- If a team answers **fewer than 3 correctly**, their **total accumulated score is halved** as a penalty.
- There is **no elimination** — both teams always play all 5 rounds.
- This creates a strategic incentive to answer carefully: a penalty in an early round compounds over time!

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
| **Team Name** | "Team A" or "Team B" — highlighted with a gold border when it's that team's turn |
| **Questions Left** | e.g. "3 Questions left" — how many of their 5 questions remain this round |
| **Total Score** | Cumulative score across all rounds |
| **Round Score** | Score earned in the current round only |
| **Correct Badge** | Shows correct answers out of 5 with a colour-coded background: 🔴 **Red** = fewer than 3 correct (penalty zone), 🟢 **Green** = 3 or more correct (penalty cleared) |
| **Lifelines** | Icons for each lifeline — greyed out when used |

### Center Panel

| Element | Description |
|---------|-------------|
| **Round Number** | Current round (e.g. "Round 3") |
| **Question Progress** | Shows the active team's progress (e.g. "Team A: 2 of 5") |

---

## 🆘 Lifelines

Each team has **4 lifelines**, each usable **once** during their turn (before locking in an answer):

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
├── public/                  # Static assets
├── src/
│   ├── components/          # React UI components
│   │   ├── StartScreen.tsx      # Welcome screen with rules
│   │   ├── GameHeader.tsx       # Persistent header bar (team panels + center HUD)
│   │   ├── CategorySelect.tsx   # Shared category picker for the active team
│   │   ├── QuestionScreen.tsx   # Question display, options, lifelines
│   │   ├── RoundSummary.tsx     # End-of-round results with scoring
│   │   └── GameOver.tsx         # Final results and winner
│   ├── context/
│   │   └── GameContext.tsx      # Game state management (useReducer + Context)
│   ├── data/
│   │   └── questions.json       # Question bank (editable!)
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
    "Geography": { ... }
  },
  "r2": { ... },
  "r3": { ... },
  "r4": { ... },
  "r5": { ... }
}
```

- **Top-level keys**: `r1` through `r5` (one per round)
- **Second-level keys**: Category names (all 11 per round)
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

1. **55 questions total** — 11 categories × 5 rounds = 1 question per category per round.
2. Each `id` must be **unique** (format: `r{round}_{category}`, e.g. `r1_cinema`, `r3_sports`).
3. `options` must contain **exactly 4 strings**.
4. `correctAnswerIndex` is **0-based** (0 = first option, 3 = last option).
5. Questions should increase in difficulty from Round 1 (easy) to Round 5 (expert).
6. The round key determines which round the question is **primarily intended for**. When a team picks a category, the game first looks for an unused question from the current round; if none is available, it falls back to questions from any round.

### Question Distribution

Every round contains **1 question for each of the 11 categories**:

| Round | Difficulty | Questions |
|-------|------------|----------|
| **1** | Easy | 11 (one per category) |
| **2** | Medium-Easy | 11 (one per category) |
| **3** | Medium | 11 (one per category) |
| **4** | Hard | 11 (one per category) |
| **5** | Expert | 11 (one per category) |

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety across all components and state logic |
| **React Context + useReducer** | Global state management |
| **CSS3** | Custom styling with animations, gradients, and responsive design |
| **Create React App** | Project scaffolding and build tooling |

---

## 🎨 Design Theme

The app features a dramatic, premium design inspired by the TV show:

- **Dark blue/purple gradient** backgrounds
- **Gold (#FFD700) accents** for titles, buttons, and highlights
- **Glass-morphism** effects on cards and panels
- **Smooth animations** (fade-in, slide-up, pulse, glow)
- **Fully responsive** layout for desktop, tablet, and mobile
- **Large, bold round indicators** for clear game progression

---

## 📜 License

This project is provided for educational and entertainment purposes.
