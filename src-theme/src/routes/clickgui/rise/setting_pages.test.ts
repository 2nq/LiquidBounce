import {describe, it, expect} from "vitest";
import {childrenOf, resolvePage} from "./setting_pages";
import type {ModuleSetting} from "../../../integration/types";
const leaf = {name:"Scale", valueType:"FLOAT", value:1} as ModuleSetting;
const group = {name:"ArrayList", valueType:"CONFIGURABLE", value:[leaf]} as ModuleSetting;
describe("setting pages", () => {
    it("resolves children without cloning so edits reach the saved tree", () => {
        expect(resolvePage([group], ["ArrayList"]).settings).toBe(group.value);
    });
    it("truncates removed paths after settings refresh", () => {
        expect(resolvePage([group], ["ArrayList", "Missing"]).path).toEqual(["ArrayList"]);
    });
    it("uses only the active choice branch", () => {
        const choice = {name:"Mode", valueType:"CHOICE", active:"A", choices:{A:{value:[group]}, B:{value:[]}}} as unknown as ModuleSetting;
        expect(childrenOf(choice)).toEqual([group]);
        expect(childrenOf(leaf)).toBeNull();
    });
});
