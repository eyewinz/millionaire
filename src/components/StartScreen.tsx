import React, { useState } from "react";
import { useGame, clearGameState } from "../context/GameContext";
import { loadGameState } from "../utils/storage";

const StartScreen: React.FC = () => {
  const { dispatch } = useGame();
  // Whether a saved game currently exists in storage.
  const [hasSavedGame, setHasSavedGame] = useState(() => loadGameState() !== null);

  const handleClearSavedGame = () => {
    const confirmed = window.confirm(
      "Clear the saved game? This permanently deletes the stored progress and cannot be undone.",
    );
    if (!confirmed) return;
    clearGameState();
    dispatch({ type: "RESET_GAME" });
    setHasSavedGame(false);
  };

  return (
    <div className="start-screen">
      <h1 className="start-title">Who Wants to Be a Millionaire?</h1>
      <p className="start-subtitle">Team Edition</p>

      <div className="start-rules">
        <h2 className="start-rules-heading">How to Play</h2>
        <ul className="start-rules-list">
          <li>
            Two teams compete across 5 rounds of 5 questions each — 25 questions
            per team!
          </li>
          <li>
            Each round, both teams pick from a shared pool of all 12 categories
            — once a category is picked, it's gone for both teams that round.
          </li>
          <li>
            Each team has 4 lifelines: Phone a Friend, 50/50, Mystery Box, and
            Last Chance. Only one lifeline may be used per question, and Last
            Chance is available in rounds 4 &amp; 5 only.
          </li>
          <li>
            Every question is timed: <strong>3 minutes</strong> in rounds 1-3
            and <strong>5 minutes</strong> in rounds 4-5. If the timer runs
            out, the question is marked wrong automatically.
          </li>
          <li>
            <strong>Round 1 is a grace round — no penalty, ever.</strong> From
            round 2 onward, answer at least 3 out of 5 correctly each round to
            avoid a penalty. Otherwise your total score is reduced gradually:{" "}
            <strong>-40%</strong> for 3 wrong, <strong>-50%</strong> for 4
            wrong, and <strong>-60%</strong> if all 5 are wrong.
          </li>
          <li>
            Points double with each correct answer in a round — earn up to 8,000
            in the final round!
          </li>
        </ul>
      </div>

      <div className="start-actions">
        <button
          className="start-button"
          onClick={() => dispatch({ type: "START_GAME" })}
        >
          Start Game
        </button>

        {hasSavedGame && (
          <button
            className="start-clear-button"
            onClick={handleClearSavedGame}
          >
            Clear Saved Game
          </button>
        )}
      </div>
    </div>
  );
};

export default StartScreen;
