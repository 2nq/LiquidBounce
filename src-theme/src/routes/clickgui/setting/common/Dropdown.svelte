<script lang="ts">
    import {createEventDispatcher, tick} from "svelte";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../../theme/theme_config";
    import {resolveDropdownGeometry} from "./dropdown_geometry";

    export let name: string | null;
    export let options: string[];
    export let value: string;

    const dispatch = createEventDispatcher();

    let expanded = false;
    let dropdownHead: HTMLElement;
    let optionsElement: HTMLElement | undefined;
    let optionsStyle = "";
    let rise = false;

    function portal(node: HTMLElement) {
        document.body.appendChild(node);

        return {
            destroy: () => node.remove()
        };
    }

    function windowClickHide(e: MouseEvent) {
        const target = e.target as Node;
        if (!dropdownHead.contains(target) && !optionsElement?.contains(target)) {
            expanded = false;
        }
    }

    function windowScrollHide(e: Event) {
        if (optionsElement?.contains(e.target as Node)) {
            return;
        }

        expanded = false;
    }

    function updateValue(v: string) {
        value = v;
        expanded = false;
        dispatch("change", v);
    }

    async function toggleExpanded() {
        rise = !!dropdownHead.closest(".rise");
        expanded = !expanded;
        if (!expanded) {
            return;
        }

        await tick();
        updateOptionsPosition();
    }

    function updateOptionsPosition() {
        if (!expanded) {
            return;
        }

        const bounds = dropdownHead.getBoundingClientRect();
        const scale = bounds.width / dropdownHead.offsetWidth;
        const geometry = resolveDropdownGeometry(bounds.top, bounds.bottom, window.innerHeight, scale);
        const verticalPosition = geometry.openAbove
            ? `bottom: ${window.innerHeight - bounds.top}px`
            : `top: ${bounds.bottom}px`;
        optionsStyle = [
            `left: ${bounds.left}px`,
            verticalPosition,
            `width: ${dropdownHead.offsetWidth}px`,
            `--dropdown-scale: ${scale}`,
            `--dropdown-max-height: ${geometry.maxHeight}px`,
            `--dropdown-transform-origin: ${geometry.openAbove ? "bottom left" : "top left"}`,
        ].join(";");
    }

</script>

<svelte:window
        on:click={windowClickHide}
        on:resize={updateOptionsPosition}
        on:scroll|capture={windowScrollHide}
/>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="dropdown" class:expanded>
    <div class="head" bind:this={dropdownHead} on:click={toggleExpanded}>
        {#if name !== null}
            <span class="text">{$spaceSeperatedNames ? convertToSpacedString(name) : name}
                &bull; {$spaceSeperatedNames ? convertToSpacedString(value) : value}</span>
        {:else}
            <span class="text">{$spaceSeperatedNames ? convertToSpacedString(value) : value}</span>
        {/if}
    </div>

    {#if expanded}
        <div class="options" class:rise-options={rise} style={optionsStyle} bind:this={optionsElement} use:portal>
            {#each options as o (o)}
                <div
                        class="option"
                        class:active={o === value}
                        on:click={() => updateValue(o)}
                >
                    {$spaceSeperatedNames ? convertToSpacedString(o) : o}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
  @use "../../icon-settings-expand" as *;
  .options.rise-options {
    background:#20252e; border:1px solid #ffffff12; border-radius:10px;
    padding:6px; box-shadow:0 12px 32px #0006;
    &::-webkit-scrollbar {width:6px;}
    &::-webkit-scrollbar-thumb {background:#626b7b66; border-radius:20px;}
    .option {font-family:Inter,sans-serif; text-align:left; padding:10px 12px; border-radius:6px; color:#bbc2ce;}
    .option:hover {background:#ffffff09; color:#fff;}
    .option.active {background:color-mix(in srgb,var(--accent-color) 14%,transparent); color:var(--accent-color);}
  }
  .dropdown {
    position: relative;

    &.expanded {
      .text::after {
        transform: translateY(-50%) rotate(0);
        opacity: 1;
      }

      .head {
        border-radius: 3px 3px 0 0;
      }
    }
  }

  .head {
    background-color: var(--clickgui-dropdown-trigger-background-color);
    padding: 6px 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    position: relative;
    border-radius: 3px;
    transition: ease border-radius .2s;

    .text {
      font-weight: 500;
      color: var(--clickgui-text-color);
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 20px;
    }

    .text::after {
      @include icon-settings-expand();
    }
  }

  .options {
    --dropdown-scale: 1;

    padding: 6px 10px;
    background-color: var(--clickgui-dropdown-background-color);
    border: solid 1px var(--clickgui-dropdown-border-color);
    border-top: none;
    border-radius: 0 0 3px 3px;
    z-index: 999999;
    position: fixed;
    box-sizing: border-box;
    transform: scale(var(--dropdown-scale));
    transform-origin: var(--dropdown-transform-origin, top left);
    max-height: var(--dropdown-max-height, 420px);
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;

    .option {
      color: var(--clickgui-dropdown-option-color);
      font-weight: 500;
      font-size: 12px;
      padding: 5px 0;
      cursor: pointer;
      text-align: center;
      transition: ease color 0.2s;

      &:hover {
        color: var(--clickgui-dropdown-option-hover-color);
      }

      &.active {
        color: var(--clickgui-dropdown-option-selected-color);
      }
    }
  }
</style>
