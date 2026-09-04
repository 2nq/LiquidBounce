<script lang="ts">
    import {onMount, tick} from "svelte";
    import type {Module} from "../../../integration/types";
    import {getModules} from "../../../integration/rest";
    import {listen} from "../../../integration/ws";
    import {getTextWidth} from "../../../integration/text_measurement";
    import {flip} from "svelte/animate";
    import {fly} from "svelte/transition";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import {resolveArrayListColor, type ArrayListThemeName} from "./arraylist_themes";

    export let settings: { [name: string]: any };

    interface ArrayListSettings {
        showTags: boolean;
        lowercase: boolean;
        itemAlignment: "Left" | "Right";
        order: "Ascending" | "Descending";
        theme: string;
        customPrimary: number;
        customSecondary: number;
        background: "Off" | "Solid" | "Translucent";
        backgroundAlpha: number;
        glow: "Off" | "Soft" | "Strong";
        shadow: boolean;
        animation: "Slide";
        animationSpeed: number;
        border: "None" | "Accent" | "Item";
    }

    const DEFAULTS: ArrayListSettings = {
        showTags: true,
        lowercase: false,
        itemAlignment: "Right",
        order: "Descending",
        theme: "Blend",
        customPrimary: 0x8c6cff,
        customSecondary: 0x49ead6,
        background: "Translucent",
        backgroundAlpha: 68,
        glow: "Off",
        shadow: false,
        animation: "Slide",
        animationSpeed: 200,
        border: "Accent",
    };

    const GLOBAL_PRIMARY = 0x4677ff;
    const GLOBAL_SECONDARY = 0x49ead6;

    type RenderModule = Module & {
        displayName: string;
        displayTag?: string;
        width: number;
    };

    function withDefaults(raw: Record<string, any>): ArrayListSettings {
        return {...DEFAULTS, ...raw} as ArrayListSettings;
    }

    function rgb(value: number): string {
        return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`;
    }

    function boundedAnimationSpeed(value: number): number {
        return Math.max(50, Math.min(1000, Number(value) || DEFAULTS.animationSpeed));
    }

    function backgroundAlpha(): number {
        const alpha = Math.max(0, Math.min(100, Number(cSettings.backgroundAlpha) || DEFAULTS.backgroundAlpha));
        if (cSettings.background === "Off") return 0;
        return cSettings.background === "Translucent" ? Math.round(alpha * 0.7) : alpha;
    }

    let cSettings = withDefaults(settings);
    let previousSettings = settings;
    let settingsSignature = "";
    let colorTime = Date.now();
    let animationDuration = DEFAULTS.animationSpeed;
    let enabledModules: RenderModule[] = [];

    async function updateEnabledModules() {
        const modules = await getModules();
        const visibleModules = modules.filter(m => m.enabled && !m.hidden);

        const modulesWithWidths: RenderModule[] = visibleModules.map(module => {
            const rawName = $spaceSeperatedNames ? convertToSpacedString(module.name) : module.name;
            const rawTag = module.tag == null ? undefined : String(module.tag);
            const displayName = cSettings.lowercase ? rawName.toLowerCase() : rawName;
            const displayTag = rawTag === undefined
                ? undefined
                : cSettings.lowercase ? rawTag.toLowerCase() : rawTag;
            const fullName = displayTag == null || !cSettings.showTags
                ? displayName
                : `${displayName} ${displayTag}`;

            return {...module, displayName, displayTag, width: getTextWidth(fullName, "500 14px Inter")};
        });

        modulesWithWidths.sort((a, b) => cSettings.order === "Ascending" ? a.width - b.width : b.width - a.width);
        enabledModules = modulesWithWidths;
        await tick();
    }

    $: animationDuration = boundedAnimationSpeed(cSettings.animationSpeed);
    function colorFor(index: number): string {
        return rgb(resolveArrayListColor(
            cSettings.theme as ArrayListThemeName,
            index,
            enabledModules.length,
            colorTime,
            GLOBAL_PRIMARY,
            GLOBAL_SECONDARY,
            cSettings.customPrimary,
            cSettings.customSecondary,
        ));
    }

    $: {
        const nextSignature = JSON.stringify(settings);
        if (nextSignature !== settingsSignature || settings !== previousSettings) {
            settingsSignature = nextSignature;
            previousSettings = settings;
            cSettings = withDefaults(settings);
            void updateEnabledModules();
        }
    }

    spaceSeperatedNames.subscribe(async () => {
        await updateEnabledModules();
    });

    onMount(() => {
        void updateEnabledModules();
        const timer = window.setInterval(() => colorTime = Date.now(), 100);
        return () => window.clearInterval(timer);
    });

    listen("moduleToggle", async () => await updateEnabledModules());
    listen("refreshArrayList", async () => await updateEnabledModules());
</script>

<div class="arraylist" class:align-left={cSettings.itemAlignment === "Left"} class:align-right={cSettings.itemAlignment === "Right"}>
    {#each enabledModules as module, index (module.name)}
        <div
                class="module"
                class:background-off={cSettings.background === "Off"}
                class:background-solid={cSettings.background === "Solid"}
                class:background-translucent={cSettings.background === "Translucent"}
                class:glow-soft={cSettings.glow === "Soft"}
                class:glow-strong={cSettings.glow === "Strong"}
                class:shadow={cSettings.shadow}
                class:border-none={cSettings.border === "None"}
                class:border-accent={cSettings.border === "Accent"}
                class:border-item={cSettings.border === "Item"}
                style={`--arraylist-item-color: ${colorFor(index)}; --arraylist-alpha: ${backgroundAlpha()}%;`}
                animate:flip={{duration: animationDuration}}
                transition:fly={{x: cSettings.itemAlignment === "Right" ? 50 : -50, duration: animationDuration}}
        >
            {module.displayName}
            {#if module.displayTag && cSettings.showTags}
                <span class="tag"> {module.displayTag}</span>
            {/if}
        </div>
    {/each}
</div>

<style lang="scss">
  .arraylist {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;

    &.align-left .module {
      margin-right: auto;
      border-radius: 0 4px 4px 0;
      border-left: none;

      &.border-accent,
      &.border-item {
        border-right: solid 3px var(--arraylist-border-color);
      }

      &.border-item {
        border-right-color: var(--arraylist-item-color);
      }
    }

    &.align-right .module {
      margin-left: auto;
    }
  }

  .module {
    background-color: color-mix(in srgb, var(--arraylist-base-color) var(--arraylist-alpha), transparent);
    color: var(--arraylist-item-color);
    font-size: 14px;
    border-radius: 4px 0 0 4px;
    padding: 5px 8px;
    border-left: solid 3px var(--arraylist-border-color);
    width: max-content;
    font-weight: 500;
    transition: color 160ms ease, background-color 160ms ease, filter 160ms ease;

    &.background-off {
      background-color: transparent;
    }

    &.border-none {
      border-left: none;
    }

    &.border-item {
      border-left-color: var(--arraylist-item-color);
    }

    &.glow-soft {
      filter: drop-shadow(0 0 4px var(--arraylist-glow-color));
    }

    &.glow-strong {
      filter: drop-shadow(0 0 8px var(--arraylist-glow-color));
    }

    &.shadow {
      box-shadow: 0 3px 8px var(--arraylist-shadow-color);
    }
  }

  .tag {
    color: color-mix(in srgb, var(--arraylist-item-color) 55%, var(--arraylist-tag-color));
  }
</style>
