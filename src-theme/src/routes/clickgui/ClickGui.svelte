<script lang="ts">
    import type {GroupedModules, Module} from "../../integration/types";
    import Panel from "./Panel.svelte";
    import Search from "./Search.svelte";
    import Description from "./Description.svelte";
    import {fade} from "svelte/transition";
    import {onMount} from "svelte";
    import {getModules} from "../../integration/rest";
    import {groupByCategory} from "../../integration/util";
    import {gridSize, requestLayoutReset, showGrid} from "./clickgui_store";
    import ScaledClickGuiContent from "./ScaledClickGuiContent.svelte";

    let categories = $state<GroupedModules>({});
    let modules = $state<Module[]>([]);

    onMount(async () => {
        modules = await getModules();
        categories = groupByCategory(modules);
    });
</script>

<ScaledClickGuiContent>
    <div
            class="clickgui"
            class:grid={$showGrid}
            style="background-size: {$gridSize}px {$gridSize}px;"
            transition:fade|global={{duration: 200}}
    >
        <Description/>
        <div class="toolbar">
            <Search modules={structuredClone($state.snapshot(modules))}/>
            <button class="reset-layout" type="button" onclick={requestLayoutReset}>
                Reset Layout
            </button>
        </div>

        {#each Object.entries(categories) as [category, modules], panelIndex (category)}
            <Panel {category} {modules} {panelIndex}/>
        {/each}
    </div>
</ScaledClickGuiContent>

<style lang="scss">
  .clickgui {
    position: absolute;
    inset: 0;

    &.grid {
      background-image: linear-gradient(to right, var(--clickgui-grid-color) 1px, transparent 1px),
      linear-gradient(to bottom, var(--clickgui-grid-color) 1px, transparent 1px);
    }
  }

  .toolbar {
    position: fixed;
    z-index: 1000000000;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: flex-start;
    gap: 8px;

    :global(.search) {
      position: relative;
      top: 0;
      left: 0;
      transform: none;
    }
  }

  .reset-layout {
    height: 48px;
    padding: 0 14px;
    border: 1px solid var(--clickgui-panel-header-border-color);
    border-radius: 8px;
    background: var(--clickgui-button-background-color);
    color: var(--clickgui-text-color);
    font: 600 12px "Inter", sans-serif;
    cursor: pointer;
    transition: background-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;

    &:hover {
      background: var(--clickgui-button-hover-background-color);
      box-shadow: 0 0 14px color-mix(in srgb, var(--accent-color) 35%, transparent);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
</style>
