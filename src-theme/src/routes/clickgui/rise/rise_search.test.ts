import {describe, expect, it} from "vitest";
import type {Module} from "../../../integration/types";
import {searchModules} from "./rise_search";

const make = (name: string, aliases: string[] = []) => ({name, aliases}) as Module;
describe("Rise module search", () => {
    it("ranks name prefixes ahead of aliases and substrings", () => {
        const modules = [make("AutoSprint"), make("Run", ["Sprint"]), make("Sprint")];
        expect(searchModules(modules, "SPRINT").map(m => m.name)).toEqual(["Sprint", "Run", "AutoSprint"]);
    });
    it("accepts spaced names and returns no unrelated results", () => {
        expect(searchModules([make("InventoryMove"), make("Fly")], "inventory move").map(m => m.name)).toEqual(["InventoryMove"]);
    });
});
