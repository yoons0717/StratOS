# Dashboard Dynamic Layout Design

## Problem

When no action is selected, the right panel is empty black space — visually awkward and wastes screen real estate.

## Solution

Single-column list always. No grid switching. When no action is selected, the list expands to fill the full width and shows a channel label above each item title. When an action is selected, the list shrinks back to fixed width and the detail panel slides in. The width transition is animated with `transition-all duration-200`.

## States

| State | Condition | List panel | Right panel |
|-------|-----------|------------|-------------|
| Expanded | `selectedId === null && !showFeedback` | `flex-1` | not rendered |
| Split | `selectedId !== null \|\| showFeedback` | `w-72 shrink-0` | detail or feedback |

## Component Changes

### `ActionListPanel.tsx`
- Remove `w-72 shrink-0 border-r border-zinc-800` from outer div (moved to callers)
- Add `expanded?: boolean` prop (default `false`)
- When `expanded`: each item shows channel label (small mono text above title) + `transition-all` on items
- When not expanded: just title, same as current

### `app/page.tsx`
- Add `showPanel = selectedId !== null || showFeedback`
- Wrapper div: `transition-all duration-200` + `showPanel ? "w-72 shrink-0 border-r border-zinc-800" : "flex-1"`
- Pass `expanded={!showPanel}` to ActionListPanel
- Render right panel only when `showPanel` is true

### `app/history/page.tsx`
- Wrap `<ActionListPanel>` in `<div className="flex w-72 shrink-0 flex-col border-r border-zinc-800">` to restore removed sizing

## Out of Scope

- Animation on the detail panel (just appears/disappears)
- Any changes to history or stats pages beyond the wrapper fix
- Grid layout (explicitly rejected)
