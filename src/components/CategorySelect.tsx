import React from "react";
import { useGame } from "../context/GameContext";
import type { Category } from "../types";

const CATEGORY_EMOJI: Record<Category, string> = {
  Cinema: "🎬",
  Science: "🔬",
  Maths: "🔢",
  Language: "📚",
  Politics: "🏛️",
  Puzzle: "🧩",
  Sports: "⚽",
  Mythology: "🏺",
  History: "📜",
  Food: "🍕",
  Geography: "🌍",
  Nature: "🌿",
};

const CategorySelect: React.FC = () => {
  const { state, dispatch } = useGame();

  const currentTeam = state.teams[state.currentTeamIndex];

  const handleSelect = (category: Category) => {
    dispatch({ type: "SELECT_CATEGORY", category });
  };

  return (
    <div className="category-select">
      <p className="category-prompt">
        {currentTeam.name}, choose your category!
      </p>

      <div className="category-grid">
        {state.availableCategories.map((category) => (
          <button
            key={category}
            className="category-button"
            onClick={() => handleSelect(category)}
          >
            <span className="category-emoji">{CATEGORY_EMOJI[category]}</span>
            <span className="category-label">{category}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelect;
