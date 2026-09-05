<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import TitleButtonIcon from "./TitleButtonIcon.svelte";

    export let title: string;
    export let icon: string;
    const dispatch = createEventDispatcher();
</script>

<div class="main-button">
    <button type="button" class="primary-action" on:click={() => dispatch("click")}>
        <span class="icon"><TitleButtonIcon {icon}/></span>
        <span class="title">{title}</span>
        <span class="arrow" aria-hidden="true">›</span>
    </button>
    {#if $$slots.default}<div class="wrapped-content"><slot/></div>{/if}
</div>

<style lang="scss">

  .main-button {position:relative; width:100%;}
  .primary-action {
    width:100%; min-height:64px; padding:9px 12px;
    display: grid;
    grid-template-columns: 44px 1fr max-content;
    align-items: center;
    cursor: pointer;
    border-radius: 12px; column-gap:12px; text-align:left;
    color:var(--menu-main-button-text-color); background:var(--menu-title-action-background-color);
    border:1px solid var(--menu-title-border-color); border-top-color:var(--menu-title-highlight-color);
    box-shadow:0 5px 14px var(--menu-title-action-shadow-color),inset 0 1px 0 color-mix(in srgb,white 4%,transparent);
    transition:transform 150ms ease,background-color 150ms ease,border-color 150ms ease,box-shadow 150ms ease;

    &:hover {
      transform:translateY(-2px); background:var(--menu-title-action-hover-background-color);
      border-color:color-mix(in srgb,var(--accent-color) 45%,var(--menu-title-border-color));
      box-shadow:0 8px 20px var(--menu-title-action-shadow-color),0 0 18px color-mix(in srgb,var(--accent-color) 9%,transparent),inset 0 1px 0 color-mix(in srgb,white 7%,transparent);
      .icon,.arrow {color:var(--accent-color);}
    }
    &:active {transform:translateY(0) scale(.992);}
    &:focus-visible {outline:2px solid var(--accent-color); outline-offset:2px;}
  }

  .icon {
    color:var(--menu-text-dimmed-color); width:44px; height:44px; border-radius:10px;
    background:var(--menu-title-icon-background-color); border:1px solid color-mix(in srgb,white 5%,transparent);
    transition:color 150ms ease,background-color 150ms ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .title {
    font-size: 16px; color:inherit; font-weight: 550; letter-spacing:-.1px;
  }
  .arrow {font-size:24px; color:#6f7887; padding:0 6px; transition:color 150ms ease,transform 150ms ease;}
  .primary-action:hover .arrow {transform:translateX(2px);}
  .wrapped-content {position:absolute; right:45px; top:50%; transform:translateY(-50%); z-index:2;}
  @media(prefers-reduced-motion:reduce){.primary-action,.icon,.arrow{transition-duration:1ms!important}.primary-action:hover{transform:none}}
</style>
