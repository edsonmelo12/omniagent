import { create } from "zustand";
import type { SquadInfo, SquadState } from "@/types/state";

const SELECTED_SQUAD_STORAGE_KEY = "omniagent.selected-squad";

function readSelectedSquadFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(SELECTED_SQUAD_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

function writeSelectedSquadToStorage(selectedSquad: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (selectedSquad) {
      window.localStorage.setItem(SELECTED_SQUAD_STORAGE_KEY, selectedSquad);
    } else {
      window.localStorage.removeItem(SELECTED_SQUAD_STORAGE_KEY);
    }
  } catch {
    return;
  }
}

interface SquadStore {
  // State
  squads: Map<string, SquadInfo>;
  activeStates: Map<string, SquadState>;
  selectedSquad: string | null;
  isConnected: boolean;

  // Actions
  selectSquad: (name: string | null) => void;
  setConnected: (connected: boolean) => void;
  setSnapshot: (squads: SquadInfo[], activeStates: Record<string, SquadState>) => void;
  setSquadActive: (squad: string, state: SquadState) => void;
  updateSquadState: (squad: string, state: SquadState) => void;
  setSquadInactive: (squad: string) => void;
}

export const useSquadStore = create<SquadStore>((set) => ({
  squads: new Map(),
  activeStates: new Map(),
  selectedSquad: readSelectedSquadFromStorage(),
  isConnected: false,

  selectSquad: (name) => {
    writeSelectedSquadToStorage(name);
    set({ selectedSquad: name });
  },

  setConnected: (connected) => set({ isConnected: connected }),

  setSnapshot: (squads, activeStates) =>
    set({
      squads: new Map(squads.map((s) => [s.code, s])),
      activeStates: new Map(Object.entries(activeStates)),
    }),

  setSquadActive: (squad, state) =>
    set((prev) => ({
      activeStates: new Map(prev.activeStates).set(squad, state),
    })),

  updateSquadState: (squad, state) =>
    set((prev) => ({
      activeStates: new Map(prev.activeStates).set(squad, state),
    })),

  setSquadInactive: (squad) =>
    set((prev) => {
      const next = new Map(prev.activeStates);
      next.delete(squad);
      const nextSelectedSquad = prev.selectedSquad === squad ? null : prev.selectedSquad;
      if (prev.selectedSquad === squad) {
        writeSelectedSquadToStorage(null);
      }
      return {
        activeStates: next,
        // Reset selection if the inactive squad was selected
        selectedSquad: nextSelectedSquad,
      };
    }),
}));
