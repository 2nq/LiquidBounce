export const STATES = Object.freeze({
  IDLE: "IDLE",
  WAITING_MENU: "WAITING_MENU",
  SPAMMING: "SPAMMING",
  HOLDING_SHIFT_BEFORE_USE: "HOLDING_SHIFT_BEFORE_USE",
  HOLDING_SHIFT_AFTER_USE: "HOLDING_SHIFT_AFTER_USE",
  HALTED: "HALTED"
});

const SPAWNER_SLOT = 10;
const HOTBAR_SLOT = 1;
const MAINTENANCE_INTERVAL = 30_000;
const SHIFT_BEFORE_USE = 150;
const SHIFT_AFTER_USE = 100;

export function createAutoSpawnerController(environment) {
  let state = STATES.IDLE;
  let dueAt = null;
  let nextMaintenanceAt = null;
  let shiftHeld = false;

  function releaseShift() {
    if (!shiftHeld) {
      return;
    }

    environment.setShiftDown(false);
    shiftHeld = false;
  }

  function halt(message) {
    releaseShift();
    state = STATES.HALTED;
    dueAt = null;
    environment.display(message);
  }

  return {
    enable(now) {
      environment.sendCommand("spawners");
      state = STATES.WAITING_MENU;
      dueAt = now + environment.getOpenDelay();
      nextMaintenanceAt = now + MAINTENANCE_INTERVAL;
    },

    disable() {
      releaseShift();
      state = STATES.IDLE;
      dueAt = null;
      nextMaintenanceAt = null;
    },

    tick(now) {
      if (state === STATES.IDLE || state === STATES.HALTED) {
        return;
      }

      if (state === STATES.HOLDING_SHIFT_BEFORE_USE) {
        if (!environment.setShiftDown(true)) {
          halt("§c[AutoSpawner] Não foi possível manter o Shift pressionado.");
          return;
        }

        if (dueAt === null || now < dueAt) {
          return;
        }

        if (!environment.useMainHand()) {
          halt("§c[AutoSpawner] Não foi possível carregar no botão direito.");
          return;
        }

        state = STATES.HOLDING_SHIFT_AFTER_USE;
        dueAt = now + SHIFT_AFTER_USE;
        return;
      }

      if (state === STATES.HOLDING_SHIFT_AFTER_USE) {
        if (!environment.setShiftDown(true)) {
          halt("§c[AutoSpawner] Não foi possível manter o Shift pressionado.");
          return;
        }

        if (dueAt === null || now < dueAt) {
          return;
        }

        releaseShift();
        environment.sendCommand("spawners");
        state = STATES.WAITING_MENU;
        dueAt = now + environment.getOpenDelay();
        nextMaintenanceAt = now + MAINTENANCE_INTERVAL;
        return;
      }

      if (state === STATES.WAITING_MENU) {
        if (dueAt === null || now < dueAt) {
          return;
        }

        state = STATES.SPAMMING;
        dueAt = null;
      }

      if (nextMaintenanceAt !== null && now >= nextMaintenanceAt) {
        if (!environment.prepareHotbarSlot(HOTBAR_SLOT)) {
          halt("§c[AutoSpawner] Não foi possível fechar o menu ou selecionar o slot 2 da hotbar.");
          return;
        }

        shiftHeld = true;
        if (!environment.setShiftDown(true)) {
          halt("§c[AutoSpawner] Não foi possível pressionar o Shift.");
          return;
        }

        state = STATES.HOLDING_SHIFT_BEFORE_USE;
        dueAt = now + SHIFT_BEFORE_USE;
        return;
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

export function registerAutoSpawner(api) {
  const script = api.registerScript({
    name: "AutoSpawner",
    version: "3.1.0",
    authors: ["Codex"]
  });

  const openDelaySetting = api.Setting.int({
    name: "AtrasoAbertura",
    default: 300,
    range: [50, 5000],
    suffix: "ms"
  });
  const stopKeySetting = api.Setting.key({
    name: "TeclaParar",
    default: "end"
  });

  script.registerModule({
    name: "AutoSpawner",
    category: "Misc",
    description: "Compra continuamente spawners do slot 10 com a ação Q.",
    settings: {
      openDelay: openDelaySetting,
      stopKey: stopKeySetting
    }
  }, mod => {
    const now = typeof api.now === "function" ? api.now : () => Date.now();
    const controller = createAutoSpawnerController({
      getOpenDelay: () => Number(mod.settings.openDelay.get()),
      sendCommand: command => api.NetworkUtil.sendCommand(command),
      display: message => api.Client.displayChatMessage(message),
      prepareHotbarSlot(slot) {
        const player = api.mc.player;

        if (!player || !player.inventory) {
          return false;
        }

        try {
          player.closeContainer();
          player.inventory.selectedSlot = slot;
          return true;
        } catch (_error) {
          return false;
        }
      },
      setShiftDown(down) {
        const keyShift = api.mc.options?.keyShift;

        if (!keyShift) {
          return false;
        }

        try {
          keyShift.setDown(down);
          return true;
        } catch (_error) {
          return false;
        }
      },
      useMainHand() {
        if (!api.mc.player || !api.mc.gameMode) {
          return false;
        }

        try {
          api.InteractionUtil.useItem(api.InteractionHand.MAIN_HAND);
          return true;
        } catch (_error) {
          return false;
        }
      },
      throwSlot(slot) {
        const player = api.mc.player;
        const gameMode = api.mc.gameMode;
        const menu = player?.containerMenu;
        const slots = menu?.slots;

        if (!player || !gameMode || !menu || !slots || slot < 0 || slot >= slots.size()) {
          return false;
        }

        try {
          gameMode.handleContainerInput(
            menu.containerId,
            slot,
            0,
            api.ContainerInput.THROW,
            player
          );
          return true;
        } catch (_error) {
          return false;
        }
      }
    });

    mod.on("enable", () => controller.enable(now()));
    mod.on("disable", () => controller.disable());
    mod.on("keyboardKey", event => {
      if (!event.isPressed() || !event.getKey().equals(mod.settings.stopKey.get())) {
        return;
      }

      controller.disable();
      mod.enabled = false;
      api.mc.player?.closeContainer();
    });
    mod.on("playerTick", () => controller.tick(now()));
  });

  return script;
}

if (typeof registerScript === "function") {
  registerAutoSpawner({
    registerScript,
    Setting,
    NetworkUtil,
    Client,
    mc,
    InteractionUtil,
    InteractionHand,
    ContainerInput: Java.type("net.minecraft.world.inventory.ContainerInput")
  });
}
