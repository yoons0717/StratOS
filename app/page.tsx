import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardPage from "@/app/_dashboard/DashboardPage";
import LandingPage from "@/app/_landing/LandingPage";

export const metadata: Metadata = {
  keywords: ["솔로 크리에이터", "AI 실행 도구", "콘텐츠 크리에이터", "1인 창작자", "StratOS"],
  alternates: {
    canonical: "https://stratos-os.vercel.app",
  },
};

export default async function RootPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <LandingPage />;
  return <DashboardPage />;
}
