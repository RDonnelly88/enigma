"use client";

import { useCallback, useReducer } from "react";
import { ALPHABET, DEFAULT_SETTINGS, press, validate, type Keypress, type Settings } from "@/lib/enigma";

type State = {
  settings: Settings;
  /** Where the rotors stood before the first letter on the tape, for rewinding. */
  start: Settings["positions"];
  input: string;
  output: string;
  /** The key being held down; its lamp stays lit until it comes up. */
  held: Keypress | null;
  /** The most recent key press, kept after release so its path can be studied. */
  last: Keypress | null;
};

type Action =
  | { type: "down"; letter: string }
  | { type: "up" }
  | { type: "message"; text: string }
  | { type: "configure"; settings: Settings }
  | { type: "rewind" }
  | { type: "clear" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "down": {
      // A real key can't be pressed while another is down: the first one locks the rest
      if (state.held || validate(state.settings).length > 0) return state;
      const result = press(state.settings, action.letter);
      return {
        ...state,
        settings: { ...state.settings, positions: result.positions },
        input: state.input + result.input,
        output: state.output + result.output,
        held: result,
        last: result,
      };
    }
    case "message": {
      let next: State = { ...state, held: null };
      for (const ch of action.text.toUpperCase()) {
        if (!ALPHABET.includes(ch)) continue;
        next = reducer({ ...next, held: null }, { type: "down", letter: ch });
      }
      return { ...next, held: null };
    }
    case "up":
      return state.held ? { ...state, held: null } : state;
    case "configure": {
      const tapeEmpty = state.input.length === 0;
      return {
        ...state,
        settings: action.settings,
        start: tapeEmpty ? action.settings.positions : state.start,
        last: null,
      };
    }
    case "rewind":
      return {
        ...state,
        settings: { ...state.settings, positions: state.start },
        input: "",
        output: "",
        held: null,
        last: null,
      };
    case "clear":
      return { ...state, start: state.settings.positions, input: "", output: "", held: null, last: null };
  }
}

export function useMachine(initial: Settings = DEFAULT_SETTINGS) {
  const [state, dispatch] = useReducer(reducer, {
    settings: initial,
    start: initial.positions,
    input: "",
    output: "",
    held: null,
    last: null,
  });

  return {
    ...state,
    errors: validate(state.settings),
    keyDown: useCallback((letter: string) => dispatch({ type: "down", letter }), []),
    keyUp: useCallback(() => dispatch({ type: "up" }), []),
    /** Types a whole message at once; anything that isn't a letter is skipped. */
    typeMessage: useCallback((text: string) => dispatch({ type: "message", text }), []),
    configure: useCallback((settings: Settings) => dispatch({ type: "configure", settings }), []),
    /** Turns the rotors back to where the message began and clears the tape. */
    rewind: useCallback(() => dispatch({ type: "rewind" }), []),
    /** Clears the tape and starts a new message from where the rotors stand. */
    clear: useCallback(() => dispatch({ type: "clear" }), []),
  };
}
