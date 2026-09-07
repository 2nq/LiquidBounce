<script lang="ts">
    import {onMount, tick} from "svelte";
    import type {Module} from "../../../integration/types";
    import {getModules, setModuleEnabled, setTyping} from "../../../integration/rest";
    import {listen} from "../../../integration/ws";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import ScaledClickGuiContent from "../ScaledClickGuiContent.svelte";
    import GlobalSettings from "../tabs/GlobalSettings.svelte";
    import HudEditor from "../tabs/hud_editor/HudEditor.svelte";
    import RiseModuleDetails from "./RiseModuleDetails.svelte";
    import {searchModules} from "./rise_search";
    import {setItem} from "../../../integration/persistent_storage";
    import {createScrollMemory, shouldStartSearch} from "./rise_interactions";
    import "./rise-controls.scss";
    let stage: HTMLDivElement;
    let windowElement: HTMLElement;
    let searchInput: HTMLInputElement;
    let contentElement: HTMLDivElement;
    const listScroll = createScrollMemory();
    let x = 0, y = 0;
    let drag: {x: number; y: number; left: number; top: number} | undefined;
    function clampPosition() {
        if (!stage || !windowElement) return;
        const maxX = Math.max(0, (stage.clientWidth - windowElement.offsetWidth) / 2 - 12);
        const maxY = Math.max(0, (stage.clientHeight - windowElement.offsetHeight) / 2 - 12);
        x = Math.max(-maxX, Math.min(maxX, x));
        y = Math.max(-maxY, Math.min(maxY, y));
    }
    function startDrag(event: PointerEvent) {
        if (event.button !== 0) return;
        drag = {x: event.clientX, y: event.clientY, left: x, top: y};
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }
    function moveDrag(event: PointerEvent) {
        if (!drag) return;
        const scale = stage.getBoundingClientRect().width / stage.clientWidth;
        x = drag.left + (event.clientX - drag.x) / scale;
        y = drag.top + (event.clientY - drag.y) / scale;
        clampPosition();
    }
    function endDrag() {
        if (!drag) return;
        drag = undefined;
        void setItem("rise-window-position", JSON.stringify({x, y}));
    }
    onMount(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("rise-window-position") || "{}");
            x = Number.isFinite(saved.x) ? saved.x : 0;
            y = Number.isFinite(saved.y) ? saved.y : 0;
        } catch { /* Ignore outdated stored positions. */ }
        const observer = new ResizeObserver(clampPosition);
        if (stage) observer.observe(stage);
        clampPosition();
        return () => observer.disconnect();
    });

    let modules: Module[] = [];
    let category = "";
    let query = "";
    let selected = "";
    let client = false;
    let hud = false;
    let loading = true;
    let error = "";
    let pending = new Set<string>();
    const iconCategories = new Set(["combat", "movement", "render", "player", "world", "misc", "exploit", "fun", "client"]);
    $: categories = [...new Set(modules.map(m => m.category))];
    $: results = query.trim() ? searchModules(modules, query) : modules.filter(m => m.category === category);
    $: current = modules.find(m => m.name === selected);
    const label = (name: string) => $spaceSeperatedNames ? convertToSpacedString(name) : name;
    async function load() {
        loading = true; error = "";
        try {
            modules = await getModules();
            if (!modules.some(m => m.category === category)) category = modules[0]?.category ?? "";
            if (selected && !modules.some(m => m.name === selected)) selected = "";
        } catch { error = "Could not load modules. Check the client connection."; }
        finally { loading = false; }
    }
    async function toggle(module: Module) {
        if (pending.has(module.name)) return;
        pending = new Set([...pending, module.name]);
        try { await setModuleEnabled(module.name, !module.enabled); }
        catch { error = `Could not toggle ${module.name}.`; }
        finally { pending.delete(module.name); pending = new Set(pending); }
    }
    function openModuleSettings(name: string) {
        listScroll.capture(contentElement);
        selected = name;
    }
    async function returnToModules() {
        selected = "";
        await tick();
        listScroll.restore(contentElement);
    }
    async function handleWindowKeyDown(event: KeyboardEvent) {
        if (hud || client || current || !shouldStartSearch(event, event.target as HTMLElement | null)) return;
        event.preventDefault();
        query += event.key;
        await tick();
        searchInput?.focus();
    }
    function navigate(next: string) {category = next; selected = ""; query = ""; client = false;}
    onMount(() => {void load(); return () => {void setTyping(false);};});
    listen("moduleToggle", e => {modules = modules.map(m => m.name === e.moduleName ? {...m, enabled:e.enabled} : m);});
    listen("socketReady", load);
</script>

<svelte:window on:keydown={handleWindowKeyDown}/>

{#if hud}
    <HudEditor/>
    <button class="return" on:click={() => hud = false}>← Back to ClickGUI</button>
{:else}
<ScaledClickGuiContent>
    <div class="stage" bind:this={stage}>
        <section class="rise" bind:this={windowElement} style:transform={`translate(${x}px, ${y}px)`} aria-label="LiquidBounce ClickGUI">
            <button class="drag-handle" aria-label="Drag window; double-click to centre" title="Drag to move · Double-click to centre"
                on:pointerdown={startDrag} on:pointermove={moveDrag} on:pointerup={endDrag} on:pointercancel={endDrag}
                on:dblclick={() => {x = 0; y = 0; void setItem("rise-window-position", JSON.stringify({x, y}));}}><span></span></button>
            <aside>
                <div class="brand">LB<span>LiquidBounce</span></div>
                <input aria-label="Search modules" placeholder="Search modules…" bind:value={query} bind:this={searchInput}
                    on:input={() => {selected = ""; client = false;}}
                    on:focus={() => setTyping(true)} on:blur={() => setTyping(false)}/>
                <nav aria-label="Categories">
                    {#each categories as name}
                        <button class:active={!client && !query && category === name} on:click={() => navigate(name)}>
                            <span class="category-icon">{#if iconCategories.has(name.toLowerCase())}<img src={`img/clickgui/icon-${name.toLowerCase()}.svg`} alt=""/>{:else}{name.slice(0, 1)}{/if}</span>{name}
                        </button>
                    {/each}
                </nav>
                <div class="utilities">
                    <button on:click={() => hud = true}>▦ <span>HUD Editor</span></button>
                    <button class:active={client} on:click={() => {client = true; selected = ""; query = "";}}>⚙ <span>Client Settings</span></button>
                </div>
                <small>LIQUIDBOUNCE · RISE LAYOUT</small>
            </aside>
            <main>
                <header>
                    {#if current && !client}
                        <button class="back" aria-label="Back to modules" on:click={returnToModules}>←</button>
                    {/if}
                    <div>
                        <h1>{client ? "Client Settings" : current ? label(current.name) : query.trim() ? "Search results" : category || "Modules"}</h1>
                        <p>{client ? "Make the client your own." : current ? current.description : "Left-click to toggle · Right-click to configure"}</p>
                    </div>
                    {#if current && !client}<button class="state" class:enabled={current.enabled} disabled={pending.has(current.name)} on:click={() => current && toggle(current)}>{current.enabled ? "Enabled" : "Disabled"}</button>{/if}
                </header>
                <div class="content" bind:this={contentElement}>
                    {#if error}<p role="alert">{error} <button on:click={load}>Retry</button></p>{/if}
                    {#if client}<GlobalSettings embedded/>
                    {:else if current}
                        {#key current.name}<RiseModuleDetails module={current}/>{/key}
                    {:else if loading}<p class="empty">Loading modules…</p>
                    {:else}
                        {#each results as module (module.name)}
                            <div class="module-row" class:enabled={module.enabled}>
                                <button class="module-toggle" disabled={pending.has(module.name)} on:click={() => toggle(module)}
                                    on:contextmenu|preventDefault={() => openModuleSettings(module.name)}>
                                    <span class="module-copy"><strong>{label(module.name)}</strong><span>{module.description}</span></span>
                                    <span class="indicator" aria-label={module.enabled ? "Enabled" : "Disabled"}></span>
                                </button>
                                <button class="details" aria-label={`Configure ${module.name}`} on:click={() => openModuleSettings(module.name)}>›</button>
                            </div>
                        {:else}<p class="empty">No modules found.</p>{/each}
                    {/if}
                </div>
            </main>
        </section>
    </div>
</ScaledClickGuiContent>
{/if}

<style lang="scss">
    .rise {position:relative;}
    .drag-handle {position:absolute; top:0; left:0; width:100%; height:24px; cursor:grab; touch-action:none; display:grid; place-items:center; z-index:2;}
    .drag-handle:active {cursor:grabbing;}
    .drag-handle span {width:36px; height:3px; border-radius:3px; background:#ffffff20;}
    .stage {position:absolute; inset:0; display:grid; place-items:center; padding:24px;}
    .rise {width:min(1180px,100%); height:min(780px,100%); display:grid; grid-template-columns:230px minmax(0,1fr); background:#15181ef5; color:#ededf0; border:1px solid #ffffff0e; border-radius:28px; box-shadow:0 22px 80px #05070db3; overflow:hidden;
        --clickgui-button-background-color:#252932; --clickgui-dropdown-trigger-background-color:#252932;
        --clickgui-module-settings-background-color:transparent; --clickgui-setting-group-border-color:#ffffff16;
    }
    .rise {border-top-color:#ffffff18; border-left-color:#ffffff14; box-shadow:0 28px 80px #05070d99,0 6px 18px #0005,inset 0 1px 0 #ffffff05;}
    aside {padding:24px 14px 16px; margin:6px; background:#101318; display:flex; flex-direction:column; min-height:0; border:1px solid #ffffff07; border-top-color:#ffffff13; border-left-color:#ffffff10; border-radius:23px; box-shadow:8px 0 24px #0003,inset 0 1px 0 #ffffff04;}
    .brand {font-size:40px; font-weight:600; letter-spacing:-3px; margin:0 10px 28px; display:flex; align-items:center; gap:14px;}
    .brand span {font-size:12px; letter-spacing:0; color:#989da7;}
    input {width:100%; padding:13px; background:#242830; border:1px solid transparent; border-radius:12px; color:inherit; font:inherit; font-size:13px; margin-bottom:20px;}
    input:focus {border-color:var(--accent-color);}
    input {box-shadow:inset 0 1px 3px #0004,0 1px 0 #ffffff04;}
    nav {overflow:auto; min-height:0; flex:1;}
    button {font:inherit; border:0; color:inherit; cursor:pointer; background:transparent; transition:background 180ms,color 180ms;}
    button:focus-visible {outline:2px solid var(--accent-color); outline-offset:-2px;}
    button:disabled {opacity:.5; cursor:wait;}
    nav button,.utilities button {display:flex; align-items:center; gap:14px; padding:13px 12px; width:100%; text-align:left; color:#a3a6ad; border-radius:12px; margin:3px 0; font-size:15px;}
    button:hover,nav button.active,.utilities button.active {background:#ffffff07; color:#fff;}
    nav button.active,.utilities button.active {background:#22262e; box-shadow:inset 0 1px 0 #ffffff0c,inset 1px 0 0 #ffffff05,0 3px 8px #0003;}
    .category-icon {width:23px; font-size:13px; color:var(--accent-color); font-weight:600;}
    .category-icon img {width:20px; height:20px; object-fit:contain; opacity:.75;}
    .utilities {padding-top:14px; border-top:1px solid #ffffff0a;}
    small {font-size:9px; color:#626872; margin:20px 10px 0; letter-spacing:.6px;}
    main {display:flex; flex-direction:column; min-width:0; min-height:0; padding:34px 34px 0;}
    header {display:flex; align-items:center; gap:16px; padding-bottom:26px; flex-shrink:0;}
    header div {min-width:0; flex:1;}
    h1 {font-size:27px; font-weight:500; letter-spacing:-.7px;}
    header p {color:#8a909b; font-size:13px; margin-top:8px; line-height:1.6;}
    .content {overflow:auto; min-height:0; padding:0 8px 30px 0; flex:1;}
    .module-row {display:flex; border-bottom:1px solid #ffffff08; border-radius:10px; margin:3px 0; background:#10131866;}
    .module-row {box-shadow:inset 0 1px 0 #ffffff05; transition:background 160ms,box-shadow 160ms;}
    .module-row:hover {background:#191e26; box-shadow:inset 0 1px 0 #ffffff0a,0 3px 8px #0002;}
    .module-toggle {display:flex; flex:1; min-width:0; align-items:center; gap:20px; padding:18px 20px; text-align:left; border-radius:10px;}
    .module-copy {display:flex; flex:1; min-width:0; flex-direction:column; gap:6px;}
    strong {font-size:16px; font-weight:500;}
    .module-copy>span {font-size:12px; color:#828894; line-height:1.5;}
    .enabled strong {color:var(--accent-color);}
    .indicator {width:8px; height:8px; border-radius:50%; background:#353a44; flex-shrink:0;}
    .enabled .indicator {background:var(--accent-color); box-shadow:0 0 10px color-mix(in srgb,var(--accent-color) 25%,transparent);}
    .details {width:42px; font-size:25px; color:#777f8c; border-radius:10px;}
    .back {font-size:24px; width:38px; height:38px; border-radius:10px;}
    .state {font-size:12px; padding:10px 14px; border-radius:9px; background:#252932;}
    .state.enabled {color:var(--accent-color);}
    .state {box-shadow:inset 0 1px 0 #ffffff0b,0 3px 8px #0003;}
    .empty {padding:30px 10px; color:#8a909b;}
    .return {position:fixed; top:15px; left:50%; transform:translateX(-50%); z-index:100; padding:12px 20px; border-radius:10px; background:#15181e; color:white;}
    @media(max-width:750px) {.rise {grid-template-columns:175px minmax(0,1fr);} aside {padding:20px 10px;} main {padding:24px 18px 0;} .brand span {display:none;}}
</style>
