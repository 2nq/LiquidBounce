export function resolveArrayListScale(value: unknown): number {
    const scale = Number(value);
    return Number.isFinite(scale) ? Math.max(0.5, Math.min(2, scale)) : 1;
}

export interface ArrayListGeometry {
    scale: number;
    fontSize: number;
    lineHeight: number;
    paddingX: number;
    paddingY: number;
    borderWidth: number;
    radius: number;
    shadowY: number;
    shadowBlur: number;
    softGlow: number;
    strongGlow: number;
    entryOffset: number;
    fontDeclaration: string;
}

export function resolveArrayListGeometry(value: unknown): ArrayListGeometry {
    const scale = resolveArrayListScale(value);
    const scaled = (pixels: number) => pixels * scale;
    const fontSize = scaled(14);

    return {
        scale,
        fontSize,
        lineHeight: scaled(17),
        paddingX: scaled(8),
        paddingY: scaled(5),
        borderWidth: scaled(3),
        radius: scaled(5),
        shadowY: scaled(3),
        shadowBlur: scaled(8),
        softGlow: scaled(4),
        strongGlow: scaled(8),
        entryOffset: scaled(16),
        fontDeclaration: `500 ${fontSize}px Inter`,
    };
}
