import {describe, expect, it} from "vitest";
import {createScrollMemory, shouldStartSearch} from "./rise_interactions";

describe("shouldStartSearch", () => {
    it("accepts an unmodified printable character", () => {
        expect(shouldStartSearch({key: "v", ctrlKey: false, altKey: false, metaKey: false}, null)).toBe(true);
    });

    it("rejects shortcuts", () => {
        expect(shouldStartSearch({key: "v", ctrlKey: true, altKey: false, metaKey: false}, null)).toBe(false);
        expect(shouldStartSearch({key: "v", ctrlKey: false, altKey: true, metaKey: false}, null)).toBe(false);
        expect(shouldStartSearch({key: "v", ctrlKey: false, altKey: false, metaKey: true}, null)).toBe(false);
    });

    it("rejects editable targets", () => {
        expect(shouldStartSearch({key: "v", ctrlKey: false, altKey: false, metaKey: false}, {tagName: "INPUT"})).toBe(false);
        expect(shouldStartSearch({key: "v", ctrlKey: false, altKey: false, metaKey: false}, {isContentEditable: true})).toBe(false);
    });

    it("rejects non-printable keys", () => {
        expect(shouldStartSearch({key: "Enter", ctrlKey: false, altKey: false, metaKey: false}, null)).toBe(false);
    });
});

describe("createScrollMemory", () => {
    it("restores the captured list position", () => {
        const memory = createScrollMemory();
        const scroller = {scrollTop: 284};

        memory.capture(scroller);
        scroller.scrollTop = 0;
        memory.restore(scroller);

        expect(scroller.scrollTop).toBe(284);
    });
});
