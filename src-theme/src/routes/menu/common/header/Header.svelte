<script lang="ts">
    import LiquidBounceLogo from "../../../../components/LiquidBounceLogo.svelte";
    import Account from "./account/Account.svelte";
    import Notifications from "./Notifications.svelte";
    import {listen} from "../../../../integration/ws";
    import {location} from "svelte-spa-router";
    import type {
        AccountManagerAdditionEvent,
        AccountManagerLoginEvent,
        AccountManagerMessageEvent
    } from "../../../../integration/events";
    import {notification} from "./notification_store";

    listen("accountManagerAddition", (e: AccountManagerAdditionEvent) => {
        if (!e.error) {
            notification.set({
                title: "AltManager",
                message: `Successfully added account ${e.username}`,
                error: false
            });
        } else {
            notification.set({
                title: "AltManager",
                message: e.error,
                error: true
            });
        }
    });

    listen("accountManagerMessage", (e: AccountManagerMessageEvent) => {
        notification.set({
            title: "AltManager",
            message: e.message,
            error: false
        });
    });

    listen("accountManagerLogin", (e: AccountManagerLoginEvent) => {
        if (!e.error) {
            notification.set({
                title: "AltManager",
                message: `Successfully logged in to account ${e.username}`,
                error: false
            });
        } else {
            notification.set({
                title: "AltManager",
                message: e.error,
                error: true
            });
        }
    });
</script>

<div class="header" class:title={$location === "/title"}>
    <div class="logo-wrapper">
        {#if $location === "/title"}
            <div class="title-brand"><strong>LB</strong><span>LiquidBounce</span></div>
        {:else}
            <div class="logo visible">
                <LiquidBounceLogo
                        width="261.263px"
                        height="98px"
                        badgeFill="var(--accent-color)"
                />
            </div>
        {/if}
    </div>

    <Notifications/>

    <Account/>
</div>

<style lang="scss">
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 60px;
    align-items: center;
  }
  .header.title {margin-bottom:0; min-height:54px;}
  .title-brand {display:flex; align-items:center; gap:10px; color:var(--menu-text-color);}
  .title-brand strong {font-size:38px; line-height:1; font-weight:720; letter-spacing:-2.5px;}
  .title-brand span {font-size:11px; color:var(--menu-text-dimmed-color); font-weight:600;}

  .logo-wrapper {
    display: grid;
  }

  .logo {
    grid-area: 1 / 1;
    opacity: 0;
    pointer-events: none;
    transition: opacity .5s ease;

    &.visible {
      opacity: 1;
    }
  }
</style>
