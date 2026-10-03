"use client";

import { useCallback, useReducer } from "react";
import { DEFAULT_SETTINGS, validate, type Settings } from "@/lib/enigma";
import { initialState, reducer } from "@/lib/machine-state";

export function useMachine(initial: Settings = DEFAULT_SETTINGS) {
  const [state, dispatch] = useReducer(reducer, initial, initialState);

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
    markTransmitted: useCallback(() => dispatch({ type: "transmitted" }), []),
    markShared: useCallback(() => dispatch({ type: "shared" }), []),
    /** Back to a fresh machine on the default settings; with `lessons`, signals school starts over too. */
    reset: useCallback((lessons: boolean) => dispatch({ type: "reset", lessons }), []),
    /** Brings back lessons finished on an earlier visit. */
    restoreLessons: useCallback((completed: string[]) => dispatch({ type: "restore", completed }), []),
  };
}
