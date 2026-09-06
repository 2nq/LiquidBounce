# AutoSpawner Q-Spam Design

## Goal

Simplify AutoSpawner so it opens the spawner shop once and continuously buys from slot 10 using the same container action produced by pressing `Q` over that slot.

## Behavior

- Enabling the module sends the `spawners` command once.
- The controller waits for the configured menu-opening delay.
- After the delay, every player tick sends a `ContainerInput.THROW` action to slot 10 with button 0, matching one normal `Q` press.
- There is no delay between purchase actions beyond the game's player-tick cadence.
- The command is not resent during ordinary Q spam; it is resent only when each maintenance cycle reopens the menu.
- Every 30 seconds, the controller pauses the throw loop, closes the menu, selects visible hotbar slot 2 (internal index 1), presses and holds Shift for 150 ms, uses the main-hand item while Shift remains active, holds Shift for another 100 ms, and then releases it.
- The 30-second deadline resets after every completed maintenance sequence, so the sequence repeats indefinitely until the module is stopped.
- After that maintenance action, the controller waits for the existing menu-opening delay and resumes throwing slot 10.
- Disabling the module stops all actions immediately.
- Pressing the configured emergency-stop key disables the module and closes the open container.
- If the player, game mode, container, or slot 10 is unavailable, the controller halts and displays an actionable error message.

## Settings

- Remove the `Quantidade` setting entirely.
- Keep the delay setting only for waiting for the menu to open; rename its user-facing label to `AtrasoAbertura`.
- Keep the emergency-stop key setting unchanged.

## Architecture and Data Flow

The controller uses idle, waiting-menu, spamming, pre-use Shift hold, post-use Shift hold, and halted states. Enabling sends the command and schedules the transition to spamming. Once spamming, each player tick attempts one throw action on slot 10 until the fixed 30-second maintenance deadline is reached.

The maintenance adapter closes the container, selects hotbar index 1, and controls `mc.options.keyShift` directly. The controller keeps Shift asserted across player ticks, invokes `InteractionUtil.useItem(InteractionHand.MAIN_HAND)` after 150 ms, releases Shift after another 100 ms, reopens the menu, and schedules the next 30-second deadline. This avoids the removed `ServerboundPlayerCommandPacket.Action.START_SNEAKING` and `STOP_SNEAKING` constants in Minecraft 26.2 and does not depend on window focus.

The LiquidBounce adapter performs the throw through `gameMode.handleContainerInput` using the current container ID, slot 10, button 0, and `ContainerInput.THROW`. Direct container input is intentionally used instead of physically moving the cursor or synthesizing a keypress because it is the exact inventory action handled by Minecraft and is independent of GUI scale, resolution, and user keybindings.

## Error Handling

The adapter reports failure when required game objects or slot 10 are unavailable, or when an action throws. Before entering the halted state, and whenever the module is disabled or emergency-stopped, the controller releases Shift if it was pressed by the module.

## Testing

Controller tests will verify that:

- enabling sends `spawners` exactly once;
- no throw occurs before the opening delay expires;
- one throw is attempted on slot 10 on every subsequent player tick;
- the 30-second deadline selects slot 2, holds Shift for 150 ms, uses the item while Shift is active, holds for another 100 ms, releases Shift, and reopens the menu;
- throwing resumes after the menu-opening delay and the maintenance deadline resets;
- the complete maintenance sequence repeats at the next 30-second deadline;
- no amount is read or sent through chat;
- disabling stops further actions and releases Shift during either hold state;
- a failed throw halts the controller and reports the failure.
