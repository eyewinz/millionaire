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
            Choose from 11 categories: Cinema, Science, Maths, Language,
            Politics, Puzzle, Sports, Mythology, History, Food, Geography
          </li>
          <li>Each round features 5 different categories to choose from</li>
          <li>
            Each team has 4 lifelines: Phone a Friend, 50/50, Mystery Box, and
            Last Chance
          </li>
          <li>Answer at least 3 out of 5 correctly each round to advance!</li>
          <li>
            Points double with each correct answer — earn up to 8,000 in the
            final round!
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
