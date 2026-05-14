import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserContext, ActionSession } from "@/types";

interface StratosStore {
  userContext: UserContext | null;
  sessions: ActionSession[];
  setUserContext: (ctx: UserContext) => void;
  addSession: (session: ActionSession) => void;
  completeSession: (id: string) => void;
}

export const useStratosStore = create<StratosStore>()(
  persist(
    (set) => ({
      userContext: null,
      sessions: [],
      setUserContext: (ctx) => set({ userContext: ctx }),
      addSession: (session) =>
        set((state) => ({ sessions: [session, ...state.sessions] })),
      completeSession: (id) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, completed: true } : s
          ),
        })),
    }),
    { name: "stratos-store" }
  )
);
