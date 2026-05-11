import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import type { Category, LifelineType } from "../types";

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
};

const OPTION_LABELS = ["A", "B", "C", "D"];

interface LifelineConfig {
  type: LifelineType;
  emoji: string;
  label: string;
}

const LIFELINES: LifelineConfig[] = [
  { type: "phone", emoji: "📞", label: "Phone a Friend" },
  { type: "fifty", emoji: "✂️", label: "50/50" },
  { type: "mystery", emoji: "🎁", label: "Mystery Box" },
];

const QuestionScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const currentTeam = state.teams[state.currentTeamIndex];
  const question = state.currentQuestion;

  const canUseLastChance =
    state.currentRound >= 4 &&
    currentTeam.lifelines.lastChance &&
    !currentTeam.lifelines.phone &&
    !currentTeam.lifelines.fifty &&
    !currentTeam.lifelines.mystery;

  if (!question) {
    return null;
  }

  const {
    selectedAnswerIndex,
    isAnswerRevealed,
    activeLifeline,
    phase,
    selectedCategory,
    currentRound,
  } = state;

  const isCorrect =
    isAnswerRevealed && selectedAnswerIndex === question.correctAnswerIndex;

  // Determine which option indices are hidden by 50/50 (persists after overlay dismissal)
  const hiddenIndices: number[] = state.fiftyFiftyIndices;

  // Build class name for each option button
  const getOptionClassName = (index: number): string => {
    const classes = ["question-option"];

    if (hiddenIndices.includes(index)) {
      classes.push("question-option--hidden");
    }

    if (isAnswerRevealed) {
      if (index === question.correctAnswerIndex) {
        classes.push("question-option--correct");
      }
      if (
        index === selectedAnswerIndex &&
        index !== question.correctAnswerIndex
      ) {
        classes.push("question-option--wrong");
      }
    } else if (index === selectedAnswerIndex) {
      classes.push("question-option--selected");
    }

    return classes.join(" ");
  };

  const handleSelectAnswer = (index: number) => {
    if (isAnswerRevealed) return;
    if (hiddenIndices.includes(index)) return;
    dispatch({ type: "SELECT_ANSWER", index });
  };

  const handleRevealAnswer = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmAnswer = () => {
    setShowConfirmModal(false);
    dispatch({ type: "REVEAL_ANSWER" });
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
  };

  const handleNextQuestion = () => {
    dispatch({ type: "NEXT_QUESTION" });
  };

  const handleUseLifeline = (lifeline: LifelineType) => {
    dispatch({ type: "USE_LIFELINE", lifeline });
  };

  const handleDismissLifeline = () => {
    dispatch({ type: "DISMISS_LIFELINE" });
  };

  // Resolve the label shown for a mystery box reveal
  const getMysteryRevealLabel = (resolvedAs: "phone" | "fifty"): string => {
    return resolvedAs === "phone" ? "Phone a Friend" : "50/50";
  };

  return (
    <div className="question-screen">
      {/* Category badge */}
      <div className="question-header">
        {selectedCategory && (
          <p className="question-category">
            {CATEGORY_EMOJI[selectedCategory]} {selectedCategory}
          </p>
        )}
      </div>

      {/* Question text */}
      <p className="question-text">{question.text}</p>

      {/* Options */}
      <div className="question-options">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={getOptionClassName(index)}
            onClick={() => handleSelectAnswer(index)}
            disabled={isAnswerRevealed || hiddenIndices.includes(index)}
          >
            <span className="question-option-label">
              {OPTION_LABELS[index]}:
            </span>{" "}
            {option}
          </button>
        ))}
      </div>

      {/* Confirm / Lock-in button */}
      {!isAnswerRevealed && (
        <button
          className="question-confirm-btn"
          disabled={selectedAnswerIndex === null}
          onClick={handleRevealAnswer}
        >
          Final Answer
        </button>
      )}

      {/* Lifeline buttons (only during question phase, before reveal) */}
      {phase === "question" && !isAnswerRevealed && (
        <>
          <div className="question-lifelines">
            {LIFELINES.map(({ type, emoji, label }) => {
              const isUsed = !currentTeam.lifelines[type];
              return (
                <button
                  key={type}
                  className={`question-lifeline-btn${
                    isUsed ? " question-lifeline-btn--used" : ""
                  }`}
                  disabled={isUsed}
                  onClick={() => handleUseLifeline(type)}
                >
                  {emoji} {label}
                </button>
              );
            })}
          </div>

          {state.currentRound >= 4 && (
            <div className="question-last-chance">
              <button
                className={`question-last-chance-btn${
                  canUseLastChance ? "" : " question-last-chance-btn--disabled"
                }`}
                disabled={!canUseLastChance}
                onClick={() =>
                  dispatch({ type: "USE_LIFELINE", lifeline: "lastChance" })
                }
                title={
                  !currentTeam.lifelines.lastChance
                    ? "Already used"
                    : currentTeam.lifelines.phone ||
                        currentTeam.lifelines.fifty ||
                        currentTeam.lifelines.mystery
                      ? "Use all other lifelines first"
                      : ""
                }
              >
                ↩️ Last Chance
              </button>
              {(currentTeam.lifelines.phone ||
                currentTeam.lifelines.fifty ||
                currentTeam.lifelines.mystery) &&
                currentTeam.lifelines.lastChance && (
                  <p className="question-last-chance-hint">
                    Use all other lifelines first to unlock
                  </p>
                )}
            </div>
          )}
        </>
      )}

      {/* Result feedback (after reveal) */}
      {phase === "result" && isAnswerRevealed && (
        <div className="question-result">
          {isCorrect ? (
            <p className="question-result question-result--correct">
              Correct! 🎉
            </p>
          ) : (
            <p className="question-result question-result--wrong">Wrong! ❌</p>
          )}
          <button className="question-next-btn" onClick={handleNextQuestion}>
            Next Question
          </button>
        </div>
      )}

      {/* Confirmation modal */}
      {showConfirmModal && selectedAnswerIndex !== null && (
        <div className="question-overlay">
          <div className="question-overlay-content">
            <h3 className="question-overlay-title">Lock in your answer?</h3>
            <p className="question-overlay-text">
              You selected:{" "}
              <strong>
                {OPTION_LABELS[selectedAnswerIndex]}:{" "}
                {question.options[selectedAnswerIndex]}
              </strong>
            </p>
            <p
              className="question-overlay-text"
              style={{ fontSize: "0.85rem", opacity: 0.6 }}
            >
              This cannot be changed once confirmed.
            </p>
            <div className="confirm-modal-actions">
              <button
                className="question-overlay-btn confirm-modal-btn--confirm"
                onClick={handleConfirmAnswer}
              >
                Confirm
              </button>
              <button
                className="question-overlay-btn confirm-modal-btn--cancel"
                onClick={handleCancelConfirm}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lifeline overlay / modal */}
      {activeLifeline && (
        <div className="question-overlay">
          <div className="question-overlay-content">
            {activeLifeline.type === "mystery" && (
              <p className="question-overlay-mystery">
                🎁 Mystery Box revealed:{" "}
                {getMysteryRevealLabel(activeLifeline.resolvedAs)}!
              </p>
            )}

            {activeLifeline.resolvedAs === "phone" && (
              <>
                <h3 className="question-overlay-title">📞 Phone a Friend</h3>
                <p className="question-overlay-text">
                  Consult with your team members! Discuss the answer together.
                </p>
              </>
            )}

            {activeLifeline.resolvedAs === "fifty" && (
              <>
                <h3 className="question-overlay-title">✂️ 50/50</h3>
                <p className="question-overlay-text">
                  50/50 activated! Two wrong answers removed.
                </p>
              </>
            )}

            <button
              className="question-overlay-btn"
              onClick={handleDismissLifeline}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionScreen;
