export function resolveArrayListScale(value: unknown): number {
    const scale = Number(value);
    return Number.isFinite(scale) ? Math.max(0.5, Math.min(2, scale)) : 1;
}

/**
 * Avoids creating a persistent compositing context when the ArrayList is rendered
 * at its native size. Chromium can otherwise keep text on a scaled transparent
 * layer, which softens glyphs when the HUD browser is composited over the game.
 */
export function resolveArrayListZoom(value: unknown): number | undefined {
    const scale = resolveArrayListScale(value);
    return scale === 1 ? undefined : scale;
}
