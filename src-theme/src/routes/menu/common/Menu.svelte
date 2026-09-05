<script lang="ts">
    import Header from "./header/Header.svelte";
    import {location} from "svelte-spa-router";
</script>

<div class="menu" class:title={$location === "/title"}>
    <div class="menu-header"><Header/></div>

    <div class="menu-wrapper">
        <slot/>
    </div>
</div>

<style lang="scss">
  .menu {
    padding: 50px;
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .menu.title {
    position: relative;
    isolation: isolate;
    overflow: hidden;
  }

  .menu.title::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    background: var(--menu-title-overlay-background-color);
    backdrop-filter: blur(3px);
    pointer-events: none;
  }

  .menu-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    will-change: transform;
  }
  .menu.title .menu-wrapper {position:relative; z-index:1;}
  .menu-header {position:relative; z-index:5; animation:menu-enter 170ms ease-out both;}
  @keyframes menu-enter {from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
  @media(prefers-reduced-motion:reduce){.menu-header{animation-duration:1ms}}

  @media screen and (max-width: 1366px) {
    .menu {
      zoom: 0.8;
      height: 125vh;
    }
  }

  @media screen and (max-width: 1200px) {
    .menu {
      zoom: 0.5;
      height: 200vh;
    }
  }

  @media screen and (max-height: 1100px) {
    .menu {
      zoom: 0.8;
      height: 125vh;
    }
  }

  @media screen and (max-height: 700px) {
    .menu {
      zoom: 0.5;
      height: 200vh;
    }
  }

  @media screen and (max-height: 540px) {
    .menu {
      zoom: 0.4;
      height: 250vh;
    }
  }

  /* The title screen has its own compact composition and must not inherit the
     legacy menu scaling rules above. */
  .menu.title {
    zoom: 1;
    height: 100vh;
    padding: clamp(20px, 4vh, 42px) clamp(24px, 4vw, 50px);
  }

  @supports not (backdrop-filter: blur(3px)) {
    .menu.title::before {background: color-mix(in srgb, var(--surface-color) 62%, transparent);}
  }
</style>
