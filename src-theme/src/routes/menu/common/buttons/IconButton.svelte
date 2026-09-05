<script lang="ts">
    import ToolTip from "../ToolTip.svelte";
    import {createEventDispatcher} from "svelte";

    export let title: string;
    export let icon: string;
    export let compact = false;

    const dispatch = createEventDispatcher();
</script>

<button type="button" class="icon-button" class:compact on:click={() => dispatch("click")} aria-label={title}>
    <ToolTip text={title}/>

    <div class="icon">
        <img src="img/menu/icon-{icon}.svg" alt={icon}>
    </div>
</button>

<style lang="scss">
  .icon-button {
    position:relative; border:0; padding:0; background:transparent; color:inherit; border-radius:8px; cursor:pointer;
    &:focus-visible {outline:2px solid var(--accent-color);outline-offset:1px;}
  }

  .icon {
    height: 58px;
    width: 58px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .icon-button.compact {transition:background-color 140ms ease,transform 140ms ease;}
  .icon-button.compact:hover {background:#ffffff0a;transform:translateY(-1px);}
  .icon-button.compact:active {transform:translateY(0);}
  .icon-button.compact .icon {width:34px;height:34px;padding:9px;}
  @media(prefers-reduced-motion:reduce){.icon-button.compact{transition-duration:1ms!important}.icon-button.compact:hover{transform:none}}
</style>
