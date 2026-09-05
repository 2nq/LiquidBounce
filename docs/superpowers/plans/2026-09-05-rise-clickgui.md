# Rise ClickGUI Implementation Plan

**Goal:** Deliver the approved central window with right-click module settings and a Panels fallback.

**Architecture:** Reuse GenericSetting and REST/websocket APIs. Keep HUD editing fullscreen and embed global settings through an optional presentation flag.

**Tech Stack:** Svelte, TypeScript, SCSS, Kotlin.

- [x] Add pure search/category helpers and behavioral tests.
- [x] Add central Rise window, sidebar, module list and dedicated settings view.
- [x] Embed global settings; provide fullscreen HUD editor with return navigation.
- [x] Add persisted Kotlin Layout choice and route the selected layout.
- [ ] Run unit tests, Svelte checks and Gradle build; review resulting changes.

Verification commands (theme directory): `npm run test:unit`, `npm run check`.
Build command (repository): Java 25 `./gradlew.bat build`.
Manual acceptance: left-click toggles, right-click opens details, search finds aliases, long settings scroll, Panels restores existing layout.
