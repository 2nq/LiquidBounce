<script lang="ts">export let compact = false;</script>

<div class="button-container" class:compact>
    <slot />
</div>

<style lang="scss">

    .button-container {
      background-color: var(--menu-button-container-background-color);
      padding: 15px 30px;
      width: max-content;
      border-radius: 5px;
      display: flex;
      column-gap: 20px;
    }
    .button-container.compact {padding:5px; column-gap:3px; align-items:center; border-radius:13px; background:var(--menu-title-elevated-background-color); border:1px solid var(--menu-title-border-color); border-top-color:var(--menu-title-highlight-color); box-shadow:0 10px 28px var(--menu-title-action-shadow-color),inset 0 1px 0 color-mix(in srgb,white 4%,transparent); backdrop-filter:blur(16px);}
</style>
