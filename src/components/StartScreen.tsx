import React from "react";
import { useGame } from "../context/GameContext";

const StartScreen: React.FC = () => {
  const { dispatch } = useGame();

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
            Last Chance.
          </li>
          <li>
            Answer at least 3 out of 5 correctly each round to avoid the penalty
            — otherwise your total score gets cut in half!
          </li>
          <li>
            Points double with each correct answer in a round — earn up to 8,000
            in the final round!
          </li>
        </ul>
      </div>

      <button
        className="start-button"
        onClick={() => dispatch({ type: "START_GAME" })}
      >
        Start Game
      </button>
    </div>
  );
};

export default StartScreen;
