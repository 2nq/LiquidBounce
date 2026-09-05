<script lang="ts">
    import MainButton from "./buttons/MainButton.svelte";
    import ChildButton from "./buttons/ChildButton.svelte";
    import ConfettiBackground from "./ConfettiBackground.svelte";
    import ButtonContainer from "../common/buttons/ButtonContainer.svelte";
    import IconTextButton from "../common/buttons/IconTextButton.svelte";
    import IconButton from "../common/buttons/IconButton.svelte";
    import {
        browse,
        exitClient,
        getClientUpdate,
        openScreen,
        toggleBackgroundShaderEnabled
    } from "../../../integration/rest";
    import {fly} from "svelte/transition";
    import {onMount} from "svelte";
    import {notification} from "../common/header/notification_store";
    import {isAnniversary} from "../../../util/utils";
    import {nextTitleMenuState, type TitleMenuState} from "./title_menu_state";

    let menuState: TitleMenuState = "regular";

    onMount(() => {
        setTimeout(async () => {
            const clientUpdate = await getClientUpdate();

            if (clientUpdate.update) {
                notification.set({
                    title: `LiquidBounce ${clientUpdate.update.clientVersion} has been released!`,
                    message: `Download it from liquidbounce.net!`,
                    error: false,
                    delay: 99999999
                });
            }
        }, 2000);
    });

    function toggleButtons() {
        menuState = nextTitleMenuState(menuState, menuState === "regular" ? "open-client" : "back");
    }
</script>

<div class="title-screen">
    {#if isAnniversary()}
        <ConfettiBackground/>
    {/if}

    <div class="content">
        <section class="command-panel" aria-label="Main menu">
        <div class="intro">
            <span>LiquidBounce client</span>
            <h1>{menuState === "regular" ? "Choose where to go" : "Client tools"}</h1>
            <p>{menuState === "regular" ? "Your world, servers and client settings." : "Manage the client or return to the main menu."}</p>
        </div>
        <div class="main-buttons">
            {#key menuState}
            <div class="button-set" in:fly|global={{duration: 160, y: 8}}>
            {#if menuState === "regular"}
                <MainButton title="Singleplayer" icon="singleplayer"
                            on:click={() => openScreen("singleplayer")}/>

                <MainButton title="Multiplayer" icon="multiplayer"
                            on:click={() => openScreen("multiplayer")}>
                    <ChildButton title="Realms" icon="realms"
                                 on:click={() => openScreen("multiplayer_realms")}/>
                </MainButton>
                <MainButton title="LiquidBounce" icon="liquidbounce" on:click={toggleButtons}/>
                <MainButton title="Options" icon="options" on:click={() => openScreen("options")}/>
            {:else}
                <MainButton title="Proxy Manager" icon="proxymanager" on:click={() => openScreen("proxymanager")}
                            />
                <MainButton title="Click GUI" icon="clickgui" on:click={() => openScreen("clickgui")}/>
                <!-- <MainButton title="Scripts" icon="scripts" index={2}/> -->
                <MainButton title="Back" icon="back-large" on:click={toggleButtons}/>
            {/if}
            </div>
            {/key}
        </div>
        </section>

        <div class="additional-buttons" transition:fly|global={{duration: 700, y: 100}}>
            <ButtonContainer>
                <IconTextButton icon="icon-exit.svg" title="Exit" on:click={exitClient}/>
                <IconTextButton icon="icon-change-background.svg" title="Toggle Shader"
                                on:click={toggleBackgroundShaderEnabled}/>
            </ButtonContainer>
        </div>

        <div class="social-buttons" transition:fly|global={{duration: 700, y: 100}}>
            <ButtonContainer>
                <IconButton title="Forum" icon="nodebb" on:click={() => browse("MAINTAINER_FORUM")}/>
                <IconButton title="GitHub" icon="github" on:click={() => browse("MAINTAINER_GITHUB")}/>
                <IconButton title="Discord" icon="discord" on:click={() => browse("MAINTAINER_DISCORD")}/>
                <IconButton title="Twitter" icon="twitter" on:click={() => browse("MAINTAINER_TWITTER")}/>
                <IconButton title="YouTube" icon="youtube" on:click={() => browse("MAINTAINER_YOUTUBE")}/>
                <IconTextButton title="liquidbounce.net" icon="icon-liquidbounce.net.svg"
                                on:click={() => browse("CLIENT_WEBSITE")}/>
            </ButtonContainer>
        </div>
    </div>
</div>

<style>
    .title-screen {
        position: relative;
        isolation: isolate;
        display: flex;
        flex: 1;
        flex-direction: column;
    }

    .content {
        flex:1; min-height:0; position:relative; display:grid; place-items:center;
    }

    .command-panel {width:min(430px,calc(100vw - 64px)); padding:27px 28px 30px; border-radius:20px;
        background:var(--menu-title-panel-background-color); border:1px solid var(--menu-title-border-color);
        border-top-color:var(--menu-title-highlight-color); border-left-color:color-mix(in srgb,white 10%,transparent);
        box-shadow:0 26px 70px var(--menu-title-panel-shadow-color),0 7px 18px #0005,inset 0 1px 0 color-mix(in srgb,white 5%,transparent);
        backdrop-filter:blur(18px);}
    .intro {padding:1px 3px 20px;}
    .intro span {font-size:9px; text-transform:uppercase; letter-spacing:1.35px; color:var(--accent-color); font-weight:650;}
    .intro h1 {font-size:25px; line-height:1.1; letter-spacing:-.75px; color:var(--menu-text-color); font-weight:560; margin:8px 0 7px;}
    .intro p {font-size:11px; line-height:1.5; color:var(--menu-text-dimmed-color); margin:0;}

    .main-buttons {
        display: flex;
        flex-direction: column;
        flex-direction:column;
    }

    .button-set {display:flex; flex-direction:column; gap:8px;}

    .additional-buttons {
        position:absolute; left:0; bottom:0;
    }

    .social-buttons {
        position:absolute; right:0; bottom:0;
    }
    @media(max-height:720px){.command-panel{padding:20px 22px 22px}.intro{padding-bottom:13px}.button-set{gap:6px}}
    @media(prefers-reduced-motion:reduce){.button-set{animation:none!important}}
</style>
