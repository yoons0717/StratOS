import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardPage from "@/app/_dashboard/DashboardPage";
import LandingPage from "@/app/_landing/LandingPage";

export default async function RootPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <LandingPage />;
  return <DashboardPage />;
}
