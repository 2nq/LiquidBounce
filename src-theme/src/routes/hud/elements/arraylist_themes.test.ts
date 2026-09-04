import {describe, expect, it} from "vitest";
import {
    ARRAYLIST_THEMES,
    interpolateColor,
    resolveArrayListColor,
} from "./arraylist_themes";

describe("ArrayList theme colors", () => {
    it("contains all Rise-inspired presets", () => {
        expect(ARRAYLIST_THEMES).toHaveLength(39);
        expect(ARRAYLIST_THEMES.map(theme => theme.name)).toContain("Blend");
        expect(ARRAYLIST_THEMES.map(theme => theme.name)).toContain("Nord");
    });

    it("interpolates RGB endpoints", () => {
        expect(interpolateColor(0x000000, 0xffffff, 0)).toBe(0x000000);
        expect(interpolateColor(0x000000, 0xffffff, 1)).toBe(0xffffff);
    });

    it("resolves a custom gradient across the list", () => {
        expect(resolveArrayListColor("Custom", 0, 3, 0, 0, 0, 0x000000, 0xffffff)).toBe(0x000000);
        expect(resolveArrayListColor("Custom", 2, 3, 0, 0, 0, 0x000000, 0xffffff)).toBe(0xffffff);
    });

    it("Rainbow changes with time", () => {
        expect(resolveArrayListColor("Rainbow", 0, 3, 0, 0, 0, 0, 0))
            .not.toBe(resolveArrayListColor("Rainbow", 0, 3, 3000, 0, 0, 0, 0));
    });
});
