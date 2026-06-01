import type { Channel, ActionCategory } from "@/types";

export const CHANNEL_LABEL: Record<Channel, string> = {
  instagram: "인스타그램",
  "naver-blog": "네이버 블로그",
  youtube: "유튜브",
  general: "일반",
};

export const CATEGORY_LABEL: Record<ActionCategory, string> = {
  content: "콘텐츠",
  outreach: "아웃리치",
  seo: "SEO",
  offer: "오퍼",
  community: "커뮤니티",
};
