import React from "react";
import "./App.css";
import { GameProvider, useGame } from "./context/GameContext";
import StartScreen from "./components/StartScreen";
import GameHeader from "./components/GameHeader";
import CategorySelect from "./components/CategorySelect";
import QuestionScreen from "./components/QuestionScreen";
import AnswerResult from "./components/AnswerResult";
import RoundSummary from "./components/RoundSummary";
import ReviewUnusedQuestions from "./components/ReviewUnusedQuestions";
import GameOver from "./components/GameOver";

const GameContent: React.FC = () => {
  const { state } = useGame();

  return (
    <div className="app">
      {state.phase !== "start" && state.phase !== "result" && <GameHeader />}

      <main className="app-main">
        {state.phase === "start" && <StartScreen />}
        {state.phase === "category-select" && <CategorySelect />}
        {state.phase === "question" && <QuestionScreen />}
        {state.phase === "result" && <AnswerResult />}
        {state.phase === "round-summary" && <RoundSummary />}
        {state.phase === "round-review" && <ReviewUnusedQuestions />}
        {state.phase === "game-over" && <GameOver />}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
};

export default App;
