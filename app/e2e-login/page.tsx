import { notFound } from "next/navigation";
import E2ELoginClient from "./E2ELoginClient";

export default function E2ELoginPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <E2ELoginClient
      email={process.env.E2E_TEST_EMAIL ?? ""}
      password={process.env.E2E_TEST_PASSWORD ?? ""}
    />
  );
}
