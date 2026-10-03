import { ALPHABET, DEFAULT_SETTINGS, press, validate, type Keypress, type Settings } from "./enigma";
import { LESSONS } from "./lessons";

/**
 * The machine as the page holds it: settings, the tape, the key held down, and
 * what the lessons need to know about the session. Kept apart from React so it
 * can be driven key by key in tests.
 */
export type State = {
  settings: Settings;
  /** Where the rotors stood before the first letter on the tape, for rewinding. */
  start: Settings["positions"];
  input: string;
  output: string;
  /** The key being held down; its lamp stays lit until it comes up. */
  held: Keypress | null;
  /** The most recent key press, kept after release so its path can be studied. */
  last: Keypress | null;
  /** The message on the tape before the last rewind, so reading it back can be recognised. */
  previous: { input: string; output: string } | null;
  /** Double steps since the tape was last cleared: the left rotor only moves on one. */
  doubleSteps: number;
  /** Whether the message has been sent in Morse, or shared, for the lessons. */
  transmitted: boolean;
  shared: boolean;
  /** Lessons finished, in the order they were. */
  completed: string[];
  /** The lesson most recently finished on this visit, so its panel can stay open to say what it showed. */
  justCompleted: string | null;
};

export type Action =
  | { type: "down"; letter: string }
  | { type: "up" }
  | { type: "message"; text: string }
  | { type: "configure"; settings: Settings }
  | { type: "rewind" }
  | { type: "clear" }
  | { type: "transmitted" }
  | { type: "shared" }
  | { type: "restore"; completed: string[] }
  /** A fresh machine on the default settings, lessons kept unless `lessons` says to forget them too. */
  | { type: "reset"; lessons: boolean };

function act(state: State, action: Action): State {
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
        doubleSteps: state.doubleSteps + (result.positions[0] !== result.before[0] ? 1 : 0),
      };
    }
    case "message": {
      let next: State = { ...state, held: null };
      for (const ch of action.text.toUpperCase()) {
        if (!ALPHABET.includes(ch)) continue;
        next = act({ ...next, held: null }, { type: "down", letter: ch });
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
        previous: state.input ? { input: state.input, output: state.output } : state.previous,
        doubleSteps: 0,
      };
    case "clear":
      return { ...state, start: state.settings.positions, input: "", output: "", held: null, last: null, previous: null, doubleSteps: 0 };
    case "transmitted":
      return { ...state, transmitted: true };
    case "shared":
      return { ...state, shared: true };
    case "reset":
      return action.lessons ? initialState(DEFAULT_SETTINGS) : { ...initialState(DEFAULT_SETTINGS), completed: state.completed };
    case "restore": {
      const known = action.completed.filter((id) => LESSONS.some((l) => l.id === id) && !state.completed.includes(id));
      return known.length ? { ...state, completed: [...known, ...state.completed] } : state;
    }
  }
}

/** Acts, then marks any lesson the new state satisfies; a finished lesson stays finished. */
export function reducer(state: State, action: Action): State {
  const next = act(state, action);
  const newly = LESSONS.filter((l) => !next.completed.includes(l.id) && l.done(next)).map((l) => l.id);
  return newly.length ? { ...next, completed: [...next.completed, ...newly], justCompleted: newly.at(-1)! } : next;
}


export function initialState(settings: Settings): State {
  return {
    settings,
    start: settings.positions,
    input: "",
    output: "",
    held: null,
    last: null,
    previous: null,
    doubleSteps: 0,
    transmitted: false,
    shared: false,
    completed: [],
    justCompleted: null,
  };
}
