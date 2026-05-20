export type UserType = "creator" | "seller" | "service" | "side";
export type UserLevel = "0-1K" | "1K-10K" | "10K+";
export type BusinessStage =
  | "idea"
  | "first-customers"
  | "consistent-income"
  | "scaling";
export type Channel = "instagram-dm" | "linkedin" | "naver-blog" | "youtube" | "general";

export interface UserContext {
  type: UserType;
  level: UserLevel;
  businessStage: BusinessStage;
  niche: string;
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
  created_at: string;
  completed_at: string | null;
  input: string;
  channel: Channel;
  action: GeneratedAction;
  completed: boolean;
}
