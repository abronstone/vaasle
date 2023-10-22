import React, { useEffect, useState } from "react";
// import useWordle from './gameLogic/useWordle'
// import handleKeyup from './gameLogic/handleKeyUp'
import { makeGuessApi } from "./util/apiCalls";
// components
import Grid from "./Grid";
import Keypad from "./Keypad";
import Modal from "./Modal";

export default function Wordle({ gameState, setGameState }) {
  const [state, setState] = useState({
    currentGuess: "",
    guesses: [],
    turn: 0,
    usedKeys: {},
    isCorrect: false,
    showModal: false,
  });

  // Each time a key is pressed, the handleKeyup function is called
  const handleKeyup = async (e) => {
    const key = e.key;

    // If the enter key is pressed, the current guess is submitted and the FE's state is updated
    if (key === "Enter") {
      // Make previous state variables easy to work with
      const { turn, isCorrect, currentGuess, guesses } = state;

      // only add guess if turn is less than 5
      if (turn > 5 && !isCorrect) {
        console.log("you used all your guesses!");
        return;
      }
      // do not allow duplicate words
      // if (guesses.includes(currentGuess)) {
      //   console.log('you already tried that word.');
      //   return;
      // }
      // check word is 5 chars
      if (currentGuess.length !== 5) {
        console.log("word must be 5 chars.");
        return;
      }
      try {
        // When a guess is submitted, the API called to get a new game state
        // and all necessary state is updated

        // When a guess is submitted, call API to get a new game state
        const newGameState = await makeGuessApi(
          gameState.metadata.gameID,
          currentGuess
        );

        // Update various state variables based on the newGameState
        setGameState(newGameState); // Set this first before using it

        // Create an array of mappings of letters to colors for the most recent guess.
        const mostRecentGuessArr = [];

        // Deconstruct the guess into the word and its color codes (eg. "GGYXG").
        if (newGameState.guesses.length > 0) {
          const [word, colorCodes] = newGameState.guesses[turn];

          // Loop through each letter of the word.
          Array.from(word).forEach((letter, index) => {
            const colorCode = colorCodes[index];

            // Determine the color needed for FE based on the color code.
            const color =
              colorCode === "G"
                ? "green"
                : colorCode === "Y"
                  ? "yellow"
                  : "grey";

            // Update the mapping of the letter to the color.
            mostRecentGuessArr.push({ letter, color });

          });
        }

        // make a map of all the unique used letter color pairs from guesses
        const usedKeysMap = new Map();

        Object.keys(guesses).forEach((key) => {
          usedKeysMap.set(key, guesses[key]);
        });

        // Update state
        setState({
          ...state,
          currentGuess: "",
          turn: turn + 1,
          guesses: [...guesses, mostRecentGuessArr],
          isCorrect: gameState.state === "won",
          usedKeys: Object.fromEntries(usedKeysMap),
        });
      } catch (error) {
        console.error("Failed to update game state:", error);
      }
    } // This is where the problematic curly brace was located
    if (key === "Backspace") {
      setState({ ...state, currentGuess: state.currentGuess.slice(0, -1) });
      return;
    }
    if (/^[A-Za-z]$/.test(key)) {
      if (state.currentGuess.length < 5) {
        setState({ ...state, currentGuess: state.currentGuess + key });
      }
    }
  };

  // attach keyup listening to event object
  useEffect(() => {
    window.addEventListener("keyup", handleKeyup);

    const handleGameEnd = () => {
      console.log(
        state.isCorrect
          ? "you won the game!"
          : "unlucky, you ran out of guesses"
      );
      setTimeout(() => setGameState({ ...state, showModal: true }), 2000);
      window.removeEventListener("keyup", handleKeyup);
    };

    if (
      setGameState.isCorrect ||
      (setGameState.turn > 5 && !setGameState.isCorrect)
    ) {
      handleGameEnd();
    }

    return () => window.removeEventListener("keyup", handleKeyup);
  }, [state]);

  //
  return (
    <div>
      <div>Current Guess - {state.currentGuess}</div>
      <Grid
        guesses={state.guesses}
        currentGuess={state.currentGuess}
        turn={state.turn}
      />
      <Keypad usedKeys={state.usedKeys} />
      {state.showModal && (
        <Modal isCorrect={state.isCorrect} turn={state.turn} />
      )}
    </div>
  );
}
