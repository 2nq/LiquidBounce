<script lang="ts">
    import {onMount} from "svelte";
    import type {Module, ConfigurableSetting} from "../../../integration/types";
    import {getModuleSettings, setModuleSettings} from "../../../integration/rest";
    import RiseSettingsPage from "./RiseSettingsPage.svelte";
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
        <RiseSettingsPage settings={configurable.value} title={module.name} path={`clickgui.${module.name}`} hideRootEnabled on:change={save}/>
    </fieldset>
{:else if !error}<p>Loading settings…</p>{/if}

<style>
    fieldset {border:1px solid #ffffff06; border-top-color:#ffffff13; border-left-color:#ffffff10; border-radius:18px; background:#101319; box-shadow:0 8px 24px #0003,inset 0 1px 0 #ffffff03; min-width:0; width:100%; max-width:660px; padding:8px 22px; margin:0 auto;}
    p {color:var(--clickgui-text-dimmed-color); padding:20px 0;}
    button {cursor:pointer;}
</style>
