import type {Module} from "../../../integration/types";

const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, "");

export function searchModules(modules: Module[], query: string): Module[] {
    const term = normalize(query);
    if (!term) return modules;
    return modules.map(module => {
        const name = normalize(module.name);
        const aliases = module.aliases.map(normalize);
        const rank = name.startsWith(term) ? 0 : aliases.some(a => a.startsWith(term)) ? 1
            : name.includes(term) || aliases.some(a => a.includes(term)) ? 2 : 3;
        return {module, rank};
    }).filter(item => item.rank < 3).sort((a, b) => a.rank - b.rank).map(item => item.module);
}
