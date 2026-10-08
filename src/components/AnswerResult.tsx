import React, { useEffect, useMemo } from "react";
import { useGame, calculateRoundScore } from "../context/GameContext";
import { playSuccessSound, playFailure } from "../utils/audio";

const SUCCESS_EMOJIS = ["🎉", "✨", "🌟", "⭐", "🎊", "💫", "🥳", "🏆"];
const FAILURE_EMOJIS = ["😢", "😞", "😔", "💔", "😿", "🥺", "😥", "☹️"];

const PARTICLE_COUNT = 35;

const AnswerResult: React.FC = () => {
  const { state, dispatch } = useGame();

  const question = state.currentQuestion;
  const selectedAnswerIndex = state.selectedAnswerIndex;
  const timedOut = state.timedOut;
  // A timeout always counts as wrong, regardless of any selected answer.
  const isCorrect =
    !timedOut &&
    question !== null &&
    selectedAnswerIndex === question.correctAnswerIndex;

  const currentTeam = state.teams[state.currentTeamIndex];
  const roundScore = calculateRoundScore(
    state.currentRound,
    currentTeam.roundCorrect,
  );

  // Generate particles with stable random positions (memoized so they don't re-randomize)
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2.5,
        duration: 2.5 + Math.random() * 3,
        size: 1.2 + Math.random() * 1.8,
      })),
    [],
  );

  // Play sound on mount
  useEffect(() => {
    if (isCorrect) {
      playSuccessSound();
    } else {
      playFailure();
    }
  }, [isCorrect]);

  const handleContinue = () => {
    dispatch({ type: "NEXT_QUESTION" });
  };

  const emojis = isCorrect ? SUCCESS_EMOJIS : FAILURE_EMOJIS;

  return (
    <div
      className={`answer-result-screen ${isCorrect ? "answer-result-screen--success" : "answer-result-screen--failure"}`}
    >
      {/* Background particle animation */}
      <div className="answer-result-particles" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="answer-result-particle"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              fontSize: `${p.size}rem`,
            }}
          >
            {emojis[p.id % emojis.length]}
          </span>
        ))}
      </div>

      {/* Content overlay */}
      <div className="answer-result-content">
        {/* Big result icon */}
        <div className="answer-result-icon">
          {isCorrect ? "🎉" : timedOut ? "⏰" : "😢"}
        </div>

        {/* Title */}
        <h1
          className={`answer-result-title ${isCorrect ? "answer-result-title--correct" : "answer-result-title--wrong"}`}
        >
          {isCorrect ? "Correct!" : timedOut ? "Time's Up!" : "Wrong!"}
        </h1>

        {/* Subtitle */}
        <p className="answer-result-subtitle">
          {isCorrect
            ? "Great job! You nailed it! 🔥"
            : timedOut
              ? "You ran out of time!"
              : "Better luck next time!"}
        </p>

        {/* Show correct answer if wrong */}
        {!isCorrect && question && (
          <p className="answer-result-correct-answer">
            The correct answer was:{" "}
            <strong>{question.options[question.correctAnswerIndex]}</strong>
          </p>
        )}

        {/* Points summary */}
        <div className="answer-result-points">
          <div className="answer-result-points-card">
            <span className="answer-result-points-label">Round Score</span>
            <span className="answer-result-points-value">{roundScore} pts</span>
          </div>
          <div className="answer-result-points-card">
            <span className="answer-result-points-label">Total Score</span>
            <span className="answer-result-points-value">
              {currentTeam.score} pts
            </span>
          </div>
        </div>

        {/* Team name */}
        <p className="answer-result-team">{currentTeam.name}</p>

        {/* Continue button */}
        <button className="answer-result-continue-btn" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default AnswerResult;
