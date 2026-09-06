# AutoSpawner Maintenance Implementation Plan

**Goal:** Every 30 seconds, interrupt AutoSpawner long enough to use visible hotbar slot 2 while sneaking, then reopen `/spawners` and resume slot-10 Q spam.

**Files:**

- Modify `run/LiquidBounce/scripts/auto-spawner.mjs`.
- Temporarily create a Node test outside LiquidBounce's script-loading directory, then remove it after verification.
- Deploy the verified script to `C:/Users/sllea/AppData/Roaming/CCBlueX/LiquidLauncher/data/gameDir/nextgen/LiquidBounce/scripts/auto-spawner.mjs`.

## Steps

1. Reproduce and document the current failure: Minecraft 26.2 has no `START_SNEAKING` or `STOP_SNEAKING` members in `ServerboundPlayerCommandPacket.Action`, so the adapter throws immediately after selecting the hotbar slot.
2. Write a failing controller test proving the ordered timing: select slot 2 and press Shift at 30 seconds, use the main hand at 30.150 seconds while Shift is still active, release at 30.250 seconds, reopen `/spawners`, resume Q spam after `AtrasoAbertura`, and repeat after another 30 seconds.
3. Add pre-use and post-use Shift-hold states. Reassert Shift on every tick while either state is active, and release it on disable, emergency stop, halt, or successful completion.
4. Replace the removed player-command packet actions with `mc.options.keyShift.setDown(boolean)` and keep `InteractionUtil.useItem(InteractionHand.MAIN_HAND)` for the focus-independent right click.
5. Bump the script version and remove the obsolete `PlayerCommandPacket` binding.
6. Run the controller test, adapter test, syntax check, and static behavior scan; remove the temporary test.
7. Copy the verified script to the requested LiquidLauncher directory and confirm the two files are byte-identical.
8. Commit the script and documents, push the feature branch, merge it into `nextgen`, rerun verification, and push `nextgen`.
