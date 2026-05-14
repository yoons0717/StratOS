export type UserType = "creator" | "seller" | "service" | "side";
export type UserLevel = "0-1K" | "1K-10K" | "10K+";
export type BusinessStage =
  | "idea"
  | "first-customers"
  | "consistent-income"
  | "scaling";

export interface UserContext {
  type: UserType;
  level: UserLevel;
  businessStage: BusinessStage;
}

export type ActionCategory =
  | "content"
  | "outreach"
  | "seo"
  | "offer"
  | "community";

export interface ActionStep {
  order: number;
  description: string;
}

export interface GeneratedAction {
  title: string;
  category: ActionCategory;
  steps: ActionStep[];
  magicCopy: string;
}

export interface ActionSession {
  id: string;
  createdAt: number;
  input: string;
  action: GeneratedAction;
  completed: boolean;
}
