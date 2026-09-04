export interface DropdownGeometry {
    openAbove: boolean;
    maxHeight: number;
}

export function resolveDropdownGeometry(
    triggerTop: number,
    triggerBottom: number,
    viewportHeight: number,
    scale: number,
    preferredMaxHeight = 420,
    viewportMargin = 8,
): DropdownGeometry {
    const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
    const roomBelow = Math.max(0, viewportHeight - triggerBottom - viewportMargin);
    const roomAbove = Math.max(0, triggerTop - viewportMargin);
    const openAbove = roomBelow < preferredMaxHeight && roomAbove > roomBelow;
    const visualRoom = openAbove ? roomAbove : roomBelow;

    return {
        openAbove,
        maxHeight: Math.max(80, Math.min(preferredMaxHeight, visualRoom) / safeScale),
    };
}
