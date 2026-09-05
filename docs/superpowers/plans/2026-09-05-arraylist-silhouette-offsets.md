# ArrayList Silhouette and Offsets Implementation Plan

> **For Codex:** Follow the test-driven steps below and verify the complete client with Java 25 before integration.

**Goal:** Finish the connected rounded ArrayList silhouette and add independent pixel offsets without changing the crisp final-size text renderer.

**Architecture:** Keep geometry scaling and text measurement unchanged. Normalize the two new user settings in the layout helper, expose them as CSS custom properties, and apply them through margins/top padding. Shape each width-sorted row with mirrored CSS selectors so exposed steps are rounded while the shared screen edge stays continuous.

**Tech Stack:** Svelte 5, TypeScript, SCSS, Vitest, Gradle/JDK 25.

### Task 1: Add configurable offsets

**Files:**
- Modify: `src-theme/src/routes/hud/elements/arraylist_layout.test.ts`
- Modify: `src-theme/src/routes/hud/elements/arraylist_layout.ts`
- Modify: `src-theme/src/routes/hud/elements/ArrayList.svelte`
- Modify: `src-theme/public/components/arraylist.json`

1. Add failing tests proving offsets default to zero, round fractional input, and clamp to `0..100`.
2. Run the focused Vitest file and confirm the new tests fail.
3. Add `resolveArrayListOffset`, the two settings/defaults, CSS variables, top padding, and alignment-aware horizontal margins.
4. Add `HorizontalOffset` and `VerticalOffset` integer controls with a `px` suffix.
5. Run focused tests and Svelte diagnostics, then commit.

### Task 2: Complete the connected stepped silhouette

**Files:**
- Modify: `src-theme/src/routes/hud/elements/arraylist_layout.test.ts`
- Modify: `src-theme/src/routes/hud/elements/ArrayList.svelte`

1. Update source-invariant tests for rounded exposed corners, mirrored alignment, seamless `gap: 0`, and absence of overlap/outlines/horizontal borders.
2. Run the focused tests and confirm they fail against the old outside-corners-only styling.
3. Give every row rounded corners on its exposed width-step side, while rounding the common edge only at the first and last rows.
4. Run focused tests and Svelte diagnostics, then commit.

### Task 3: Verify and integrate

1. Run the entire theme unit-test suite.
2. Run `npm run check` and `npm run build` in `src-theme`.
3. Run the full Gradle build using `C:\Program Files\Java\jdk-25.0.4`.
4. Inspect the final diff and repository status.
5. Push the feature branch, merge it into `nextgen`, push `nextgen`, and report the exact commits and generated JAR.
