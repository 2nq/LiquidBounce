# Title Menu Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fast, centered title menu with Rise-style surfaces, compact account/header presentation, and a polished utility bar over selectable Minecraft and abstract backgrounds.

**Architecture:** Keep the existing REST actions and menu router intact. Replace timer-driven title state with a tiny pure state helper, limit new presentation to the `/title` route through explicit component variants, and define reusable title-surface tokens in `colors.scss`.

**Tech Stack:** Svelte 5 legacy components, TypeScript, SCSS/CSS, Vitest, Gradle/Fabric Loom, Java 25.

---

### Task 1: Immediate title navigation state

**Files:**
- Create: `src-theme/src/routes/menu/title/title_menu_state.ts`
- Create: `src-theme/src/routes/menu/title/title_menu_state.test.ts`
- Modify: `src-theme/src/routes/menu/title/Title.svelte`

- [ ] **Step 1: Write the failing state tests**

```ts
import {describe, expect, it} from "vitest";
import {nextTitleMenuState} from "./title_menu_state";

describe("title menu state", () => {
    it("opens client actions immediately", () => {
        expect(nextTitleMenuState("regular", "open-client")).toBe("client");
    });
    it("returns to regular actions immediately", () => {
        expect(nextTitleMenuState("client", "back")).toBe("regular");
    });
});
```

- [ ] **Step 2: Run the focused test and verify the missing module failure**

Run: `npm run test:unit -- title_menu_state.test.ts`
Expected: FAIL because `title_menu_state.ts` does not exist.

- [ ] **Step 3: Add the pure state helper**

```ts
export type TitleMenuState = "regular" | "client";
export type TitleMenuAction = "open-client" | "back";

export function nextTitleMenuState(_: TitleMenuState, action: TitleMenuAction): TitleMenuState {
    return action === "open-client" ? "client" : "regular";
}
```

- [ ] **Step 4: Replace both booleans and 750 ms timers in `Title.svelte`**

Use one `menuState: TitleMenuState = "regular"`, call `nextTitleMenuState` directly, and render a keyed action group with a 160 ms fade/fly transition. There must be no interval in which neither action group exists.

- [ ] **Step 5: Run focused and full frontend tests**

Run: `npm run test:unit -- title_menu_state.test.ts && npm run test:unit`
Expected: focused tests and complete suite pass.

- [ ] **Step 6: Commit**

```powershell
git add src-theme/src/routes/menu/title/title_menu_state.ts src-theme/src/routes/menu/title/title_menu_state.test.ts src-theme/src/routes/menu/title/Title.svelte
git commit -m "refactor(menu): make title navigation immediate"
```

### Task 2: Centered hybrid composition and action surfaces

**Files:**
- Modify: `src-theme/src/routes/menu/title/Title.svelte`
- Modify: `src-theme/src/routes/menu/title/buttons/MainButton.svelte`
- Modify: `src-theme/src/routes/menu/title/buttons/ChildButton.svelte`
- Modify: `src-theme/src/routes/menu/title/buttons/TitleButtonIcon.svelte`

- [ ] **Step 1: Convert the title layout to the approved centered stack**

Create a `.title-shell` with a centered `.command-panel`, eyebrow/title copy, one-column action stack, and a compact utility row. Keep all existing `openScreen`, `browse`, `exitClient`, and background-toggle calls.

- [ ] **Step 2: Convert `MainButton` into a semantic button**

The root must be `<button type="button">`, retain the slot for Realms, use a compact leading icon tile and trailing arrow, and dispatch one click without duplicate handlers. Style it with a subtle top/left border, layered shadow, 150 ms transform/background transition, and visible `:focus-visible` outline.

- [ ] **Step 3: Restyle Realms as an independent secondary action**

Use a semantic button, stop propagation, and position it inside the Multiplayer row without making the primary stack wider. It receives the same focus and pressed feedback as primary actions.

- [ ] **Step 4: Add reduced-motion and responsive rules**

At narrow or short viewports, reduce panel padding and action height while preserving a minimum 44 px target. Under `prefers-reduced-motion: reduce`, disable transforms and reduce durations to 1 ms.

- [ ] **Step 5: Verify frontend diagnostics**

Run: `npm run check && npm run build`
Expected: zero Svelte errors/warnings and successful Vite production build.

- [ ] **Step 6: Commit**

```powershell
git add src-theme/src/routes/menu/title
git commit -m "feat(menu): add centered Rise title composition"
```

### Task 3: Compact title header and account surface

**Files:**
- Modify: `src-theme/src/routes/menu/common/Menu.svelte`
- Modify: `src-theme/src/routes/menu/common/header/Header.svelte`
- Modify: `src-theme/src/routes/menu/common/header/account/Account.svelte`

- [ ] **Step 1: Remove delayed menu readiness**

Delete the 700 ms `ready` timer from `Menu.svelte`. Render `Header` immediately and use a short CSS/Svelte entrance capped at 180 ms. Keep existing non-title menu layout behavior.

- [ ] **Step 2: Add title-specific header presentation**

Use the existing `$location === "/title"` knowledge to apply a `title` class. On title only, render the compact LB identity treatment and position account/notifications cleanly above the content. Other menu routes retain the full logo proportions.

- [ ] **Step 3: Add title-specific account presentation**

Apply `class:title={inTitle}` to the account root. The title variant uses a compact avatar, username/service typography, rounded borders, and layered shadow. Keep random username, account-manager navigation, quick switcher, and anniversary hat functionality unchanged.

- [ ] **Step 4: Make the account popup fit the compact anchor**

The quick switcher retains usable search and scrolling, opens below the chip, has a minimum readable width, and uses the same surface/border language without changing account data flow.

- [ ] **Step 5: Verify frontend diagnostics and account build paths**

Run: `npm run check && npm run test:unit && npm run build`
Expected: diagnostics clean, all tests pass, production bundle succeeds.

- [ ] **Step 6: Commit**

```powershell
git add src-theme/src/routes/menu/common/Menu.svelte src-theme/src/routes/menu/common/header/Header.svelte src-theme/src/routes/menu/common/header/account/Account.svelte
git commit -m "style(menu): compact title header and account"
```

### Task 4: Unified utility bar and theme depth

**Files:**
- Modify: `src-theme/src/routes/menu/title/Title.svelte`
- Modify: `src-theme/src/routes/menu/common/buttons/ButtonContainer.svelte`
- Modify: `src-theme/src/routes/menu/common/buttons/IconButton.svelte`
- Modify: `src-theme/src/routes/menu/common/buttons/IconTextButton.svelte`
- Modify: `src-theme/src/colors.scss`

- [ ] **Step 1: Add explicit compact variants to shared bottom controls**

Add `compact = false` props to the three shared components and `class:compact`. In compact mode use 36–40 px controls, 10–12 px labels, rounded 9–11 px surfaces, subtle borders, and quick hover/focus feedback. Existing callers retain current visuals.

- [ ] **Step 2: Compose one centered title utility bar**

Pass `compact` from `Title.svelte`, combine Exit, Toggle Background, social links, website, and version into one visually balanced bottom region. Preserve tooltips and every existing REST action.

- [ ] **Step 3: Add scoped title tokens**

Add variables for title overlay, panel background, elevated surface, border, highlight, shadow, and muted text in `colors.scss`. Values derive from `--surface-color`, `--text-color`, and `--accent-color` so custom theme colors continue to work.

- [ ] **Step 4: Add background readability layer**

Apply one title-only dark translucent overlay with a restrained backdrop blur and a non-blur fallback. Keep `toggleBackgroundShaderEnabled` as the single source of truth for switching current and abstract backgrounds.

- [ ] **Step 5: Verify responsive and reduced-motion CSS statically**

Run: `rg -n "prefers-reduced-motion|backdrop-filter|title-overlay|compact" src-theme/src/routes/menu src-theme/src/colors.scss`
Expected: title-specific selectors, fallback background, compact variants, and reduced-motion override are present.

- [ ] **Step 6: Commit**

```powershell
git add src-theme/src/routes/menu/title/Title.svelte src-theme/src/routes/menu/common/buttons src-theme/src/colors.scss
git commit -m "style(menu): unify title utilities and surface depth"
```

### Task 5: Integrated verification and launcher test build

**Files:**
- Modify: `docs/superpowers/plans/2026-09-05-title-menu-rework.md`

- [ ] **Step 1: Run fresh frontend verification**

Run: `npm run check && npm run test:unit && npm run build` from `src-theme`.
Expected: zero diagnostics, all tests pass, production build succeeds.

- [ ] **Step 2: Run the complete project build**

Run with Java 25: `./gradlew.bat build`.
Expected: `BUILD SUCCESSFUL` and a new `build/libs/liquidbounce-0.40.1.jar`.

- [ ] **Step 3: Launch the development client**

Run with Java 25: `./gradlew.bat runClient`.
Verify the title screen appears immediately, actions are centered, both action sets switch without a blank delay, the account popup works, background toggles, and resizing does not clip controls.

- [ ] **Step 4: Record verification results in this plan**

Check completed steps and append exact automated results plus any remaining manual visual checks.

- [ ] **Step 5: Commit verification record**

```powershell
git add docs/superpowers/plans/2026-09-05-title-menu-rework.md
git commit -m "docs(menu): record title rework verification"
```

## Verification record

- 2026-09-05: `npm run check` completed with 0 errors and 0 warnings.
- 2026-09-05: `npm run test:unit` completed with 6 files and 22 tests passing.
- 2026-09-05: `npm run build` completed successfully with 404 modules transformed.
- 2026-09-05: `./gradlew.bat build` completed successfully with all 18 tasks executed or up-to-date.
- 2026-09-05: `./gradlew.bat runClient` reached LiquidBounce browser initialization, loaded the bundled UI with HTTP 200, and displayed the title screen.
- Pending user visual review: layout balance, account popup interaction, Realms, background toggle, small-window behavior, and subjective animation feel.
