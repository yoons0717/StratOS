import { describe, it, expect } from "vitest";
import { buildUserPrompt } from "./prompts";

describe("buildUserPrompt", () => {
  it("includes niche in the prompt output", () => {
    const result = buildUserPrompt("need more clients", "creator", "피트니스 코치", "0-1K", "idea", "general");
    expect(result).toContain("피트니스 코치");
  });

  it("includes all other context fields", () => {
    const result = buildUserPrompt("test", "seller", "SaaS", "1K-10K", "scaling", "general");
    expect(result).toContain("seller");
    expect(result).toContain("SaaS");
    expect(result).toContain("1K-10K");
    expect(result).toContain("Scaling");
  });

  it("includes channel line for non-general channels", () => {
    const result = buildUserPrompt("test", "creator", "피트니스", "0-1K", "idea", "instagram");
    expect(result).toContain("Channel:");
    expect(result).toContain("instagram");
  });

  it("omits channel line for general channel", () => {
    const result = buildUserPrompt("test", "creator", "피트니스", "0-1K", "idea", "general");
    expect(result).not.toContain("Channel:");
  });
});
