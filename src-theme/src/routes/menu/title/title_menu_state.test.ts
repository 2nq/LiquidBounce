import {describe, expect, it} from "vitest";
import {nextTitleMenuState} from "./title_menu_state";

describe("title menu state", () => {
    it("opens client actions immediately", () => {
        expect(nextTitleMenuState("regular", "open-client")).toBe("client");
    });

    it("returns to regular actions immediately", () => {
        expect(nextTitleMenuState("client", "back")).toBe("regular");
    });
});
