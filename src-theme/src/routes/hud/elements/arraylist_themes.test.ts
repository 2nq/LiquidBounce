import {describe, expect, it} from "vitest";
import {
    ARRAYLIST_THEMES,
    interpolateColor,
    riseBlendFactor,
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

    it("uses both custom endpoints during the Rise wave", () => {
        expect(resolveArrayListColor("Custom", 0, 3, -300 * Math.PI, 0, 0, 0x000000, 0xffffff)).toBe(0x000000);
        expect(resolveArrayListColor("Custom", 0, 3, 300 * Math.PI, 0, 0, 0x000000, 0xffffff)).toBe(0xffffff);
    });

    it("Rainbow changes with time", () => {
        expect(resolveArrayListColor("Rainbow", 0, 3, 0, 0, 0, 0, 0))
            .not.toBe(resolveArrayListColor("Rainbow", 0, 3, 3000, 0, 0, 0, 0));
    });

    it("matches the Rise sine wave at the origin", () => {
        expect(riseBlendFactor(0, 0)).toBeCloseTo(0.5, 8);
    });

    it("offsets the Rise wave by row position", () => {
        expect(riseBlendFactor(1, 0)).not.toBeCloseTo(riseBlendFactor(0, 0), 4);
    });

    it("changes preset colors over time", () => {
        expect(resolveArrayListColor("Blend", 0, 3, 0, 0, 0, 0, 0))
            .not.toBe(resolveArrayListColor("Blend", 0, 3, 600, 0, 0, 0, 0));
    });

});
