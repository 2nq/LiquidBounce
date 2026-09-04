<script lang="ts">
    import {onMount} from "svelte";
    import type {Module as TModule} from "../../integration/types";
    import {listen} from "../../integration/ws";
    import Module from "./Module.svelte";
    import type {KeyboardKeyEvent, ModuleToggleEvent} from "../../integration/events";
    import {fade} from "svelte/transition";
    import {quintOut} from "svelte/easing";
    import {
        gridSize,
        highlightModuleName,
        layoutReset,
        maxPanelZIndex,
        scaleFactor,
        showGrid,
        snappingEnabled
    } from "./clickgui_store";
    import {setItem} from "../../integration/persistent_storage";

    export let category: string;
    export let modules: TModule[];
    export let panelIndex: number;

    let panelElement: HTMLElement;
    let modulesElement: HTMLElement;
    let expandButtonElement: HTMLElement;

    let moving = false;
    let offsetX = 0;
    let offsetY = 0;

    let scrollPositionSaveTimeout: number | undefined;

    let ignoreGrid = false;

    interface PanelConfig {
        top: number;
        left: number;
        expanded: boolean;
        scrollTop: number;
        zIndex: number;
    }

    function clamp(number: number, min: number, max: number) {
        return Math.max(min, Math.min(number, max));
    }

    const INITIAL_PANEL_WIDTH = 250;
    const INITIAL_PANEL_GAP = 16;
    const INITIAL_PANEL_MARGIN = 24;
    const INITIAL_PANEL_ROW_HEIGHT = 120;

    function initialPanelPosition(index: number): { top: number; left: number } {
        const viewportWidth = typeof document === "undefined"
            ? 960
            : document.documentElement.clientWidth;
        const availableWidth = viewportWidth * (2 / $scaleFactor);
        const columns = Math.max(
            1,
            Math.floor((availableWidth - INITIAL_PANEL_MARGIN * 2 + INITIAL_PANEL_GAP) /
                (INITIAL_PANEL_WIDTH + INITIAL_PANEL_GAP))
        );

        return {
            left: INITIAL_PANEL_MARGIN + (index % columns) * (INITIAL_PANEL_WIDTH + INITIAL_PANEL_GAP),
            top: INITIAL_PANEL_MARGIN + Math.floor(index / columns) * INITIAL_PANEL_ROW_HEIGHT,
        };
    }

    const panelConfig = loadPanelConfig();

    function loadPanelConfig(): PanelConfig {
        const localStorageItem = localStorage.getItem(
            `clickgui.panel.${category}`,
        );

        if (!localStorageItem) {
            const position = initialPanelPosition(panelIndex);
            return {
                top: position.top,
                left: position.left,
                expanded: false,
                scrollTop: 0,
                zIndex: 0
            };
        } else {
            const config: PanelConfig = JSON.parse(localStorageItem);

            // Migration
            if (!config.zIndex) {
                config.zIndex = 0;
            }

            if (config.zIndex > $maxPanelZIndex) {
                $maxPanelZIndex = config.zIndex;
            }

            return config;
        }
    }

    async function savePanelConfig() {
        await setItem(
            `clickgui.panel.${category}`,
            JSON.stringify(panelConfig),
        );
    }

    function fixPosition() {
        panelConfig.left = clamp(panelConfig.left, 0, document.documentElement.clientWidth * (2 / $scaleFactor) - panelElement.offsetWidth);
        panelConfig.top = clamp(panelConfig.top, 0, document.documentElement.clientHeight * (2 / $scaleFactor) - panelElement.offsetHeight);
    }

    function onMouseDown(e: MouseEvent) {
        if (e.button !== 0 && e.button !== 1) return;

        moving = true;
        offsetX = e.clientX * (2 / $scaleFactor) - panelConfig.left;
        offsetY = e.clientY * (2 / $scaleFactor) - panelConfig.top;
        panelConfig.zIndex = ++$maxPanelZIndex;

        $showGrid = $snappingEnabled && !expandButtonElement.contains(e.target as HTMLElement);
    }

    function onMouseMove(e: MouseEvent) {
        if (moving) {
            const newLeft = (e.clientX * (2 / $scaleFactor) - offsetX);
            const newTop = (e.clientY * (2 / $scaleFactor) - offsetY);

            panelConfig.left = snapToGrid(newLeft);
            panelConfig.top = snapToGrid(newTop);

            fixPosition();
        }
    }

    function onMouseUp() {
        if (moving) {
            savePanelConfig();
        }
        moving = false;
        $showGrid = false;
    }

    function toggleExpanded() {
        panelConfig.expanded = !panelConfig.expanded;

        fixPosition();
        savePanelConfig();
    }

    function handleModulesScroll() {
        panelConfig.scrollTop = modulesElement.scrollTop;

        if (scrollPositionSaveTimeout !== undefined) {
            clearTimeout(scrollPositionSaveTimeout);
        }
        scrollPositionSaveTimeout = setTimeout(() => {
            savePanelConfig();
        }, 500)
    }

    highlightModuleName.subscribe((name) => {
        const highlightModule = modules.find(
            (m) => m.name === name,
        );
        if (highlightModule) {
            panelConfig.zIndex = ++$maxPanelZIndex;
            panelConfig.expanded = true;
            savePanelConfig();
        }
    });

    listen("moduleToggle", (e: ModuleToggleEvent) => {
        const moduleName = e.moduleName;
        const moduleEnabled = e.enabled;

        const mod = modules.find((m) => m.name === moduleName);
        if (!mod) return;

        mod.enabled = moduleEnabled;
        modules = modules;
    });

    onMount(() => {
        if (!modulesElement) {
            return unsubscribeLayoutReset;
        }

        modulesElement.scrollTo({
            top: panelConfig.scrollTop,
            behavior: "smooth"
        });

        return unsubscribeLayoutReset;
    });

    listen("keyboardKey", (e: KeyboardKeyEvent) => {
        if (e.key === "key.keyboard.left.shift") {
            ignoreGrid = e.action === 1;
        }
    });

    function snapToGrid(value: number): number {
        if (ignoreGrid || !$snappingEnabled) return value;

        return Math.round(value / $gridSize) * $gridSize;
    }

    let receivedLayoutReset = false;
    const unsubscribeLayoutReset = layoutReset.subscribe(() => {
        if (!receivedLayoutReset) {
            receivedLayoutReset = true;
            return;
        }

        const position = initialPanelPosition(panelIndex);
        panelConfig.left = position.left;
        panelConfig.top = position.top;
        panelConfig.zIndex = panelIndex;
        fixPosition();
        savePanelConfig();
    });
</script>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove}/>

<div
        class="panel"
        style="left: {panelConfig.left}px; top: {panelConfig.top}px; z-index: {panelConfig.zIndex};"
        bind:this={panelElement}
        transition:fade|global={{duration: 200, easing: quintOut}}
>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
            class="title"
            on:mousedown={onMouseDown}
            on:contextmenu|preventDefault={toggleExpanded}
    >
        <img
                class="icon"
                src="img/clickgui/icon-{category.toLowerCase()}.svg"
                alt="icon"
        />
        <span class="category">{category}</span>

        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button class="expand-toggle" on:click={toggleExpanded} bind:this={expandButtonElement}>
            <div class="icon" class:expanded={panelConfig.expanded}></div>
        </button>
    </div>

    <div
            class="modules"
            class:expanded={panelConfig.expanded}
            on:scroll={handleModulesScroll}
            bind:this={modulesElement}
    >
        {#each modules as {name, enabled, description, aliases} (name)}
            <Module {name} {enabled} {description} {aliases}/>
        {/each}
    </div>
</div>

<style lang="scss">

  .panel {
    border-radius: 6px;
    width: 250px;
    position: absolute;
    overflow: hidden;
    box-shadow: 0 0 10px var(--clickgui-panel-shadow-color);
    will-change: transform;
    transition: none;
    user-select: none;
  }

  .title {
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    align-items: center;
    column-gap: 10px;
    min-height: 40px;
    background-color: var(--clickgui-panel-header-background-color);
    border-bottom: solid 1px var(--clickgui-panel-header-border-color);
    padding: 8px 12px;
    cursor: grab;
    transition: background-color 160ms ease, border-color 160ms ease;

    &:hover {
      background-color: color-mix(in srgb, var(--clickgui-panel-header-background-color) 90%, var(--accent-color));
    }

    .category {
      font-size: 14px;
      color: var(--clickgui-text-color);
      font-weight: 500;
    }
  }

  .modules {
    transition: max-height 300ms ease;
    scroll-behavior: smooth;
    max-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: var(--clickgui-panel-body-background-color);
    scrollbar-color: var(--accent-color) transparent;

    &.expanded {
      max-height: 545px;
    }

    &::-webkit-scrollbar {
      width: 2px;
      height: 2px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 2px;
    }
  }

  .expand-toggle {
    background-color: transparent;
    border: none;
    cursor: pointer;

    .icon {
      height: 12px;
      width: 12px;
      position: relative;

      &::before {
        content: "";
        position: absolute;
        background-color: var(--clickgui-panel-toggle-icon-color);
        transition: transform 0.4s ease-out;
        top: 0;
        left: 50%;
        width: 2px;
        height: 100%;
        margin-left: -1px;
      }

      &::after {
        content: "";
        position: absolute;
        background-color: var(--clickgui-panel-toggle-icon-color);
        transition: transform 0.4s ease-out;
        top: 50%;
        left: 0;
        width: 100%;
        height: 2px;
        margin-top: -1px;
      }

      &.expanded {
        &::before {
          transform: rotate(90deg);
        }

        &::after {
          transform: rotate(180deg);
        }
      }
    }
  }
</style>
