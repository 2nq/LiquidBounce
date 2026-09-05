import {describe, expect, it} from "vitest";
import arrayListSource from "./ArrayList.svelte?raw";
import {resolveArrayListScale, resolveArrayListZoom} from "./arraylist_layout";

describe("ArrayList scale", () => {
    it.each([
        [undefined, 1],
        [0.25, 0.5],
        [1.25, 1.25],
        [3, 2],
    ])("maps %s to %s", (input, expected) => {
        expect(resolveArrayListScale(input)).toBe(expected);
    });

    it("does not create a CSS zoom context at the native scale", () => {
        expect(resolveArrayListZoom(undefined)).toBeUndefined();
        expect(resolveArrayListZoom(1)).toBeUndefined();
        expect(resolveArrayListZoom("1")).toBeUndefined();
    });

    it("keeps CSS zoom for intentional non-native scales", () => {
        expect(resolveArrayListZoom(0.25)).toBe(0.5);
        expect(resolveArrayListZoom(1.25)).toBe(1.25);
        expect(resolveArrayListZoom(3)).toBe(2);
    });
});

describe("ArrayList row sizing", () => {
    it("keeps the measured text width as content width", () => {
        expect(arrayListSource).toContain("box-sizing: content-box;");
    });
});
