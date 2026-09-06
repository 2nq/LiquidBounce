export const STATES = Object.freeze({
  IDLE: "IDLE",
  WAITING_MENU: "WAITING_MENU",
  SPAMMING: "SPAMMING",
  HALTED: "HALTED"
});

const SPAWNER_SLOT = 10;
const HOTBAR_SLOT = 1;
const MAINTENANCE_INTERVAL = 30_000;

export function createAutoSpawnerController(environment) {
  let state = STATES.IDLE;
  let dueAt = null;
  let nextMaintenanceAt = null;

  function halt(message) {
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
      state = STATES.IDLE;
      dueAt = null;
      nextMaintenanceAt = null;
    },

    tick(now) {
      if (state === STATES.IDLE || state === STATES.HALTED) {
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
        if (!environment.useHotbarSlotWhileSneaking(HOTBAR_SLOT)) {
          halt("§c[AutoSpawner] Não foi possível usar o slot 2 da hotbar.");
          return;
        }

        environment.sendCommand("spawners");
        state = STATES.WAITING_MENU;
        dueAt = now + environment.getOpenDelay();
        nextMaintenanceAt = now + MAINTENANCE_INTERVAL;
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
    version: "3.0.0",
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
      useHotbarSlotWhileSneaking(slot) {
        const player = api.mc.player;

        if (!player || !player.connection || !api.mc.gameMode) {
          return false;
        }

        try {
          player.closeContainer();
          player.inventory.selectedSlot = slot;
          player.connection.send(new api.PlayerCommandPacket(
            player,
            api.PlayerCommandPacket.Action.START_SNEAKING
          ));

          try {
            api.InteractionUtil.useItem(api.InteractionHand.MAIN_HAND);
          } finally {
            player.connection.send(new api.PlayerCommandPacket(
              player,
              api.PlayerCommandPacket.Action.STOP_SNEAKING
            ));
          }

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
    ContainerInput: Java.type("net.minecraft.world.inventory.ContainerInput"),
    PlayerCommandPacket: Java.type("net.minecraft.network.protocol.game.ServerboundPlayerCommandPacket")
  });
}
