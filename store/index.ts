import { create } from "zustand";
import type { UserContext, ActionSession } from "@/types";

interface StratosStore {
  userContext: UserContext | null;
  sessions: ActionSession[];
  setUserContext: (ctx: UserContext | null) => void;
  setSessions: (sessions: ActionSession[]) => void;
  addSession: (session: ActionSession) => void;
  markCompleted: (id: string) => void;
}

export const useStratosStore = create<StratosStore>()((set) => ({
  userContext: null,
  sessions: [],
  setUserContext: (ctx) => set({ userContext: ctx }),
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),
  markCompleted: (id) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, completed: true } : s
      ),
    })),
}));
