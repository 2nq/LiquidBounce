# Rise setting pages

**Goal:** Replace deeply nested settings with navigable pages, restyle numeric values and portaled options, and replace the native layout select.

**Architecture:** A Rise-only page renderer reuses leaf controls and saves the entire existing configurable tree. Name-based breadcrumbs resolve against refreshed settings; CHOICE groups resolve only their active branch. Dropdowns carry a Rise class to their body portal. Panels keep their existing rendering.

**Tech stack:** Svelte, TypeScript, SCSS, Vitest, Gradle.

- [x] Add and test group/path resolution, including missing paths and active choices.
- [x] Add RiseSettingsPage with breadcrumbs, navigable groups, choice selectors and leaf bindings. Integrate in module details and embedded global settings.
- [x] Replace layout select with explicit Rise/Panels buttons, retaining API error handling.
- [x] Apply Inter to settings and give portaled Rise options rounded surfaces, left alignment, selection and hover states.
- [x] Run unit tests, Svelte check, frontend and Gradle builds; document limits of in-game verification.

Verification: 20 unit tests passed; Svelte check returned zero errors/warnings; frontend and Gradle builds passed. In-game rendering and layout switching have not been interactively verified. Native select is removed, so switching no longer depends on its embedded-browser popup.
