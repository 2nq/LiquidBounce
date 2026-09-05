<script lang="ts">
    import {onMount, tick} from "svelte";
    import type {Module} from "../../../integration/types";
    import {getModules} from "../../../integration/rest";
    import {listen} from "../../../integration/ws";
    import {getTextWidth} from "../../../integration/text_measurement";
    import {flip} from "svelte/animate";
    import {fly} from "svelte/transition";
    import {quintOut} from "svelte/easing";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import {resolveArrayListColor, type ArrayListThemeName} from "./arraylist_themes";
    import {resolveArrayListGeometry} from "./arraylist_layout";

    export let settings: { [name: string]: any };

    interface ArrayListSettings {
        showTags: boolean;
        lowercase: boolean;
        scale: number;
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
        scale: 1,
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
    let geometry = resolveArrayListGeometry(cSettings.scale);
    let enabledModules: RenderModule[] = [];
    let itemColors: string[] = [];

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

            return {...module, displayName, displayTag, width: getTextWidth(fullName, geometry.fontDeclaration)};
        });

        modulesWithWidths.sort((a, b) => cSettings.order === "Ascending" ? a.width - b.width : b.width - a.width);
        enabledModules = modulesWithWidths;
        await tick();
    }

    $: animationDuration = boundedAnimationSpeed(cSettings.animationSpeed);
    $: geometry = resolveArrayListGeometry(cSettings.scale);
    $: itemColors = enabledModules.map((_, index) => rgb(resolveArrayListColor(
            cSettings.theme as ArrayListThemeName,
            index,
            enabledModules.length,
            colorTime,
            GLOBAL_PRIMARY,
            GLOBAL_SECONDARY,
            cSettings.customPrimary,
            cSettings.customSecondary,
        )));

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
        let frame = 0;
        const animateColors = (now: number) => {
            colorTime = now;
            frame = window.requestAnimationFrame(animateColors);
        };

        frame = window.requestAnimationFrame(animateColors);
        return () => window.cancelAnimationFrame(frame);
    });

    listen("moduleToggle", async () => await updateEnabledModules());
    listen("refreshArrayList", async () => await updateEnabledModules());
</script>

<div
        class="arraylist"
        class:align-left={cSettings.itemAlignment === "Left"}
        class:align-right={cSettings.itemAlignment === "Right"}
        style={`--arraylist-font-size: ${geometry.fontSize}px;
                --arraylist-line-height: ${geometry.lineHeight}px;
                --arraylist-padding-x: ${geometry.paddingX}px;
                --arraylist-padding-y: ${geometry.paddingY}px;
                --arraylist-border-width: ${geometry.borderWidth}px;
                --arraylist-radius: ${geometry.radius}px;
                --arraylist-shadow-y: ${geometry.shadowY}px;
                --arraylist-shadow-blur: ${geometry.shadowBlur}px;
                --arraylist-soft-glow: ${geometry.softGlow}px;
                --arraylist-strong-glow: ${geometry.strongGlow}px;`}
>
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
                style={`--arraylist-item-color: ${itemColors[index] ?? rgb(GLOBAL_PRIMARY)}; --arraylist-alpha: ${backgroundAlpha()}%; --arraylist-content-width: ${module.width}px; --arraylist-animation-duration: ${animationDuration}ms;`}
                animate:flip={{duration: animationDuration, easing: quintOut}}
                transition:fly={{
                    x: cSettings.itemAlignment === "Right" ? geometry.entryOffset : -geometry.entryOffset,
                    duration: animationDuration,
                    easing: quintOut,
                }}
        >
            <span class="module-name">{module.displayName}</span>
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
    gap: 0;
    width: 100%;

    &.align-left .module {
      margin-right: auto;
      border-radius: 0;
      border-left: none;

      &.border-accent,
      &.border-item {
        border-right: solid var(--arraylist-border-width) var(--arraylist-border-color);
      }

      &.border-item {
        border-right-color: var(--arraylist-item-color);
      }
    }

    &.align-right .module {
      margin-left: auto;
      border-radius: 0;
    }

    &.align-left .module:first-child {
      border-radius: 0 4px 0 0;
    }

    &.align-left .module:last-child {
      border-radius: 0 0 4px 0;
    }

    &.align-left .module:only-child {
      border-radius: 0 4px 4px 0;
    }

    &.align-right .module:first-child {
      border-radius: 4px 0 0 0;
    }

    &.align-right .module:last-child {
      border-radius: 0 0 0 4px;
    }

    &.align-right .module:only-child {
      border-radius: 4px 0 0 4px;
    }
  }

  .module {
    box-sizing: content-box;
    background-color: color-mix(in srgb, var(--arraylist-base-color) var(--arraylist-alpha), transparent);
    color: var(--arraylist-tag-color);
    font-size: var(--arraylist-font-size);
    line-height: var(--arraylist-line-height);
    border-radius: 0;
    padding: var(--arraylist-padding-y) var(--arraylist-padding-x);
    border-left: solid var(--arraylist-border-width) var(--arraylist-border-color);
    width: var(--arraylist-content-width);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    transition: width var(--arraylist-animation-duration) cubic-bezier(0.22, 1, 0.36, 1),
                background-color 160ms ease,
                box-shadow 160ms ease;

    &.background-off {
      background-color: transparent;
    }

    &.border-none {
      border-left: none;
    }

    &.border-item {
      border-left-color: var(--arraylist-item-color);
    }

    &.shadow {
      box-shadow: 0 var(--arraylist-shadow-y) var(--arraylist-shadow-blur) var(--arraylist-shadow-color);
    }
  }

  .module-name {
    color: var(--arraylist-item-color);
    transition: text-shadow 160ms ease;
  }

  .module.glow-soft .module-name {
    text-shadow: 0 0 var(--arraylist-soft-glow) var(--arraylist-glow-color);
  }

  .module.glow-strong .module-name {
    text-shadow: 0 0 var(--arraylist-strong-glow) var(--arraylist-glow-color);
  }

  .tag {
    color: var(--arraylist-tag-color);
  }
</style>
