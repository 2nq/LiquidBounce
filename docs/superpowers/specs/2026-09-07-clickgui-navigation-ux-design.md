# ClickGUI Navigation UX Design

## Goal

Make the Rise ClickGUI preserve the user's place when opening module settings and allow module searches to begin by typing anywhere in the module list.

## Module-list position

- Before navigating from the module list into a module's settings, capture the list content container's current `scrollTop`.
- Returning with the back arrow restores that exact position after Svelte has rendered the module list again.
- Category and search query remain unchanged while entering and leaving settings, so the restored scroll position refers to the same list.
- Opening another category, Client Settings, or the HUD editor remains explicit navigation and keeps its existing behavior.

## Type-to-search

- While the module list is visible, pressing a printable character focuses the search field and inserts that first character into the query.
- The handler ignores input while module settings, Client Settings, or the HUD editor are open.
- It also ignores events originating from editable elements and events using `Ctrl`, `Alt`, or `Meta`, preserving text editing and shortcuts.
- Once focused, the existing search input handles further typing, Backspace, selection, and normal editing.

## Implementation shape

The ClickGUI owns both behaviors because it already owns navigation, the search query, and the shared scrolling container. Small pure helpers will decide whether a keyboard event may start a search and derive the next query, allowing deterministic unit tests without browser-heavy component mocking.

## Verification

- Unit tests cover accepted printable keys and rejected shortcuts/editable targets.
- Svelte type checking and the full frontend unit suite must pass.
- Manual verification confirms exact scroll restoration after entering and leaving a module's settings.
