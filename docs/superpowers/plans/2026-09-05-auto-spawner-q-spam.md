# AutoSpawner Q-Spam Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open `/spawners` once and issue the equivalent of `Q` on slot 10 every player tick until AutoSpawner is stopped.

**Architecture:** Keep the pure controller and LiquidBounce adapter in the existing local script. Replace the quantity/click/chat state machine with waiting-menu and spamming states; map `throwSlot(10)` to `handleContainerInput(..., ContainerInput.THROW, ...)`.

**Tech Stack:** LiquidBounce Script API, JavaScript ES modules, Node.js built-in test runner.

---

## File Structure

- Modify: `run/LiquidBounce/scripts/auto-spawner.mjs` — controller, settings, and LiquidBounce adapter.
- Create: `run/LiquidBounce/scripts/auto-spawner.test.mjs` — local controller and registration tests.

These files remain under the intentionally git-ignored runtime directory.

### Task 1: Specify and implement the controller loop

**Files:**
- Create: `run/LiquidBounce/scripts/auto-spawner.test.mjs`
- Modify: `run/LiquidBounce/scripts/auto-spawner.mjs`

- [ ] **Step 1: Write the failing controller tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { STATES, createAutoSpawnerController, registerAutoSpawner } from "./auto-spawner.mjs";

function createEnvironment(overrides = {}) {
  const calls = { commands: [], throws: [], displays: [] };
  return {
    calls,
    environment: {
      getOpenDelay: () => 300,
      sendCommand: command => calls.commands.push(command),
      throwSlot: slot => {
        calls.throws.push(slot);
        return true;
      },
      display: message => calls.displays.push(message),
      ...overrides
    }
  };
}

test("opens spawners once and throws slot 10 every tick after the opening delay", () => {
  const { calls, environment } = createEnvironment();
  const controller = createAutoSpawnerController(environment);
  controller.enable(1000);
  assert.deepEqual(calls.commands, ["spawners"]);
  assert.equal(controller.state, STATES.WAITING_MENU);
  controller.tick(1299);
  assert.deepEqual(calls.throws, []);
  controller.tick(1300);
  controller.tick(1301);
  controller.tick(1302);
  assert.deepEqual(calls.throws, [10, 10, 10]);
  assert.deepEqual(calls.commands, ["spawners"]);
  assert.equal(controller.state, STATES.SPAMMING);
});

test("disable stops the throw loop immediately", () => {
  const { calls, environment } = createEnvironment();
  const controller = createAutoSpawnerController(environment);
  controller.enable(0);
  controller.tick(300);
  controller.disable();
  controller.tick(301);
  assert.deepEqual(calls.throws, [10]);
  assert.equal(controller.state, STATES.IDLE);
});

test("a failed throw halts and reports slot 10", () => {
  const { calls, environment } = createEnvironment({
    throwSlot: slot => {
      calls.throws.push(slot);
      return false;
    }
  });
  const controller = createAutoSpawnerController(environment);
  controller.enable(0);
  controller.tick(300);
  controller.tick(301);
  assert.deepEqual(calls.throws, [10]);
  assert.equal(controller.state, STATES.HALTED);
  assert.match(calls.displays[0], /slot 10/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test run/LiquidBounce/scripts/auto-spawner.test.mjs`

Expected: FAIL because the new states and `throwSlot` loop do not exist.

- [ ] **Step 3: Implement the minimal controller**

Replace the existing constants and controller with:

```js
export const STATES = Object.freeze({
  IDLE: "IDLE",
  WAITING_MENU: "WAITING_MENU",
  SPAMMING: "SPAMMING",
  HALTED: "HALTED"
});

const SPAWNER_SLOT = 10;

export function createAutoSpawnerController(environment) {
  let state = STATES.IDLE;
  let dueAt = null;
  let generation = 0;
  let scheduledGeneration = 0;

  function halt(message) {
    state = STATES.HALTED;
    dueAt = null;
    environment.display(message);
  }

  return {
    enable(now) {
      generation += 1;
      scheduledGeneration = generation;
      environment.sendCommand("spawners");
      state = STATES.WAITING_MENU;
      dueAt = now + environment.getOpenDelay();
    },
    disable() {
      generation += 1;
      state = STATES.IDLE;
      dueAt = null;
    },
    tick(now) {
      if (scheduledGeneration !== generation || state === STATES.IDLE || state === STATES.HALTED) return;
      if (state === STATES.WAITING_MENU) {
        if (dueAt === null || now < dueAt) return;
        state = STATES.SPAMMING;
        dueAt = null;
      }
      if (!environment.throwSlot(SPAWNER_SLOT)) {
        halt("§c[AutoSpawner] Não foi possível usar Q no slot 10. Reabre o menu ou aumenta o atraso e reativa o módulo.");
      }
    },
    get state() {
      return state;
    }
  };
}
```

- [ ] **Step 4: Run the test and verify GREEN**

Run: `node --test run/LiquidBounce/scripts/auto-spawner.test.mjs`

Expected: all three controller tests PASS.

### Task 2: Update settings and the LiquidBounce adapter

**Files:**
- Modify: `run/LiquidBounce/scripts/auto-spawner.test.mjs`
- Modify: `run/LiquidBounce/scripts/auto-spawner.mjs`

- [ ] **Step 1: Add the failing registration test**

Append:

```js
test("removes quantity and maps slot 10 to ContainerInput.THROW", () => {
  let clock = 0;
  let metadata;
  let definition;
  let configure;
  const commands = [];
  const inputs = [];
  const handlers = {};
  const throwInput = Symbol("THROW");
  const player = {
    containerMenu: { containerId: 7, slots: { size: () => 27 } },
    closeContainer() {}
  };
  const api = {
    registerScript(value) {
      metadata = value;
      return {
        registerModule(moduleDefinition, callback) {
          definition = moduleDefinition;
          configure = callback;
        }
      };
    },
    Setting: {
      int: config => ({ config, get: () => config.default }),
      key: config => ({ config, get: () => config.default })
    },
    NetworkUtil: { sendCommand: command => commands.push(command) },
    Client: { displayChatMessage() {} },
    mc: {
      player,
      gameMode: { handleContainerInput: (...args) => inputs.push(args) }
    },
    ContainerInput: { THROW: throwInput },
    now: () => clock
  };
  registerAutoSpawner(api);
  assert.equal(metadata.version, "2.0.0");
  assert.deepEqual(Object.keys(definition.settings), ["openDelay", "stopKey"]);
  assert.equal(definition.settings.openDelay.config.name, "AtrasoAbertura");
  const mod = {
    enabled: true,
    settings: definition.settings,
    on: (event, handler) => {
      handlers[event] = handler;
    }
  };
  configure(mod);
  handlers.enable();
  assert.deepEqual(commands, ["spawners"]);
  clock = 299;
  handlers.playerTick();
  assert.equal(inputs.length, 0);
  clock = 300;
  handlers.playerTick();
  assert.deepEqual(inputs[0], [7, 10, 0, throwInput, player]);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test run/LiquidBounce/scripts/auto-spawner.test.mjs`

Expected: FAIL because version `1.1.0`, `amount`, `delay`, and `PICKUP` remain.

- [ ] **Step 3: Update registration and settings**

Use version `2.0.0`, remove `amountSetting`, rename `delaySetting` to `openDelaySetting`, set its user-facing name to `AtrasoAbertura`, and register exactly:

```js
settings: {
  openDelay: openDelaySetting,
  stopKey: stopKeySetting
}
```

Set the description to `Compra continuamente spawners do slot 10 com a ação Q.`

- [ ] **Step 4: Replace the adapter operations**

Construct the controller with:

```js
const controller = createAutoSpawnerController({
  getOpenDelay: () => Number(mod.settings.openDelay.get()),
  sendCommand: command => api.NetworkUtil.sendCommand(command),
  display: message => api.Client.displayChatMessage(message),
  throwSlot(slot) {
    const player = api.mc.player;
    const gameMode = api.mc.gameMode;
    const menu = player?.containerMenu;
    const slots = menu?.slots;
    if (!player || !gameMode || !menu || !slots || slot < 0 || slot >= slots.size()) return false;
    try {
      gameMode.handleContainerInput(menu.containerId, slot, 0, api.ContainerInput.THROW, player);
      return true;
    } catch (_error) {
      return false;
    }
  }
});
```

- [ ] **Step 5: Run focused and static verification**

Run:

```powershell
node --test run/LiquidBounce/scripts/auto-spawner.test.mjs
rg -n "Quantidade|getAmount|sendChat|CLICK_STORE|CLICK_AMOUNT|WAITING_CHAT|PICKUP|AMOUNT_SLOT" run/LiquidBounce/scripts/auto-spawner.mjs
rg -n 'sendCommand\("spawners"\)|SPAWNER_SLOT = 10|ContainerInput\.THROW|AtrasoAbertura' run/LiquidBounce/scripts/auto-spawner.mjs
```

Expected: four tests PASS; the first search has no matches; the second finds all four required behaviors.

- [ ] **Step 6: Confirm ignored runtime files and clean staging**

Run:

```powershell
git check-ignore -v run/LiquidBounce/scripts/auto-spawner.mjs run/LiquidBounce/scripts/auto-spawner.test.mjs
git status --short
```

Expected: both runtime files are ignored by `/run/`, and no unrelated files are staged or modified.
