# AutoSpawner Q-Spam Design

## Goal

Simplify AutoSpawner so it opens the spawner shop once and continuously buys from slot 10 using the same container action produced by pressing `Q` over that slot.

## Behavior

- Enabling the module sends the `spawners` command once.
- The controller waits for the configured menu-opening delay.
- After the delay, every player tick sends a `ContainerInput.THROW` action to slot 10 with button 0, matching one normal `Q` press.
- There is no delay between purchase actions beyond the game's player-tick cadence.
- The command is not sent again while the module remains enabled.
- Every 30 seconds, the controller pauses the throw loop, closes the menu, selects visible hotbar slot 2 (internal index 1), uses the main-hand item while sneaking, and sends `spawners` again.
- After that maintenance action, the controller waits for the existing menu-opening delay and resumes throwing slot 10.
- Disabling the module stops all actions immediately.
- Pressing the configured emergency-stop key disables the module and closes the open container.
- If the player, game mode, container, or slot 10 is unavailable, the controller halts and displays an actionable error message.

## Settings

- Remove the `Quantidade` setting entirely.
- Keep the delay setting only for waiting for the menu to open; rename its user-facing label to `AtrasoAbertura`.
- Keep the emergency-stop key setting unchanged.

## Architecture and Data Flow

The controller uses four states: idle, waiting for the menu, spamming, and halted. Enabling sends the command and schedules the transition to spamming. Once spamming, each player tick attempts one throw action on slot 10 until the fixed 30-second maintenance deadline is reached.

The maintenance adapter closes the container, selects hotbar index 1, sends start-sneaking, uses the main-hand item, and always sends stop-sneaking. The controller then reopens the menu and schedules the next deadline.

The LiquidBounce adapter performs the throw through `gameMode.handleContainerInput` using the current container ID, slot 10, button 0, and `ContainerInput.THROW`. Direct container input is intentionally used instead of physically moving the cursor or synthesizing a keypress because it is the exact inventory action handled by Minecraft and is independent of GUI scale, resolution, and user keybindings.

## Error Handling

The adapter reports failure when required game objects or slot 10 are unavailable, or when the container action throws. The controller then enters the halted state, stops issuing actions, and tells the user to reopen or increase the menu-opening delay before reactivating the module.

## Testing

Controller tests will verify that:

- enabling sends `spawners` exactly once;
- no throw occurs before the opening delay expires;
- one throw is attempted on slot 10 on every subsequent player tick;
- the 30-second deadline performs the slot-2 sneak-use sequence and reopens the menu without throwing on that tick;
- throwing resumes after the menu-opening delay and the maintenance deadline resets;
- no amount is read or sent through chat;
- disabling stops further actions;
- a failed throw halts the controller and reports the failure.
