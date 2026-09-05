export function resolveArrayListScale(value: unknown): number {
    const scale = Number(value);
    return Number.isFinite(scale) ? Math.max(0.5, Math.min(2, scale)) : 1;
}
