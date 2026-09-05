<script lang="ts">
    export let icon: string;
    export let size: number | null = null;

    $: iconPath = `img/menu/icon-${icon}.svg`;
</script>

<span
        class="title-button-icon"
        class:fixed-size={size !== null}
        aria-hidden="true"
        style={`mask-image: url('${location.origin}${location.pathname}/${iconPath}');${size !== null ? `width:${size}px;height:${size}px;` : ""}`}
>
    <img class="title-button-icon-size" src={iconPath} alt="" />
</span>

<style>
    .title-button-icon {
        display: inline-block;
        background-color: currentColor;
        mask-position: center;
        mask-repeat: no-repeat;
        mask-size: contain;
    }

    .title-button-icon-size {
        display: block;
        visibility: hidden;
    }

    .title-button-icon.fixed-size .title-button-icon-size {
        width: 100%;
        height: 100%;
    }
</style>
