import React, { useState, useEffect, useCallback } from "react";
import Wordle from "./Wordle";
import { newGameApi } from "./components/util/apiCalls";
import { useAuth0 } from "@auth0/auth0-react";
import Stats from "./components/Stats";
import NotFound from "./components/NotFound";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";

function App() {
  const { isAuthenticated, user } = useAuth0();
  const [gameState, setGameState] = useState(null);

  const initialGameState = useCallback(async () => {
    try {
      if (!isAuthenticated) return;
      const maxGuesses = 5;
      const wordLength = 5;
      const initialData = await newGameApi(maxGuesses, wordLength, user.sub);
      setGameState(initialData);
    } catch (error) {
      console.error("Failed to initialize game state:", error);
    }
  }, [isAuthenticated]);

  // Use useEffect to call initialGameState when the component mounts
  useEffect(() => {
    initialGameState();
  }, [initialGameState]);

  return (
    // * have the h1 tag always present, but switch between gameState and stats page
    <Router>
      <div className="App">
        <h1>
          Wordle (vaas.ai)
          <Link to="/stats">Stats</Link>
        </h1>

        <Routes>
          <Route
            path="/"
            element={
              <Wordle gameState={gameState} setGameState={setGameState} />
            }
          />
          <Route path="/stats" element={<Stats />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
