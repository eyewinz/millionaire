import React from "react";
import { useGame } from "../context/GameContext";

const GameOver: React.FC = () => {
  const { state, dispatch } = useGame();
  const { teams } = state;

  const [teamA, teamB] = teams;

  // Determine the winner (or tie)
  let winnerIndex: number | null = null;
  let headline = "";

  if (teamA.score > teamB.score) {
    winnerIndex = 0;
    headline = `${teamA.name} Wins!`;
  } else if (teamB.score > teamA.score) {
    winnerIndex = 1;
    headline = `${teamB.name} Wins!`;
  } else {
    headline = "It's a Tie!";
  }

  const handlePlayAgain = () => {
    dispatch({ type: "RESET_GAME" });
  };

  return (
    <div className="gameover-screen">
      <h1 className="gameover-title">Game Over!</h1>

      <div
        className={winnerIndex !== null ? "gameover-winner" : "gameover-tie"}
      >
        {winnerIndex !== null ? (
          <>
            <span className="gameover-trophy">🏆</span>
            <h2>Congratulations, {teams[winnerIndex].name}!</h2>
          </>
        ) : (
          <h2>{headline}</h2>
        )}
      </div>

      <div className="gameover-scoreboard">
        {teams.map((team, index) => {
          const isWinner = index === winnerIndex;
          const teamClass = `gameover-team ${
            isWinner ? "gameover-team--winner" : "gameover-team--loser"
          }`;

          return (
            <div key={index} className={teamClass}>
              <h3>
                {isWinner && "👑 "}
                {team.name}
              </h3>
              <p className="gameover-score">
                <strong>{team.score}</strong> pts
              </p>
            </div>
          );
        })}
      </div>

      <button className="gameover-play-again" onClick={handlePlayAgain}>
        Play Again
      </button>
    </div>
  );
};

export default GameOver;
