<script lang="ts">
    import {onMount} from "svelte";
    import type {ConfigurableSetting as ConfigurableSettingData} from "../../../integration/types";
    import {getGlobalSettings, setGlobalSettings, getModuleSettings, setModuleSettings} from "../../../integration/rest";
    import ConfigurableSetting from "../setting/ConfigurableSetting.svelte";
    import WindowPanel from "./WindowPanel.svelte";
    import ScaledClickGuiContent from "../ScaledClickGuiContent.svelte";
    import RiseSettingsPage from "../rise/RiseSettingsPage.svelte";

    let {embedded = false} = $props<{embedded?: boolean}>();
    let globalSettings = $state<ConfigurableSettingData | null>(null);
    let layout = $state("Rise");
    let layoutError = $state("");
    let changingLayout = $state(false);
    async function changeLayout(next: string) {
        if (changingLayout || next === layout) return;
        changingLayout = true;
        layoutError = "";
        try {
            const settings = await getModuleSettings("ClickGUI");
            const value = settings.value.find(v => v.name === "Layout");
            if (!value) throw new Error("Layout unavailable");
            value.value = next;
            await setModuleSettings("ClickGUI", settings);
            layout = value.value as string;
        } catch {layoutError = "Could not change layout. Please try again.";}
        finally {changingLayout = false;}
    }

    async function fetchGlobalSettings() {
        globalSettings = await getGlobalSettings();
    }

    async function updateGlobalSettings() {
        if (!globalSettings) return;

        await setGlobalSettings($state.snapshot(globalSettings));
        await fetchGlobalSettings();
    }

    onMount(() => {
        fetchGlobalSettings();
        void getModuleSettings("ClickGUI").then(settings => {
            layout = settings.value.find(v => v.name === "Layout")?.value as string ?? "Rise";
        }).catch(() => {layoutError = "Could not load the current layout.";});
    });
</script>

{#snippet settingsContent()}
        <div class="layout-picker">ClickGUI layout
            <div class="layout-buttons" role="group" aria-label="ClickGUI layout">
                <button class:active={layout === "Rise"} aria-pressed={layout === "Rise"} disabled={changingLayout} onclick={() => changeLayout("Rise")}>Rise</button>
                <button class:active={layout === "Panels"} aria-pressed={layout === "Panels"} disabled={changingLayout} onclick={() => changeLayout("Panels")}>Dropdown</button>
            </div>
        </div>
        {#if layoutError}<p role="alert">{layoutError}</p>{/if}
        {#if embedded && globalSettings}
            <RiseSettingsPage settings={globalSettings.value} title="Client Settings" path="clickgui.global" on:change={updateGlobalSettings}/>
        {:else}
        <div class="settings-grid">
            {#if globalSettings}
                {#each globalSettings.value as _, i (globalSettings.value[i].name)}
                    {#if globalSettings.value[i].valueType === "CONFIGURABLE" ||
                    globalSettings.value[i].valueType === "TOGGLEABLE"}
                        <div class="setting-item">
                            <ConfigurableSetting
                                    path="clickgui.global"
                                    bind:setting={globalSettings.value[i]}
                                    hideExpandControl={true}
                                    on:change={updateGlobalSettings}
                            />
                        </div>
                    {/if}
                {/each}
            {/if}
        </div>
        {/if}
{/snippet}
{#if embedded}
    {@render settingsContent()}
{:else}
    <ScaledClickGuiContent><WindowPanel title="Global Settings" icon="client">{@render settingsContent()}</WindowPanel></ScaledClickGuiContent>
{/if}

<style lang="scss">
  .layout-picker {display:flex; align-items:center; justify-content:space-between; gap:16px; padding:16px; margin-bottom:22px; background:#ffffff05; border:1px solid #ffffff0c; border-radius:12px; color:var(--clickgui-text-color); font-size:14px;}
  .layout-buttons {display:flex; gap:4px; padding:4px; background:#101318; border:1px solid #ffffff0c; border-radius:10px;}
  .layout-buttons button {background:transparent; color:#9da6b4; border:0; border-radius:7px; padding:9px 18px; font:inherit; cursor:pointer;}
  .layout-buttons button.active {background:#2a303c; color:var(--accent-color);}
  .layout-buttons button:hover {background:#ffffff0a;}
  .layout-buttons button:disabled {opacity:.5; cursor:wait;}
  .settings-grid {
    column-count: 2;
    column-gap: 25px;
    column-rule: 1px solid var(--clickgui-global-settings-divider-color);
    column-fill: balance;
    overflow: visible;
  }

  @media (max-width: 900px) {
    .settings-grid {
      column-count: 1;
    }
  }

  .setting-item {
    break-inside: avoid;
    display: inline-block;
    width: 100%;
    margin-bottom: 15px;
  }
</style>
