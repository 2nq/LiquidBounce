# Title Menu Rework Design

## Goal

Rework the LiquidBounce title screen into a fast, centered interface that shares the Rise ClickGUI's visual language without copying its window layout. The result should feel polished, layered, responsive, and native to the existing client.

## Visual Direction

The title screen uses the selected "floating centered stack" composition with a hybrid surface treatment. The Minecraft background remains visible beneath a dark overlay and subtle blur. A compact central panel provides just enough structure to group the primary actions, while every action remains a distinct elevated surface.

Depth comes from restrained contrast rather than large gradients: slightly lighter top and left borders, soft layered shadows, inset highlights, and darker nested surfaces. The accent blue appears on the current or hovered action, icons, focus states, and small status details. Text uses the same clean Inter typography as the Rise ClickGUI.

## Layout

- A compact `LB` wordmark sits in the upper-left corner with a small `LiquidBounce` label.
- The current account remains in the upper-right corner as a compact elevated profile chip. Existing account switching and editing behavior remains available.
- The primary actions are centered horizontally and vertically in a narrow stack: Singleplayer, Multiplayer, LiquidBounce, and Options.
- The Realms action remains available as a secondary action associated with Multiplayer without widening the entire menu.
- A restrained bottom utility bar contains Exit, background toggle, community links, website, and the client version.
- The layout scales down cleanly on smaller windows without allowing actions or utilities to leave the viewport.

## Navigation and Interaction

Primary buttons are semantic buttons with an icon, label, and a subtle directional affordance. Hover raises the surface by a few pixels, brightens the leading border, and reveals a low-opacity accent glow. Pressing a button immediately settles the surface to provide tactile feedback.

Selecting LiquidBounce replaces the main actions with Proxy Manager, ClickGUI, and Back in the same central stack. The current 750 ms staged delay is removed. The two action sets swap with a 140–180 ms opacity transition and 6–10 px vertical movement. The interface never enters an empty waiting state between sets.

Initial entrance motion is limited to a short fade and slight upward motion. Bottom utilities use the same duration. Motion respects `prefers-reduced-motion` by disabling transforms and reducing transition durations to near zero.

Keyboard focus is clearly visible. Enter and Space activate actions, and the account and utility controls remain reachable in a logical tab order.

## Background Modes

The default mode preserves the current Minecraft/shader background with a dark translucent layer and subtle blur for readability. The existing Toggle Shader action becomes a clearer background-mode control.

The alternate mode uses the existing abstract LiquidBounce background. Switching modes uses a quick crossfade and retains the backend behavior exposed by `toggleBackgroundShaderEnabled`; no separate frontend-only state is introduced that could drift from the client state.

The overlay must not make either mode opaque. Background detail remains visible while text and controls maintain sufficient contrast.

## Component Structure

- `Title.svelte` owns the two menu states and composes the title layout. State changes are immediate; visual transitions happen in CSS/Svelte rather than timers.
- `MainButton.svelte` becomes the compact modern action surface and retains slots for related secondary actions.
- `ChildButton.svelte` renders Realms as a compact secondary control with independent focus and click behavior.
- Header/account components retain their data and actions while receiving title-screen-specific compact presentation through explicit variants or scoped styles.
- Existing bottom button components retain REST actions but receive a title-screen presentation suitable for the unified utility bar.
- Theme tokens for title surfaces, borders, shadows, overlay, and motion live in `colors.scss`; components do not duplicate arbitrary accent colors.

## Error Handling and Compatibility

All existing REST actions remain unchanged: opening screens, browsing links, exiting, changing accounts, and toggling the background continue to call their current integration functions. The update notification check remains asynchronous and must not block or delay rendering the menu.

The anniversary confetti remains supported, stays behind interactive content, and must not intercept pointer events. The rework does not change multiplayer, singleplayer, proxy, account-manager, or ClickGUI screens.

## Performance

Animations use opacity and transform only. Large background elements are not animated by layout properties. Expensive blur is applied to a single bounded backdrop layer, with a translucent fallback for environments where backdrop filtering is unavailable.

The update check may continue after the menu is interactive. No fixed timeout is used for local navigation transitions.

## Verification

- Unit-test any extracted menu-state helper or transition-independent behavior.
- Run the complete frontend unit suite and `svelte-check`.
- Run the production frontend build and full Gradle build with Java 25.
- Launch the development client and manually verify both menu states, Realms, account controls, background switching, keyboard focus, resizing, and reduced motion.
- Compare the rendered result against the approved mockup for centering, surface depth, restrained accent use, and animation speed.
