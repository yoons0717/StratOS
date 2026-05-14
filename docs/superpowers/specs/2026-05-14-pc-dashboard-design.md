# StratOS PC Dashboard Redesign

## Overview

모바일 중심 단일 페이지 SPA에서 **PC-first 3패널 대시보드**로 전면 재설계.
전체 레이아웃이 사이드바 고정 + KPI 바 + 콘텐츠 영역 구조로 통일된다.

---

## Screen Layout

```
┌─────────────────────────────────────────────────────┐
│ KPI: TOTAL | ACTIVE | COMPLETED | RATE | STREAK     │
├──────────┬──────────────────┬───────────────────────┤
│ SIDEBAR  │  LIST PANEL      │  DETAIL PANEL         │
│          │                  │                       │
│ STRATOS  │  ACTIONS //      │  [tag] OUTREACH       │
│          │  ┌────────────┐  │  Title                │
│ DASHBOARD│  │ 팔로워 DM  │  │                       │
│ HISTORY  │  └────────────┘  │  STEPS //             │
│ SETTINGS │  ┌────────────┐  │  01 ...               │
│          │  │ 키워드 리서│  │  02 ...               │
│          │  └────────────┘  │                       │
│          │                  │  MAGIC_COPY //         │
│ CREATOR  │  + NEW ACTION    │  ...                  │
│ 0-1K     │                  │                       │
│ IDEA     │                  │  CATEGORY_DIST //      │
│          │                  │  ████ OUTREACH  5      │
│          │                  │  ███  CONTENT   3      │
│          │                  │                       │
│          │                  │  [NEW →] [COMPLETE ✓] │
└──────────┴──────────────────┴───────────────────────┘
```

**비율:** 사이드바 160px 고정 / 목록 패널 220px 고정 / 상세 패널 flex-1

---

## 화면별 구성

### `/` — Dashboard
- KPI 바: TOTAL / ACTIVE / COMPLETED / RATE / STREAK
- 목록 패널: `sessions.filter(!completed)` + `+ NEW ACTION` 버튼
- 상세 패널: 선택된 액션 상세 (steps + magic copy + category chart)
  - 액션 미선택 시: "액션을 선택하거나 새로 만들어봐" 빈 상태
- `+ NEW ACTION` 클릭 → NewActionModal 오버레이
- COMPLETE ✓ → `completeSession(id)`, 목록에서 제거, 상세 패널 빈 상태로

### `/history` — History
- 사이드바 동일
- KPI 바 동일
- 목록 패널: `sessions.filter(completed)` — 완료된 액션만
- 상세 패널: 선택된 완료 액션 상세 (COMPLETE 버튼 없음, 읽기 전용)
- 빈 상태: "완료된 액션 없음"

### `/settings` — Settings
- 사이드바 동일
- KPI 바 없음
- 메인 영역: 기존 설정 폼 (USER_TYPE / AUDIENCE_SIZE / CURRENT_STAGE + SAVE)
- max-width 제한 없이 콘텐츠 영역 전체 활용

### `/onboarding` — Onboarding
- 변경 없음. 사이드바 없는 별도 레이아웃.

---

## 모달: NewActionModal

- 트리거: `+ NEW ACTION` 버튼
- 위치: 화면 중앙 오버레이 (배경 dim)
- 내용: textarea + EXECUTE 버튼
- 닫기: ESC 또는 배경 클릭
- 제출 흐름:
  1. 로딩 상태: 모달 내부에 ANALYZING_INPUT 표시
  2. 성공: 모달 닫힘, 새 액션이 목록에 추가되고 자동 선택 (상세 패널에 표시)
  3. 실패: 모달 내부에 EXECUTION_FAILED + RETRY 버튼

---

## 상태 관리

### Zustand store — 변경 없음
기존 `sessions`, `completeSession`, `addSession`, `userContext` 그대로 사용.

### 로컬 상태 (Dashboard page)
```ts
selectedId: string | null     // 상세 패널에 표시할 세션 id
showModal: boolean            // NewActionModal 표시 여부
modalView: "idle" | "loading" | "error"  // 모달 내부 상태
lastInput: string             // 에러 시 재시도용
```

---

## KPI 계산 (순수 파생값, store 변경 없음)

| 카드 | 계산 |
|------|------|
| TOTAL | `sessions.length` |
| ACTIVE | `sessions.filter(!completed).length` |
| COMPLETED | `sessions.filter(completed).length` |
| RATE | `completed / total * 100` (0이면 0%) |
| STREAK | 오늘 포함 연속으로 액션이 있는 일수 (`session.createdAt` 기준) |

---

## 컴포넌트 구조

```
components/
  layout/
    AppShell.tsx          # 사이드바 + KPI + 콘텐츠 슬롯
    Sidebar.tsx           # 로고, 네비, 유저 컨텍스트
    KpiBar.tsx            # KPI 카드 5개
  dashboard/
    ActionListPanel.tsx   # 목록 패널 (sessions prop)
    ActionDetailPanel.tsx # 상세 패널 (session prop)
    NewActionModal.tsx    # 오버레이 모달
    CategoryChart.tsx     # 카테고리 바 차트
```

---

## 라우트 변경

| 변경 | 내용 |
|------|------|
| `app/action/[id]/` | **삭제** — 상세는 대시보드 패널에서 처리 |
| `components/ui/PageLayout.tsx` | **삭제** — AppShell로 대체 |
| `app/page.tsx` | 전면 재작성 |
| `app/history/page.tsx` | AppShell 적용 + 읽기 전용 상세 패널 |
| `app/settings/page.tsx` | AppShell 적용 |

---

## 스타일

- **반응형 없음** — PC 고정. `min-width: 900px` 이하는 미지원.
- 기존 CSS 토큰 (`--neon`, `--background`, `--surface`) 유지.
- 기존 `font-mono`, `text-neon`, `bg-surface` 클래스 그대로 사용.
- `tailwind` 기반 유지, `inline style` 금지 규칙 유지.

---

## 검증

```bash
npx vitest run
npm run typecheck
npm run lint
npm run build
```

- 대시보드에서 `+ NEW ACTION` → 모달 → EXECUTE → 목록 자동 선택 확인
- COMPLETE 후 목록에서 사라지고 HISTORY에 표시 확인
- 새로고침 후 액션 목록 유지 (Zustand persist) 확인
- `/onboarding` 없이 `/` 접근 시 리다이렉트 확인
