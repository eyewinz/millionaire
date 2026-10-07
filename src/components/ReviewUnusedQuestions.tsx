import React from "react";
import {
  useGame,
  getUnusedQuestionsForRound,
} from "../context/GameContext";
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

const OPTION_LABELS = ["A", "B", "C", "D"];

const ReviewUnusedQuestions: React.FC = () => {
  const { state, dispatch } = useGame();
  const { currentRound } = state;

  const unusedQuestions = getUnusedQuestionsForRound(state);

  const handleContinue = () => {
    dispatch({ type: "CONTINUE_AFTER_ROUND" });
  };

  return (
    <div className="review-screen">
      <h1 className="review-title">Round {currentRound} — Unplayed Categories</h1>
      <p className="review-subtitle">
        These categories weren&rsquo;t picked this round. Here are their answers:
      </p>

      {unusedQuestions.length === 0 ? (
        <p className="review-empty">
          Every category was played this round! 🎉
        </p>
      ) : (
        <div className="review-list">
          {unusedQuestions.map((q) => (
            <div key={q.id} className="review-card">
              <p className="review-category">
                {CATEGORY_EMOJI[q.category]} {q.category}
              </p>
              <p className="review-question">{q.text}</p>
              <div className="review-options">
                {q.options.map((option, index) => {
                  const isCorrect = index === q.correctAnswerIndex;
                  return (
                    <div
                      key={index}
                      className={`review-option ${
                        isCorrect ? "review-option--correct" : ""
                      }`}
                    >
                      <span className="review-option-label">
                        {OPTION_LABELS[index]}:
                      </span>{" "}
                      {option}
                      {isCorrect && (
                        <span className="review-option-check"> ✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="review-continue-btn" onClick={handleContinue}>
        Continue
      </button>
    </div>
  );
};

export default ReviewUnusedQuestions;
