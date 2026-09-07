# ClickGUI Navigation UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the Rise ClickGUI module-list position across settings navigation and start module search from direct typing.

**Architecture:** Add small, DOM-light interaction helpers for keyboard eligibility and scroll memory, then wire them into the existing `RiseClickGui.svelte` owner of navigation and search state. The component keeps the existing category/query state and restores the saved scroll after Svelte renders the list.

**Tech Stack:** TypeScript, Svelte 5 compatibility syntax, Vitest.

---

### Task 1: Test interaction primitives

**Files:**
- Create: `src-theme/src/routes/clickgui/rise/rise_interactions.test.ts`
- Create: `src-theme/src/routes/clickgui/rise/rise_interactions.ts`

- [x] **Step 1: Write the failing tests**

```ts
import {describe, expect, it} from "vitest";
import {createScrollMemory, shouldStartSearch} from "./rise_interactions";

describe("shouldStartSearch", () => {
    it("accepts an unmodified printable character", () => {
        expect(shouldStartSearch({key: "v", ctrlKey: false, altKey: false, metaKey: false}, null)).toBe(true);
    });

    it("rejects shortcuts and editable targets", () => {
        expect(shouldStartSearch({key: "v", ctrlKey: true, altKey: false, metaKey: false}, null)).toBe(false);
        expect(shouldStartSearch({key: "v", ctrlKey: false, altKey: false, metaKey: false}, {tagName: "INPUT"})).toBe(false);
        expect(shouldStartSearch({key: "Enter", ctrlKey: false, altKey: false, metaKey: false}, null)).toBe(false);
    });
});

describe("createScrollMemory", () => {
    it("restores the captured list position", () => {
        const memory = createScrollMemory();
        const scroller = {scrollTop: 284};
        memory.capture(scroller);
        scroller.scrollTop = 0;
        memory.restore(scroller);
        expect(scroller.scrollTop).toBe(284);
    });
});
```

- [x] **Step 2: Run the focused test and verify RED**

Run: `npm run test:unit -- rise_interactions.test.ts`

Expected: FAIL because `./rise_interactions` does not exist.

- [x] **Step 3: Implement the minimal helpers**

```ts
type KeyLike = Pick<KeyboardEvent, "key" | "ctrlKey" | "altKey" | "metaKey">;
type EditableLike = {tagName?: string; isContentEditable?: boolean};
type ScrollContainer = {scrollTop: number};

export function shouldStartSearch(event: KeyLike, target: EditableLike | null): boolean {
    const tagName = target?.tagName?.toUpperCase();
    const editable = target?.isContentEditable || tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
    return event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey && !editable;
}

export function createScrollMemory() {
    let saved = 0;
    return {
        capture(container: ScrollContainer | null) {
            if (container) saved = container.scrollTop;
        },
        restore(container: ScrollContainer | null) {
            if (container) container.scrollTop = saved;
        },
    };
}
```

- [x] **Step 4: Run the focused test and verify GREEN**

Run: `npm run test:unit -- rise_interactions.test.ts`

Expected: PASS.

### Task 2: Wire navigation and type-to-search into the ClickGUI

**Files:**
- Modify: `src-theme/src/routes/clickgui/rise/RiseClickGui.svelte`

- [x] **Step 1: Add the interaction state and handlers**

Import `tick`, `createScrollMemory`, and `shouldStartSearch`. Bind the search input and `.content` container. Route both module-settings entry points through `openModuleSettings`, and route the back arrow through `returnToModules`:

```ts
const listScroll = createScrollMemory();
let searchInput: HTMLInputElement;
let contentElement: HTMLDivElement;

function openModuleSettings(name: string) {
    listScroll.capture(contentElement);
    selected = name;
}

async function returnToModules() {
    selected = "";
    await tick();
    listScroll.restore(contentElement);
}

async function handleWindowKeyDown(event: KeyboardEvent) {
    if (hud || client || current || !shouldStartSearch(event, event.target as HTMLElement | null)) return;
    event.preventDefault();
    query += event.key;
    await tick();
    searchInput?.focus();
}
```

- [x] **Step 2: Bind the elements and events**

Add a window key handler, `bind:this={searchInput}` to the search input, `bind:this={contentElement}` to `.content`, and replace direct `selected` assignments used for entering/leaving settings with the navigation handlers.

- [x] **Step 3: Run frontend verification**

Run: `npm run test:unit`

Expected: 7 test files pass with 43 tests.

Run: `npm run check`

Expected: Svelte check completes with 0 errors.

- [x] **Step 4: Build the frontend**

Run: `npm run build`

Expected: Vite production build succeeds.

- [x] **Step 5: Commit the feature**

```powershell
git add -- src-theme/src/routes/clickgui/rise/rise_interactions.ts src-theme/src/routes/clickgui/rise/rise_interactions.test.ts src-theme/src/routes/clickgui/rise/RiseClickGui.svelte docs/superpowers/plans/2026-09-07-clickgui-navigation-ux.md
git commit -m "feat(clickgui): preserve list navigation context"
```
