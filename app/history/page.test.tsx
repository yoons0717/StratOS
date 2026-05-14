import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import HistoryPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockSessions = [
  {
    id: "1",
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    input: "인스타 반응 없음",
    action: {
      title: "팔로워 DM 보내기",
      category: "outreach" as const,
      steps: [{ order: 1, description: "DM 발송" }],
      magicCopy: "안녕하세요!",
    },
    completed: true,
  },
  {
    id: "2",
    createdAt: Date.now() - 1000 * 60 * 30,
    input: "블로그 글 아이디어 없음",
    action: {
      title: "키워드 리서치 하기",
      category: "content" as const,
      steps: [{ order: 1, description: "검색" }],
      magicCopy: "블로그 글",
    },
    completed: false,
  },
];

beforeEach(() => {
  useStratosStore.setState({
    userContext: { type: "creator", level: "0-1K", businessStage: "idea" },
    sessions: [],
  });
});

describe("HistoryPage", () => {
  it("redirects to /onboarding when userContext is null", () => {
    const pushMock = vi.fn();
    vi.mocked(vi.fn()).mockReturnValue({ push: pushMock });
    useStratosStore.setState({ userContext: null, sessions: [] });
    render(<HistoryPage />);
  });

  it("shows empty state when there are no sessions", () => {
    render(<HistoryPage />);
    expect(screen.getByText(/NO_HISTORY/i)).toBeInTheDocument();
  });

  it("renders session titles", () => {
    useStratosStore.setState({
      userContext: { type: "creator", level: "0-1K", businessStage: "idea" },
      sessions: mockSessions,
    });
    render(<HistoryPage />);
    expect(screen.getByText("팔로워 DM 보내기")).toBeInTheDocument();
    expect(screen.getByText("키워드 리서치 하기")).toBeInTheDocument();
  });

  it("shows completed badge on completed sessions", () => {
    useStratosStore.setState({
      userContext: { type: "creator", level: "0-1K", businessStage: "idea" },
      sessions: mockSessions,
    });
    render(<HistoryPage />);
    expect(screen.getByText("DONE")).toBeInTheDocument();
  });

  it("has a link back to main page", () => {
    render(<HistoryPage />);
    expect(screen.getByRole("link", { name: /BACK/i })).toHaveAttribute("href", "/");
  });
});
