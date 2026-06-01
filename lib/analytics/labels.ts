import type { Channel, ActionCategory } from "@/types";

export const CHANNEL_LABEL: Record<Channel, string> = {
  instagram: "Instagram",
  "naver-blog": "Naver Blog",
  youtube: "YouTube",
  general: "General",
};

export const CATEGORY_LABEL: Record<ActionCategory, string> = {
  content: "Content",
  outreach: "Outreach",
  seo: "SEO",
  offer: "Offer",
  community: "Community",
};
