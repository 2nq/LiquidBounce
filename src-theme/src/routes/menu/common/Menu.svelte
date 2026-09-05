<script lang="ts">
    import Header from "./header/Header.svelte";
</script>

<div class="menu">
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

  .menu-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    will-change: transform;
  }
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
</style>
