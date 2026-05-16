import { describe, it, expect } from "vitest";
import { buildUserPrompt } from "./prompts";

describe("buildUserPrompt", () => {
  it("includes niche in the prompt output", () => {
    const result = buildUserPrompt("need more clients", "creator", "피트니스 코치", "0-1K", "idea");
    expect(result).toContain("피트니스 코치");
  });

  it("includes all other context fields", () => {
    const result = buildUserPrompt("test", "seller", "SaaS", "1K-10K", "scaling");
    expect(result).toContain("seller");
    expect(result).toContain("SaaS");
    expect(result).toContain("1K-10K");
    expect(result).toContain("Scaling");
  });
});
