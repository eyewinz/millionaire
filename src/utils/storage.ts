import type { GameState } from "../types";

/**
 * Persistent game-state storage.
 *
 * This is a browser app, so there's no real OS file to write to. Instead we use
 * localStorage as the "state file": it survives page refreshes (and even fully
 * closing/reopening the browser) and is only wiped when it is cleared
 * explicitly via `clearGameState()` (or by clearing site data in the browser).
 */

const STORAGE_KEY = "millionaire-game-state";

/** Load the saved game state, or null if there is none / it can't be parsed. */
export function loadGameState(): GameState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    // Corrupt or inaccessible storage — fall back to a fresh game.
    return null;
  }
}

/** Persist the current game state to storage. */
export function saveGameState(state: GameState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — ignore, the game still runs in memory.
  }
}

/** Manually clear the saved game state ("delete the state file"). */
export function clearGameState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing we can do if storage is unavailable.
  }
}
