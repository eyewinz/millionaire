import React from "react";
import { useGame, calculateRoundScore } from "../context/GameContext";
import type { Team } from "../types";

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
  const { state } = useGame();
  const { teams, currentTeamIndex, currentRound } = state;

  // Per-team question progress: how many completed + 1 for the current
  const getQuestionNum = (teamIndex: number): number => {
    const answered = teams[teamIndex].roundAnswered;
    return Math.min(answered + 1, 5);
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
        <span className="header-round">Round {currentRound}</span>
        <span className="header-center-team-progress">
          {teams[currentTeamIndex].name}: {getQuestionNum(currentTeamIndex)} of
          5
        </span>
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
