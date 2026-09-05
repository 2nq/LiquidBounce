<script lang="ts">
    import {createEventDispatcher} from "svelte";

    export let title: string;
    export let icon: string;
    export let disabled = false;
    export let compact = false;

    const dispatch = createEventDispatcher();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<button class="icon-text-button" class:compact on:click={() => dispatch("click")} {disabled}>
    <div class="icon">
        <img src="img/menu/{icon}" alt={title}>
    </div>
    <div class="title">{title}</div>
</button>

<style lang="scss">

    .icon-text-button {
      display: flex;
      border: none;

      border-radius: 5px;
      align-items: center;
      overflow: hidden;
      background: linear-gradient(to left, var(--menu-icon-text-button-background-color) 50%, var(--menu-icon-text-button-accent-color) 50%);
      background-size: 200% 100%;
      background-position: right bottom;
      will-change: background-position;
      transition: ease opacity .2s, background-position .2s ease-out;

      &:not([disabled]):hover {
        &:hover {
          background-position: left bottom;
          cursor: pointer;
        }
      }

      &[disabled] {
        opacity: .6;
      }
    }

    .icon {
      height: 58px;
      width: 58px;
      background-color: var(--menu-icon-text-button-icon-background-color);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon img {display:block;max-width:100%;max-height:100%;}

    .title {
      font-size: 20px;
      font-weight: 500;
      color: var(--menu-text-color);
      padding: 0 30px;
    }
    .icon-text-button.compact {height:34px;border-radius:8px;background:transparent;transition:background-color 140ms ease,transform 140ms ease;}
    .icon-text-button.compact:not([disabled]):hover {background:#ffffff0a;transform:translateY(-1px);}
    .icon-text-button.compact:active {transform:translateY(0);}
    .icon-text-button.compact:focus-visible {outline:2px solid var(--accent-color);outline-offset:1px;}
    .icon-text-button.compact .icon {width:34px;height:34px;background:transparent;padding:9px;box-sizing:border-box;flex:0 0 34px;}
    .icon-text-button.compact .title {font-size:10px;padding:0 10px 0 2px;color:var(--menu-text-dimmed-color);}
    @media(prefers-reduced-motion:reduce){.icon-text-button.compact{transition-duration:1ms!important}.icon-text-button.compact:not([disabled]):hover{transform:none}}
</style>
