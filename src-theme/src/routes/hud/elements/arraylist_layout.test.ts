import {describe, expect, it} from "vitest";
import arrayListSource from "./ArrayList.svelte?raw";
import {resolveArrayListScale} from "./arraylist_layout";

describe("ArrayList scale", () => {
    it.each([
        [undefined, 1],
        [0.25, 0.5],
        [1.25, 1.25],
        [3, 2],
    ])("maps %s to %s", (input, expected) => {
        expect(resolveArrayListScale(input)).toBe(expected);
    });
});

describe("ArrayList row sizing", () => {
    it("keeps the measured text width as content width", () => {
        expect(arrayListSource).toContain("box-sizing: content-box;");
    });
});
