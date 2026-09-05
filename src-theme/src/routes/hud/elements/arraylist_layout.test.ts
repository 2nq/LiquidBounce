import {describe, expect, it} from "vitest";
import arrayListSource from "./ArrayList.svelte?raw";
import {resolveArrayListGeometry, resolveArrayListScale} from "./arraylist_layout";

describe("ArrayList scale", () => {
    it.each([
        [undefined, 1],
        [0.25, 0.5],
        [1.25, 1.25],
        [3, 2],
    ])("maps %s to %s", (input, expected) => {
        expect(resolveArrayListScale(input)).toBe(expected);
    });

    it("resolves native dimensions at scale 1", () => {
        expect(resolveArrayListGeometry(1)).toEqual({
            scale: 1,
            fontSize: 14,
            lineHeight: 17,
            paddingX: 8,
            paddingY: 5,
            borderWidth: 3,
            radius: 5,
            shadowY: 3,
            shadowBlur: 8,
            softGlow: 4,
            strongGlow: 8,
            entryOffset: 16,
            fontDeclaration: "500 14px Inter",
        });
    });

    it("resolves final fractional dimensions without visual zoom", () => {
        expect(resolveArrayListGeometry(1.25)).toEqual({
            scale: 1.25,
            fontSize: 17.5,
            lineHeight: 21.25,
            paddingX: 10,
            paddingY: 6.25,
            borderWidth: 3.75,
            radius: 6.25,
            shadowY: 3.75,
            shadowBlur: 10,
            softGlow: 5,
            strongGlow: 10,
            entryOffset: 20,
            fontDeclaration: "500 17.5px Inter",
        });
    });
});

describe("ArrayList row sizing", () => {
    it("keeps the measured text width as content width", () => {
        expect(arrayListSource).toContain("box-sizing: content-box;");
    });

    it("renders and measures text at its final size", () => {
        expect(arrayListSource).not.toContain("style:zoom");
        expect(arrayListSource).not.toContain("resolveArrayListZoom");
        expect(arrayListSource).not.toContain("will-change");
        expect(arrayListSource).toContain("geometry.fontDeclaration");
        expect(arrayListSource).toContain("--arraylist-font-size");
        expect(arrayListSource).toContain("--arraylist-line-height");
        expect(arrayListSource).toContain("--arraylist-padding-x");
        expect(arrayListSource).toContain("--arraylist-padding-y");
    });
});
