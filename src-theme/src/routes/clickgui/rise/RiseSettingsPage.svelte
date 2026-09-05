<script lang="ts">
    import {createEventDispatcher, tick} from "svelte";
    import type {ModuleSetting, ChoiceSetting} from "../../../integration/types";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import GenericSetting from "../setting/common/GenericSetting.svelte";
    import Dropdown from "../setting/common/Dropdown.svelte";
    import {childrenOf, resolvePage} from "./setting_pages";
    export let settings: ModuleSetting[];
    export let title: string;
    export let path: string;
    export let hideRootEnabled = false;
    let requested: string[] = [];
    let container: HTMLDivElement;
    const dispatch = createEventDispatcher();
    const label = (name: string) => $spaceSeperatedNames ? convertToSpacedString(name) : name;
    $: page = resolvePage(settings, requested);
    async function navigate(next: string[]) {
        requested = next;
        await tick();
        const scroller = container.closest(".content");
        if (scroller) scroller.scrollTop = 0;
    }
    function changeChoice(setting: ModuleSetting, active: string) {
        (setting as ChoiceSetting).active = active;
        dispatch("change");
    }
</script>

<div class="setting-pages" bind:this={container}>
    <nav class="breadcrumbs" aria-label="Settings path">
        <button type="button" on:click={() => navigate([])}>{label(title)}</button>
        {#each page.path as name, i}
            <span>›</span><button type="button" aria-current={i === page.path.length - 1 ? "page" : undefined}
                on:click={() => navigate(page.path.slice(0, i + 1))}>{label(name)}</button>
        {/each}
    </nav>
    {#key page.path.join(".")}
        {#each page.settings as setting, i (setting.name)}
            {#if !(hideRootEnabled && page.path.length === 0 && setting.name === "Enabled")}
                <div class="setting-row">
                    {#if childrenOf(setting) !== null}
                        {#if setting.valueType === "CHOICE"}
                            <Dropdown name={setting.name} options={Object.keys((setting as ChoiceSetting).choices)}
                                value={(setting as ChoiceSetting).active}
                                on:change={(event) => changeChoice(setting, event.detail)}/>
                        {/if}
                        {#if setting.valueType !== "CHOICE" || childrenOf(setting)?.length}
                            <button type="button" class="group-link" on:click={() => navigate([...page.path, setting.name])}>
                                <span>{setting.valueType === "CHOICE" ? "Configure " + label((setting as ChoiceSetting).active) : label(setting.name)}</span>
                                <span class="group-summary">{childrenOf(setting)?.length} settings <span class="arrow">›</span></span>
                            </button>
                        {/if}
                    {:else}
                        <GenericSetting path={`${path}.${page.path.join(".")}`} bind:setting={page.settings[i]} on:change={() => dispatch("change")}/>
                    {/if}
                </div>
            {/if}
        {/each}
        {#if page.settings.length === 0}<p>No settings in this group.</p>{/if}
    {/key}
</div>

<style>
    .breadcrumbs {display:flex; align-items:center; flex-wrap:wrap; gap:6px; padding:14px 0 18px; border-bottom:1px solid #ffffff0b;}
    button {font:inherit; cursor:pointer; color:#bbc2ce; border:0; background:transparent; border-radius:8px;}
    button:focus-visible {outline:2px solid var(--accent-color);}
    .breadcrumbs button {font-size:12px; padding:6px 8px;}
    .breadcrumbs button:hover {background:#ffffff08; color:#fff;}
    .breadcrumbs button[aria-current="page"] {color:var(--accent-color); background:#ffffff05;}
    .breadcrumbs > span {color:#555e6c;}
    .setting-row {padding:12px 0; border-bottom:1px solid #ffffff0b;}
    .setting-row:last-child {border-bottom:0;}
    .group-link {width:100%; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:14px 12px; text-align:left; background:#ffffff03; font-size:14px;}
    .group-link {box-shadow:inset 0 1px 0 #ffffff07,0 2px 4px #0002; transition:background 160ms,box-shadow 160ms;}
    .group-link:hover {background:#ffffff08; color:#fff; box-shadow:inset 0 1px 0 #ffffff0d,0 3px 8px #0003;}
    .group-summary {display:flex; align-items:center; gap:16px; color:#818b9b; font-size:12px; white-space:nowrap;}
    .arrow {font-size:22px;}
    p {padding:20px 0; color:#818b9b;}
</style>
