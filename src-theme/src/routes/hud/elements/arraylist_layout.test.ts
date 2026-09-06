import {describe, expect, it} from "vitest";
import arrayListSource from "./ArrayList.svelte?raw";
import {
    resolveArrayListGeometry,
    resolveArrayListOffset,
    resolveArrayListScale,
    resolveArrayListStepCorners,
} from "./arraylist_layout";

describe("ArrayList offsets", () => {
    it.each([
        [undefined, 0],
        [-5, 0],
        [12.6, 13],
        [150, 100],
    ])("maps %s to %s pixels", (input, expected) => {
        expect(resolveArrayListOffset(input)).toBe(expected);
    });

    it("uses layout spacing instead of a transform", () => {
        expect(arrayListSource).toContain("--arraylist-horizontal-offset");
        expect(arrayListSource).toContain("--arraylist-vertical-offset");
        expect(arrayListSource).toContain("padding-top: var(--arraylist-vertical-offset);");
        expect(arrayListSource).not.toMatch(/transform\s*:/);
    });
});

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

describe("ArrayList background shape", () => {
    it.each([
        [100, undefined, undefined, {top: false, bottom: false}],
        [100, 100, 100, {top: false, bottom: false}],
        [100, 120, 80, {top: false, bottom: true}],
        [80, 60, 100, {top: true, bottom: false}],
        [100, 80, 80, {top: true, bottom: true}],
        [100, 99.8, 99.8, {top: false, bottom: false}],
    ])("rounds the wider row where it meets a shorter row", (width, previous, next, expected) => {
        expect(resolveArrayListStepCorners(width, previous, next)).toEqual(expected);
    });

    it("keeps equal joins square and rounds the wider row at a width step", () => {
        expect(arrayListSource).toContain("gap: 0;");
        expect(arrayListSource).toContain("class:round-step-top");
        expect(arrayListSource).toContain("class:round-step-bottom");
        expect(arrayListSource).toContain("&.round-step-top");
        expect(arrayListSource).toContain("&.round-step-bottom");
        expect(arrayListSource).toContain("border-top-left-radius: var(--arraylist-radius);");
        expect(arrayListSource).toContain("border-bottom-left-radius: var(--arraylist-radius);");
        expect(arrayListSource).toContain("border-top-right-radius: var(--arraylist-radius);");
        expect(arrayListSource).toContain("border-bottom-right-radius: var(--arraylist-radius);");
    });

    it("does not draw interior outlines, horizontal borders, gaps, or overlaps", () => {
        expect(arrayListSource).not.toMatch(/\boutline\s*:/);
        expect(arrayListSource).not.toMatch(/border-(?:top|bottom)\s*:/);
        expect(arrayListSource).not.toMatch(/margin-(?:top|bottom)\s*:\s*-/);
    });
});
