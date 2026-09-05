# Crisp ArrayList Scaling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the ArrayList sharply at every continuous scale, remove interior outlines, and round only the outer background corners.

**Architecture:** Replace element-level CSS `zoom` with a pure TypeScript geometry resolver that returns final pixel dimensions for typography and decoration. `ArrayList.svelte` will measure text with the scaled font and pass the resolved dimensions through CSS custom properties, leaving temporary Svelte animation transforms as the only transformed render path.

**Tech Stack:** Svelte 5, TypeScript, SCSS, Vitest, Gradle/Fabric.

---

## File structure

- Modify `src-theme/src/routes/hud/elements/arraylist_layout.ts`: own scale clamping and conversion from scale to final ArrayList geometry.
- Modify `src-theme/src/routes/hud/elements/arraylist_layout.test.ts`: verify geometry, sharp-rendering invariants, and outer-corner source rules.
- Modify `src-theme/src/routes/hud/elements/ArrayList.svelte`: consume final geometry for measurement and rendering; remove CSS zoom and permanent layer hints.

### Task 1: Resolve final render geometry

**Files:**
- Modify: `src-theme/src/routes/hud/elements/arraylist_layout.ts`
- Test: `src-theme/src/routes/hud/elements/arraylist_layout.test.ts`

- [ ] **Step 1: Write failing geometry tests**

Replace the zoom-specific tests with assertions for a `resolveArrayListGeometry` result. At scale `1`, expect `fontSize: 14`, `lineHeight: 17`, `paddingX: 8`, `paddingY: 5`, `borderWidth: 3`, `radius: 5`, `shadowY: 3`, `shadowBlur: 8`, `softGlow: 4`, `strongGlow: 8`, and `entryOffset: 16`. At scale `1.25`, expect every dimension multiplied by `1.25`. Also assert that `fontDeclaration` is `500 17.5px Inter`.

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```powershell
cd src-theme
npm run test:unit -- --run src/routes/hud/elements/arraylist_layout.test.ts
```

Expected: failure because `resolveArrayListGeometry` is not exported.

- [ ] **Step 3: Implement the pure geometry resolver**

Add an exported `ArrayListGeometry` interface and `resolveArrayListGeometry(value)` function. It must clamp via `resolveArrayListScale`, multiply the native dimensions by that scale, and expose a `fontDeclaration` generated from the scaled font size. Remove `resolveArrayListZoom`, because no scale may use CSS zoom.

- [ ] **Step 4: Run the focused test and verify success**

Run the command from Step 2. Expected: all ArrayList layout tests pass.

- [ ] **Step 5: Commit the geometry unit**

```powershell
git add src-theme/src/routes/hud/elements/arraylist_layout.ts src-theme/src/routes/hud/elements/arraylist_layout.test.ts
git commit -m "refactor(arraylist): resolve final scaled geometry"
```

### Task 2: Render and measure at final size

**Files:**
- Modify: `src-theme/src/routes/hud/elements/ArrayList.svelte`
- Test: `src-theme/src/routes/hud/elements/arraylist_layout.test.ts`

- [ ] **Step 1: Write failing source-invariant tests**

Add tests asserting that the component source does not contain `style:zoom`, `resolveArrayListZoom`, or `will-change`, and does contain `geometry.fontDeclaration`, `--arraylist-font-size`, `--arraylist-line-height`, `--arraylist-padding-x`, and `--arraylist-padding-y`.

- [ ] **Step 2: Run the focused test and verify failure**

Run the focused Vitest command from Task 1. Expected: source-invariant assertions fail against the current zoom implementation.

- [ ] **Step 3: Use geometry for text measurement and CSS dimensions**

Import `resolveArrayListGeometry`, derive `geometry` reactively from `cSettings.scale`, and call:

```ts
getTextWidth(fullName, geometry.fontDeclaration)
```

Replace `style:zoom` with CSS custom properties for final font size, line height, padding, border width, radius, shadows, glows, and transition offset. Bind the fly transition's `x` to `geometry.entryOffset`.

Update SCSS so `.module` uses the corresponding custom properties. Keep `box-sizing: content-box`, width animation, and no permanent `will-change`.

- [ ] **Step 4: Run focused tests and Svelte diagnostics**

```powershell
cd src-theme
npm run test:unit -- --run src/routes/hud/elements/arraylist_layout.test.ts
npm run check
```

Expected: tests pass and `svelte-check` reports zero errors and zero warnings.

- [ ] **Step 5: Commit the sharp rendering path**

```powershell
git add src-theme/src/routes/hud/elements/ArrayList.svelte src-theme/src/routes/hud/elements/arraylist_layout.test.ts
git commit -m "fix(arraylist): render text at final scale"
```

### Task 3: Make the stack one continuous rounded surface

**Files:**
- Modify: `src-theme/src/routes/hud/elements/ArrayList.svelte`
- Test: `src-theme/src/routes/hud/elements/arraylist_layout.test.ts`

- [ ] **Step 1: Write failing background-shape tests**

Add source assertions for `gap: 0`, scaled `--arraylist-radius`, square base row corners, first/last outer-corner selectors for both alignments, and the absence of `border-top` and `border-bottom` declarations.

- [ ] **Step 2: Run the focused test and verify failure**

Run the focused Vitest command. Expected: failure until the radius variable and explicit no-interior-border rules are present.

- [ ] **Step 3: Implement outer-only rounding and remove interior outlines**

Keep `.module` at `border-radius: 0`. Apply `var(--arraylist-radius)` only to the exposed corners of `:first-child`, `:last-child`, and `:only-child`. Ensure border modes only affect the exterior left or right accent edge and never add top/bottom borders or outlines. Keep rows at `gap: 0`.

- [ ] **Step 4: Run focused and full theme verification**

```powershell
cd src-theme
npm run test:unit
npm run check
```

Expected: six test files pass and Svelte diagnostics report no errors or warnings.

- [ ] **Step 5: Commit the background finish**

```powershell
git add src-theme/src/routes/hud/elements/ArrayList.svelte src-theme/src/routes/hud/elements/arraylist_layout.test.ts
git commit -m "style(arraylist): unify rounded background stack"
```

### Task 4: Build and prepare launcher installation

**Files:**
- Build output: `build/libs/liquidbounce-0.40.1.jar`

- [ ] **Step 1: Run the full project build with Java 25**

```powershell
$env:JAVA_HOME='C:\Program Files\Java\jdk-25.0.4'
.\gradlew.bat build
```

Expected: `BUILD SUCCESSFUL` and a fresh `build/libs/liquidbounce-0.40.1.jar`.

- [ ] **Step 2: Verify repository state and commit coverage**

Run `git diff --check`, `git status --short --branch`, and `git log -4 --oneline`. Expected: only the pre-existing untracked `.superpowers/` directory remains; all implementation files are committed.

- [ ] **Step 3: Install only when Minecraft is closed**

Check Minecraft Java processes. When none are using the launcher game directory, copy the current launcher `LiquidBounce.jar` into a timestamped directory below `data/custom-backups`, replace it with the new build, and verify source/destination SHA-256 hashes match. Do not alter `modules.json`, theme metadata, server lists, options, accounts, or other game-directory state.

- [ ] **Step 4: Perform visual acceptance checks**

Launch through LiquidLauncher and compare gameplay with HUD Editor at scales `0.5`, `1.0`, `1.25`, and `2.0`. Verify equal text sharpness, correct measured widths, smooth animation, no interior seams/outlines, and five-pixel-equivalent outer rounding.
