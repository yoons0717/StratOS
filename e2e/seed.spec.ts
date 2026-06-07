import { test } from "@playwright/test";

const SCENARIOS = [
  { input: "인스타그램 팔로워 늘리기", channel: "instagram" },
  { input: "유튜브 구독자 확보 전략", channel: "youtube" },
  { input: "네이버 블로그 트래픽 올리기", channel: "naver-blog" },
  { input: "첫 번째 유료 고객 유치", channel: "general" },
  { input: "제품 런칭 준비 액션", channel: "general" },
];

// 완료 처리할 시나리오 인덱스 (전체의 60%)
const COMPLETE_INDICES = new Set([0, 2, 4]);

test("seed: create and complete sessions", async ({ request }) => {
  const ctxRes = await request.get("/api/user-context");
  const userContext = await ctxRes.json();

  if (!userContext) {
    throw new Error(
      "User context not found. Run onboarding spec first: npx playwright test e2e/onboarding.spec.ts"
    );
  }

  for (const [i, scenario] of SCENARIOS.entries()) {
    const res = await request.post("/api/sessions", {
      data: {
        input: scenario.input,
        channel: scenario.channel,
        userContext,
      },
    });

    if (!res.ok()) {
      console.error(
        `[seed] Failed to create session for "${scenario.input}": ${res.status()}`
      );
      continue;
    }

    const session = await res.json();
    console.log(`[seed] Created session ${session.id}: "${scenario.input}"`);

    if (COMPLETE_INDICES.has(i)) {
      const completeRes = await request.patch(
        `/api/sessions/${session.id}/complete`
      );
      if (completeRes.ok()) {
        console.log(`[seed] Completed session ${session.id}`);
      }
    }
  }
});
