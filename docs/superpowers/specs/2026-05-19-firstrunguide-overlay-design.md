# FirstRunGuide Overlay Design

Date: 2026-05-19

## Problem

FirstRunGuide renders inline in the right content panel, leaving the sidebar and header fully interactive. This creates a distracted feel — the user can click around the UI while the onboarding animation is playing.

## Solution

Render FirstRunGuide as a full-screen modal overlay that blocks all interaction behind a dark scrim. Dismissible via ESC or clicking the backdrop.

## Affected Files

- `app/page.tsx` — overlay wrapper, ESC handler, dismiss logic
- `components/dashboard/FirstRunGuide.tsx` — add `onBegin?: () => void` prop

## Design

### Overlay (page.tsx)

When `showFirstRun` is true, render a `fixed inset-0 z-50 bg-black/75` backdrop outside the AppShell layout. The overlay sits above all other UI.

- **Backdrop click** → `handleDismissFirstRun()` (no modal)
- **ESC key** → `handleDismissFirstRun()` (no modal)
- **Center container** has `stopPropagation` so clicking inside the guide doesn't dismiss

ESC listener is added via `useEffect` and is only active while `showFirstRun` is true.

### Dismiss functions

```
handleDismissFirstRun()
  localStorage.setItem(WELCOME_KEY, "1")
  setShowFirstRun(false)
  // modal stays closed

handleOpenModal()  ← unchanged
  localStorage.setItem(WELCOME_KEY, "1")
  setShowFirstRun(false)
  setShowModal(true)
```

### FirstRunGuide changes

Add `onBegin?: () => void` prop. The `[ + NEW ACTION ]` span becomes a clickable button when `onBegin` is provided. No other changes to animation logic or LINES content.

```
<FirstRunGuide onBegin={handleOpenModal} />
```

## Behavior Summary

| Action | Result |
|--------|--------|
| ESC | Dismiss overlay, no modal |
| Click backdrop | Dismiss overlay, no modal |
| Click `[ + NEW ACTION ]` | Dismiss overlay, open modal |
| Click inside guide (not the button) | No-op (stopPropagation) |

## Out of Scope

- No changes to animation timing or LINES content
- No changes to the localStorage key or first-run detection logic
- The sidebar `+ NEW ACTION` button behavior is unchanged (still calls `handleOpenModal`)
