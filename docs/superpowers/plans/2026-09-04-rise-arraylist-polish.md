# Rise ArrayList Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the ArrayList colour wave and row motion match Rise, add uniform scaling, remove background gaps, and keep long ClickGUI dropdowns inside the viewport with usable scrolling.

**Architecture:** Pure geometry and colour functions will hold the behaviours that need deterministic unit tests. Svelte components will consume those functions, keep animation time in explicitly reactive state, and use the existing CEF-compatible CSS/portal patterns. The existing REST/websocket data flow and HUD persistence remain unchanged.

**Tech Stack:** Svelte 4 legacy syntax, TypeScript, SCSS, Vitest, Vite, Gradle/Fabric Loom, CEF.

---

### Task 1: Viewport-aware scrollable dropdown

**Files:**
- Create: `src-theme/src/routes/clickgui/setting/common/dropdown_geometry.ts`
- Create: `src-theme/src/routes/clickgui/setting/common/dropdown_geometry.test.ts`
- Modify: `src-theme/src/routes/clickgui/setting/common/Dropdown.svelte`

- [ ] **Step 1: Write failing geometry tests**

```ts
import {describe, expect, it} from "vitest";
import {resolveDropdownGeometry} from "./dropdown_geometry";

describe("dropdown geometry", () => {
    it("opens below when enough room is available", () => {
        expect(resolveDropdownGeometry(100, 130, 900, 1)).toEqual({
            openAbove: false,
            maxHeight: 420,
        });
    });

    it("opens above when the lower viewport is too small", () => {
        expect(resolveDropdownGeometry(700, 730, 800, 1)).toEqual({
            openAbove: true,
            maxHeight: 420,
        });
    });

    it("accounts for ClickGUI scale", () => {
        expect(resolveDropdownGeometry(100, 130, 500, 0.5)).toEqual({
            openAbove: false,
            maxHeight: 724,
        });
    });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `cd src-theme && npm run test:unit -- --run src/routes/clickgui/setting/common/dropdown_geometry.test.ts`

Expected: FAIL because `dropdown_geometry.ts` does not exist.

- [ ] **Step 3: Implement the geometry helper**

```ts
export interface DropdownGeometry {
    openAbove: boolean;
    maxHeight: number;
}

export function resolveDropdownGeometry(
    triggerTop: number,
    triggerBottom: number,
    viewportHeight: number,
    scale: number,
    preferredMaxHeight = 420,
    viewportMargin = 8,
): DropdownGeometry {
    const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
    const roomBelow = Math.max(0, viewportHeight - triggerBottom - viewportMargin);
    const roomAbove = Math.max(0, triggerTop - viewportMargin);
    const openAbove = roomBelow < preferredMaxHeight && roomAbove > roomBelow;
    const visualRoom = openAbove ? roomAbove : roomBelow;

    return {
        openAbove,
        maxHeight: Math.max(80, Math.min(preferredMaxHeight, visualRoom) / safeScale),
    };
}
```

- [ ] **Step 4: Integrate geometry and internal scrolling**

In `Dropdown.svelte`, bind the portalled options element, calculate either `top` or `bottom`, write `--dropdown-max-height`, and ignore scroll events originating inside the options:

```ts
let optionsElement: HTMLElement | undefined;

function windowScrollHide(event: Event) {
    if (optionsElement?.contains(event.target as Node)) return;
    expanded = false;
}
```

```scss
.options {
    max-height: var(--dropdown-max-height, 420px);
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    transform-origin: var(--dropdown-transform-origin, top left);
}
```

- [ ] **Step 5: Verify and commit**

Run: `cd src-theme && npm run test:unit && npm run check`

Expected: all tests pass and Svelte reports 0 errors/0 warnings.

```powershell
git add src-theme/src/routes/clickgui/setting/common/Dropdown.svelte src-theme/src/routes/clickgui/setting/common/dropdown_geometry.ts src-theme/src/routes/clickgui/setting/common/dropdown_geometry.test.ts
git commit -m "fix(clickgui): constrain long dropdowns"
```

### Task 2: Reactive Rise colour wave

**Files:**
- Modify: `src-theme/src/routes/hud/elements/arraylist_themes.ts`
- Modify: `src-theme/src/routes/hud/elements/arraylist_themes.test.ts`
- Modify: `src-theme/src/routes/hud/elements/ArrayList.svelte`

- [ ] **Step 1: Replace the existing preset-time test with exact Rise-wave tests**

```ts
import {riseBlendFactor} from "./arraylist_themes";

it("matches the Rise sine wave at the origin", () => {
    expect(riseBlendFactor(0, 0)).toBeCloseTo(0.5, 8);
});

it("offsets the wave by row position", () => {
    expect(riseBlendFactor(1, 0)).not.toBeCloseTo(riseBlendFactor(0, 0), 4);
});

it("changes preset colours over time", () => {
    expect(resolveArrayListColor("Blend", 0, 5, 0, 0, 0, 0, 0))
        .not.toBe(resolveArrayListColor("Blend", 0, 5, 600, 0, 0, 0, 0));
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `cd src-theme && npm run test:unit -- --run src/routes/hud/elements/arraylist_themes.test.ts`

Expected: FAIL because `riseBlendFactor` is not exported and the current clamped shift does not implement the Rise formula.

- [ ] **Step 3: Implement the Rise wave**

```ts
const RISE_ROW_SPACING = 12;

export function riseBlendFactor(index: number, now: number): number {
    const y = index * RISE_ROW_SPACING;
    return Math.sin(now / 600 + y * 0.06) * 0.5 + 0.5;
}
```

Use `riseBlendFactor(index, now)` for every two/three-colour preset, `Global`, and `Custom`. Keep `Rainbow` as its own hue cycle.

- [ ] **Step 4: Make colour time explicitly reactive**

Replace the template helper and 100 ms interval with `requestAnimationFrame` and a reactive array whose expression directly reads `colorTime`:

```ts
let itemColors: string[] = [];
let colorTime = Date.now();

$: itemColors = enabledModules.map((_, index) => rgb(resolveArrayListColor(
    cSettings.theme as ArrayListThemeName,
    index,
    enabledModules.length,
    colorTime,
    GLOBAL_PRIMARY,
    GLOBAL_SECONDARY,
    cSettings.customPrimary,
    cSettings.customSecondary,
)));

onMount(() => {
    void updateEnabledModules();
    let frame = 0;
    const animateColors = (now: number) => {
        colorTime = now;
        frame = window.requestAnimationFrame(animateColors);
    };
    frame = window.requestAnimationFrame(animateColors);
    return () => window.cancelAnimationFrame(frame);
});
```

Use `itemColors[index]` as `--arraylist-item-color` and remove the long colour transition so every rendered frame is visible.

- [ ] **Step 5: Verify and commit**

Run: `cd src-theme && npm run test:unit && npm run check`

Expected: all tests pass and Svelte reports 0 errors/0 warnings.

```powershell
git add src-theme/src/routes/hud/elements/ArrayList.svelte src-theme/src/routes/hud/elements/arraylist_themes.ts src-theme/src/routes/hud/elements/arraylist_themes.test.ts
git commit -m "fix(arraylist): use reactive Rise color wave"
```

### Task 3: Scale and smooth row geometry

**Files:**
- Create: `src-theme/src/routes/hud/elements/arraylist_layout.ts`
- Create: `src-theme/src/routes/hud/elements/arraylist_layout.test.ts`
- Modify: `src-theme/public/components/arraylist.json`
- Modify: `src-theme/src/routes/hud/components.d.ts`
- Modify: `src-theme/src/routes/hud/elements/ArrayList.svelte`

- [ ] **Step 1: Write failing scale tests**

```ts
import {describe, expect, it} from "vitest";
import {resolveArrayListScale} from "./arraylist_layout";

describe("ArrayList scale", () => {
    it.each([
        [undefined, 1],
        [0.25, 0.5],
        [1.25, 1.25],
        [3, 2],
    ])("maps %s to %s", (input, expected) => {
        expect(resolveArrayListScale(input)).toBe(expected);
    });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `cd src-theme && npm run test:unit -- --run src/routes/hud/elements/arraylist_layout.test.ts`

Expected: FAIL because `arraylist_layout.ts` does not exist.

- [ ] **Step 3: Implement scale resolution and configuration**

```ts
export function resolveArrayListScale(value: unknown): number {
    const scale = Number(value);
    return Number.isFinite(scale) ? Math.max(0.5, Math.min(2, scale)) : 1;
}
```

Add a `FLOAT` setting named `Scale`, default `1.0`, range `0.5..2.0`, and add `scale: number` to `HudArrayListSettings` and the local settings interface/defaults.

- [ ] **Step 4: Apply scale, explicit widths, easing, and contiguous backgrounds**

Apply `style:zoom={resolveArrayListScale(cSettings.scale)}` to the ArrayList root. Add `--arraylist-content-width: ${module.width}px` per row, use `width: var(--arraylist-content-width)`, `white-space: nowrap`, and `overflow: hidden` with a width transition. Change `gap` to `0`, shorten `fly` to 16 px, use `quintOut`, and give only the first/last visible rows outer corner radii.

```svelte
animate:flip={{duration: animationDuration, easing: quintOut}}
transition:fly={{
    x: cSettings.itemAlignment === "Right" ? 16 : -16,
    duration: animationDuration,
    easing: quintOut,
}}
```

- [ ] **Step 5: Verify and commit**

Run: `cd src-theme && npm run test:unit && npm run check && npm run build`

Expected: tests pass, Svelte reports 0 errors/0 warnings, and Vite emits `dist/` successfully.

```powershell
git add src-theme/public/components/arraylist.json src-theme/src/routes/hud/components.d.ts src-theme/src/routes/hud/elements/ArrayList.svelte src-theme/src/routes/hud/elements/arraylist_layout.ts src-theme/src/routes/hud/elements/arraylist_layout.test.ts
git commit -m "feat(arraylist): add scaling and smooth row sizing"
```

### Task 4: Full client verification

**Files:**
- Verify only: `build/libs/liquidbounce-0.40.1.jar`

- [ ] **Step 1: Stop the running development client**

Send Ctrl+C to the existing `runClient` process so Windows releases Gradle resource outputs.

- [ ] **Step 2: Run the complete build on Java 25**

```powershell
$env:JAVA_HOME='C:\Program Files\Java\jdk-25.0.4'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
./gradlew.bat build
```

Expected: `BUILD SUCCESSFUL`; the existing large Vite chunk warning is allowed.

- [ ] **Step 3: Launch the development client**

```powershell
./gradlew.bat runClient
```

Expected: log contains `LiquidBounce has been successfully initialized` and the browser backend becomes ready.

- [ ] **Step 4: Manual acceptance checks**

Verify in the HUD/ClickGUI:

- Blend colours move continuously across module names;
- tags stay grey and the background stays unchanged;
- toggling Speed with `Intave14 Fast` does not jerk when its width changes;
- row backgrounds touch with no visible gap;
- Scale 0.5, 1.0, and 2.0 resize the complete component;
- the Theme dropdown stays on-screen, scrolls with the wheel, and remains open while its own list scrolls.
