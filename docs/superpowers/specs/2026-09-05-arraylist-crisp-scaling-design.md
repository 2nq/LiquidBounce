# Crisp ArrayList Scaling Design

## Goal

Keep ArrayList text crisp at every user-selected scale while preserving the current Rise-inspired animation, color themes, ordering, alignment, and continuous `0.5` to `2.0` scale control.

## Rendering model

The ArrayList must not use CSS `zoom` or a persistent transformed compositing layer. The selected scale is resolved once and exposed as CSS custom properties. Font size, line height, horizontal and vertical padding, border width, corner radius, shadow dimensions, glow dimensions, and measured content width are calculated at their final rendered size. Chromium therefore rasterizes glyphs directly at the requested size instead of scaling an already-rasterized transparent layer.

Text measurement must use the same scaled font declaration as the rendered module name and tag. Width animation continues to operate on the final pixel width so long names and tags neither clip nor leave excess space.

## Background shape

Rows remain contiguous with no gaps. No outline, separator, or border may appear between adjacent rows. When a border style is disabled, it must leave no residual border width on either side.

The stack is treated as one visual surface: only the first and last visible rows receive outer corner rounding. Interior row corners remain square. A single-row stack receives all applicable outer corners. The final radius is five pixels at scale `1`, and scales with the ArrayList.

## Animation and state changes

Module entry, exit, reorder, and width animations retain their current timing and easing. Temporary transforms created by Svelte transitions are allowed only for the duration of an animation; no permanent `will-change`, `zoom`, or transform hint remains after it finishes.

Changes to scale update all geometry and text measurement reactively without resetting the selected theme or other ArrayList settings.

## Verification

- Unit-test scale clamping and scaled geometry at native, fractional, minimum, and maximum scales.
- Verify that native scale produces the current intended dimensions.
- Verify source output contains no ArrayList CSS `zoom` and no permanent transform promotion.
- Run the full theme test suite, Svelte diagnostics, and Gradle build.
- Compare the ArrayList in normal gameplay and HUD Editor at `0.5`, `1.0`, `1.25`, and `2.0`; text quality and geometry should match between both contexts.

## Out of scope

This change does not alter theme palettes, color-wave behavior, tag coloring, module sorting, HUD browser quality, or other HUD components.
