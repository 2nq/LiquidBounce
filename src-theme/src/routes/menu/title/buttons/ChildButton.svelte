<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import ToolTip from "../../common/ToolTip.svelte";
    import TitleButtonIcon from "./TitleButtonIcon.svelte";

    export let title: string;
    export let icon: string;
    const dispatch = createEventDispatcher();
</script>

<button type="button" class="child-button" on:click|stopPropagation={() => dispatch("click")}>
    <ToolTip color="var(--menu-base-color)" text="Join Realms server" />

    <div class="icon">
        <TitleButtonIcon {icon} />
    </div>

    <div class="title">{title}</div>
</button>

<style lang="scss">

    .child-button {
      position: relative;
      display: flex;
      align-items: center;
      border-radius:8px; border:1px solid var(--menu-title-border-color);
      background:var(--menu-title-icon-background-color); color:var(--menu-text-dimmed-color);
      transition:background-color 150ms,color 150ms,border-color 150ms,transform 150ms;
      padding:6px 9px; cursor:pointer;

      &:hover {
        background:color-mix(in srgb,var(--accent-color) 13%,var(--menu-title-icon-background-color));
        border-color:color-mix(in srgb,var(--accent-color) 35%,var(--menu-title-border-color));

        .icon {
          color: var(--menu-child-button-icon-hover-color);
        }

        .title {
          color: var(--menu-child-button-hover-text-color);
        }
      }
      &:hover {transform:translateY(-1px);}
      &:active {transform:translateY(0);}
      &:focus-visible {outline:2px solid var(--accent-color);outline-offset:2px;}
    }

    .title {
      color: var(--menu-text-color);
      font-weight: 600;
      font-size: 11px;
      transition: ease color 0.2s;
      margin-left: 10px;
    }

    .icon { /* necessary because svelte's transition system sucks */
      color: var(--menu-child-button-icon-color);
      width: 16px;
      height: 16px;
      transition: ease color 0.2s;
    }
    @media(prefers-reduced-motion:reduce){.child-button{transition-duration:1ms!important}.child-button:hover{transform:none}}
</style>
