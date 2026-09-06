# AutoSpawner Maintenance Implementation Plan

**Goal:** Every 30 seconds, interrupt AutoSpawner long enough to use visible hotbar slot 2 while sneaking, then reopen `/spawners` and resume slot-10 Q spam.

**Files:**

- Modify `run/LiquidBounce/scripts/auto-spawner.mjs`.
- Temporarily create a Node test outside LiquidBounce's script-loading directory, then remove it after verification.
- Deploy the verified script to `C:/Users/sllea/AppData/Roaming/CCBlueX/LiquidLauncher/data/gameDir/nextgen/LiquidBounce/scripts/auto-spawner.mjs`.

## Steps

1. Write a failing controller test proving that no maintenance occurs before 30 seconds, the action uses internal hotbar index 1 at 30 seconds, `/spawners` is sent again, and Q spam resumes only after `AtrasoAbertura`.
2. Add a fixed `30_000 ms` maintenance deadline to the controller and call one environment operation at the deadline.
3. Implement that operation by closing the container, selecting `player.inventory.selectedSlot = 1`, sending `START_SNEAKING`, invoking `InteractionUtil.useItem(InteractionHand.MAIN_HAND)`, and sending `STOP_SNEAKING` in `finally`.
4. Pass the required LiquidBounce/Java bindings into the runtime API object and bump the script version.
5. Run the controller test, syntax check, and static behavior scan; remove the temporary test.
6. Copy the verified script to the requested LiquidLauncher directory and confirm the two files are byte-identical.
7. Force-add only the ignored AutoSpawner script, commit it with these documents, push the feature branch, merge it into `nextgen`, rerun verification, and push `nextgen`.
