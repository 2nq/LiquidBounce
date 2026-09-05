<script lang="ts">
    import {onMount} from "svelte";
    import type {Module, ConfigurableSetting} from "../../../integration/types";
    import {getModuleSettings, setModuleSettings} from "../../../integration/rest";
    import GenericSetting from "../setting/common/GenericSetting.svelte";
    export let module: Module;
    let configurable: ConfigurableSetting | undefined;
    let error = "";
    let saving = false;
    async function load() {
        error = "";
        try { configurable = await getModuleSettings(module.name); }
        catch { error = "Could not load settings."; }
    }
    async function save() {
        if (!configurable || saving) return;
        saving = true;
        error = "";
        const enabled = configurable.value.find(setting => setting.name === "Enabled");
        if (enabled) enabled.value = module.enabled;
        try { await setModuleSettings(module.name, configurable); await load(); }
        catch { error = "Could not save settings. Try again."; }
        finally { saving = false; }
    }
    onMount(load);
</script>

{#if error}<p role="alert">{error} <button on:click={load}>Retry</button></p>{/if}
{#if configurable}
    <fieldset disabled={saving}>
        {#each configurable.value as setting (setting.name)}
            {#if setting.name !== "Enabled"}
                <div class="setting-row"><GenericSetting path={`clickgui.${module.name}`} bind:setting on:change={save}/></div>
            {/if}
        {/each}
    </fieldset>
{:else if !error}<p>Loading settings…</p>{/if}

<style>
    fieldset {border:0; min-width:0; padding:0;}
    .setting-row {padding:12px 0; border-bottom:1px solid #ffffff0d;}
    p {color:var(--clickgui-text-dimmed-color); padding:20px 0;}
    button {cursor:pointer;}
</style>
