# ArrayList Silhouette and Offsets Design

## Goal

Finish the ArrayList presentation without changing the now-verified crisp text renderer: remove visible seams, give the width-sorted stack the rounded stepped silhouette shown in the reference, and let the user move it inward from the screen corner.

## Connected stepped silhouette

Rows remain directly adjacent with `gap: 0`; they must never overlap and must not use margins that expose a separator. The common screen-facing edge stays continuous and square between internal rows, preventing transparent notches or doubled-alpha bands.

For a right-aligned list, every row receives rounded top-left and bottom-left corners so each exposed width step is curved. Only the first row receives the top-right corner and only the last row receives the bottom-right corner. Left alignment mirrors these rules. A single row receives all four corners.

No outline or horizontal border is drawn. Existing optional accent/item borders remain restricted to the exposed side selected by the current border setting.

## Configurable screen offsets

Add independent integer settings named `HorizontalOffset` and `VerticalOffset`, both defaulting to `0` with a range of `0..100` pixels. These values are layout spacing, not transforms, so they cannot soften the text.

The horizontal offset adds padding on the screen-facing side: right padding for a right-aligned list and left padding for a left-aligned list. The vertical offset adds top padding. The values do not scale with the ArrayList text scale, so a ten-pixel screen margin remains ten pixels at every scale.

## Compatibility

Retain continuous ArrayList scale, font measurement, colors, tags, background alpha, glow, shadow, animation, ordering, and HUD Editor behavior. Existing configurations load with zero offsets and therefore keep their current position until the user changes the new controls.

## Verification

- Unit-test offset clamping/defaults and source invariants for transform-free padding.
- Test the mirrored corner selectors and the absence of gaps, overlap, outlines, and horizontal borders.
- Run the full theme tests, Svelte diagnostics, and Java 25 Gradle build.
- Visually inspect right and left alignment with zero and non-zero offsets in normal HUD and HUD Editor.
