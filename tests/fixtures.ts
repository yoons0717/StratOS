import type { UserContext, ActionSession } from "@/types";

export const defaultCtx: UserContext = {
  type: "creator",
  level: "0-1K",
  businessStage: "idea",
  niche: "피트니스 코치",
};

export function makeSession(overrides: Partial<ActionSession> = {}): ActionSession {
  const { action: actionOverrides, ...rest } = overrides;
  return {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    input: "test",
    channel: "general",
    action: {
      title: "Test Action",
      category: "outreach",
      steps: [{ order: 1, description: "step" }],
      magicCopy: "copy",
      ...actionOverrides,
    },
    completed: false,
    ...rest,
  };
}
