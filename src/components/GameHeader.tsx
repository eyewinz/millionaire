import React, { useState, useEffect } from "react";
import {
  useGame,
  calculateRoundScore,
  ROUND_BASE_POINTS,
  clearGameState,
  getQuestionTimeLimitSeconds,
} from "../context/GameContext";
import type { Team } from "../types";

interface HeaderTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
}

const HeaderTimer: React.FC<HeaderTimerProps> = ({
  remainingSeconds,
  totalSeconds,
}) => {
  const fraction =
    totalSeconds > 0
      ? Math.max(0, Math.min(1, remainingSeconds / totalSeconds))
      : 0;
  const degrees = fraction * 360;

  const danger = remainingSeconds <= 30;
  const warning = !danger && remainingSeconds <= 60;
  const color = danger ? "#f87171" : warning ? "#fbbf24" : "#4ade80";

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const label = `${minutes}:${String(seconds).padStart(2, "0")}`;

  const timerClasses = [
    "header-timer",
    danger ? "header-timer--danger" : "",
    warning ? "header-timer--warning" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={timerClasses} role="timer" aria-label="Time remaining">
      <div
        className="header-timer-ring"
        style={{
          background: `conic-gradient(${color} ${degrees}deg, rgba(255, 255, 255, 0.08) ${degrees}deg 360deg)`,
          color,
        }}
      >
        <div className="header-timer-inner">
          <span className="header-timer-value" key={remainingSeconds}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

interface TeamPanelProps {
  team: Team;
  isActive: boolean;
  questionsLeft: number;
  currentRound: number;
}

const TeamPanel: React.FC<TeamPanelProps> = ({
  team,
  isActive,
  questionsLeft,
  currentRound,
}) => {
  const panelClasses = ["header-team", isActive ? "header-team--active" : ""]
    .filter(Boolean)
    .join(" ");

  const roundScore = calculateRoundScore(currentRound, team.roundCorrect);
  const crossedPenalty = team.roundCorrect >= 3;

  return (
    <div className={panelClasses}>
      <span className="header-team-name">{team.name}</span>

      <span className="header-question-progress">
        {questionsLeft} Question{questionsLeft !== 1 ? "s" : ""} left
      </span>

      <div className="header-scores">
        <span className="header-total-score">Total: {team.score} pts</span>
        <span className="header-round-score">Round: {roundScore} pts</span>
      </div>

      <span
        className={`header-correct-badge ${crossedPenalty ? "header-correct-badge--safe" : "header-correct-badge--danger"}`}
      >
        {team.roundCorrect} / 5 correct
      </span>

      <div className="header-lifelines">
        <span
          className={`header-lifeline ${!team.lifelines.phone ? "header-lifeline--used" : ""}`}
          title="Phone a Friend"
        >
          📞
        </span>
        <span
          className={`header-lifeline ${!team.lifelines.fifty ? "header-lifeline--used" : ""}`}
          title="50/50"
        >
          ✂️
        </span>
        <span
          className={`header-lifeline ${!team.lifelines.mystery ? "header-lifeline--used" : ""}`}
          title="Mystery Box"
        >
          🎁
        </span>
        <span
          className={`header-lifeline ${!team.lifelines.lastChance ? "header-lifeline--used" : ""}`}
          title="Last Chance"
        >
          ↩️
        </span>
      </div>
    </div>
  );
};

const GameHeader: React.FC = () => {
  const { state, dispatch } = useGame();
  const { teams, currentTeamIndex, currentRound } = state;

  // ---- Question countdown (only active during the question phase) ----
  const deadline =
    state.phase === "question" ? state.questionDeadline : null;
  const totalSeconds = getQuestionTimeLimitSeconds(currentRound);

  const [remainingMs, setRemainingMs] = useState(() =>
    deadline ? Math.max(0, deadline - Date.now()) : 0,
  );

  useEffect(() => {
    if (!deadline) return;

    const tick = () => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        setRemainingMs(0);
        dispatch({ type: "TIME_UP" });
      } else {
        setRemainingMs(remaining);
      }
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [deadline, dispatch]);

  const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const showTimer = deadline !== null;

  // Per-team question progress: how many completed + 1 for the current
  const getQuestionNum = (teamIndex: number): number => {
    const answered = teams[teamIndex].roundAnswered;
    return Math.min(answered + 1, 5);
  };

  const handleQuitAndClear = () => {
    const confirmed = window.confirm(
      "Quit the current game and clear saved progress? This cannot be undone.",
    );
    if (!confirmed) return;
    clearGameState();
    dispatch({ type: "RESET_GAME" });
  };

  return (
    <div className="header-bar">
      <TeamPanel
        team={teams[0]}
        isActive={currentTeamIndex === 0}
        questionsLeft={5 - teams[0].roundAnswered}
        currentRound={currentRound}
      />

      <div className="header-center">
        {showTimer && (
          <HeaderTimer
            remainingSeconds={remainingSeconds}
            totalSeconds={totalSeconds}
          />
        )}

        <div className="header-center-text">
          <span className="header-round">Round {currentRound}</span>
          <span className="header-turn-label">
            {teams[currentTeamIndex].name}&rsquo;s Turn
          </span>
          <span className="header-center-team-progress">
            Question {getQuestionNum(currentTeamIndex)} of 5
          </span>
          <span className="header-base-points">
            Base: {ROUND_BASE_POINTS[currentRound]} pts
          </span>
          <button
            className="header-quit-button"
            onClick={handleQuitAndClear}
            title="Quit the game and delete saved progress"
          >
            Quit & Clear
          </button>
        </div>

        {showTimer && (
          <HeaderTimer
            remainingSeconds={remainingSeconds}
            totalSeconds={totalSeconds}
          />
        )}
      </div>

      <TeamPanel
        team={teams[1]}
        isActive={currentTeamIndex === 1}
        questionsLeft={5 - teams[1].roundAnswered}
        currentRound={currentRound}
      />
    </div>
  );
};

export default GameHeader;
