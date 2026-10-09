import React from "react";
import {
  useGame,
  ROUND_BASE_POINTS,
  calculateRoundScore,
  getRoundPenaltyFraction,
} from "../context/GameContext";

const RoundSummary: React.FC = () => {
  const { state, dispatch } = useGame();
  const { teams, currentRound } = state;

  const handleContinue = () => {
    dispatch({ type: "SHOW_ROUND_REVIEW" });
  };

  return (
    <div className="summary-screen">
      <h1 className="summary-title">Round {currentRound} Complete!</h1>

      <p className="summary-dramatic">How did each team perform this round?</p>

      <div className="summary-cards">
        {teams.map((team, index) => {
          const passed = team.roundCorrect >= 3;
          const roundWrong = team.roundAnswered - team.roundCorrect;
          const penaltyFraction = getRoundPenaltyFraction(
            currentRound,
            team.roundCorrect,
            roundWrong,
          );

          const cardClass = `summary-card ${
            passed ? "summary-card--pass" : "summary-card--fail"
          }`;

          return (
            <div key={index} className={cardClass}>
              <h2>{team.name}</h2>
              <p className="summary-stat">
                Correct: <strong>{team.roundCorrect}</strong> / 5
              </p>
              <p className="summary-stat">
                Base Points: <strong>{ROUND_BASE_POINTS[currentRound]}</strong>
              </p>
              {team.roundCorrect > 0 ? (
                <p className="summary-stat summary-score">
                  Round Score:{" "}
                  <strong>
                    {calculateRoundScore(currentRound, team.roundCorrect)}
                  </strong>{" "}
                  pts
                  <span className="summary-formula">
                    ({ROUND_BASE_POINTS[currentRound]} × 2
                    <sup>{team.roundCorrect - 1}</sup>)
                  </span>
                </p>
              ) : (
                <p className="summary-stat summary-score">
                  Round Score: <strong>0</strong> pts
                </p>
              )}
              <p className="summary-stat">
                {penaltyFraction === 0
                  ? "✅ No penalty"
                  : `⚠️ Penalty: -${Math.round(
                      penaltyFraction * 100,
                    )}% total score`}
              </p>
              <p className="summary-threshold">
                {currentRound === 1
                  ? "Round 1 is a grace round — no penalty"
                  : "Need at least 3 correct to avoid penalty"}
              </p>
            </div>
          );
        })}
      </div>

      <button className="summary-continue-btn" onClick={handleContinue}>
        Continue
      </button>
    </div>
  );
};

export default RoundSummary;
