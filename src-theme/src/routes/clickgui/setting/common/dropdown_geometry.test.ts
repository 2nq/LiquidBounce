import {describe, expect, it} from "vitest";
import {resolveDropdownGeometry} from "./dropdown_geometry";

describe("dropdown geometry", () => {
    it("opens below when enough room is available", () => {
        expect(resolveDropdownGeometry(100, 130, 900, 1)).toEqual({
            openAbove: false,
            maxHeight: 420,
        });
    });

    it("opens above when the lower viewport is too small", () => {
        expect(resolveDropdownGeometry(700, 730, 800, 1)).toEqual({
            openAbove: true,
            maxHeight: 420,
        });
    });

    it("accounts for ClickGUI scale", () => {
        expect(resolveDropdownGeometry(100, 130, 500, 0.5)).toEqual({
            openAbove: false,
            maxHeight: 724,
        });
    });
});
