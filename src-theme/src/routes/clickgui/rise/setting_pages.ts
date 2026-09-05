import type {ModuleSetting, ChoiceSetting} from "../../../integration/types";

export function childrenOf(setting: ModuleSetting): ModuleSetting[] | null {
    if (setting.valueType === "CHOICE") {
        const choice = setting as ChoiceSetting;
        return (choice.choices[choice.active]?.value as ModuleSetting[] | undefined) ?? [];
    }
    if (setting.valueType === "CONFIGURABLE" || setting.valueType === "TOGGLEABLE") {
        return setting.value as ModuleSetting[];
    }
    return null;
}

export function resolvePage(root: ModuleSetting[], requested: string[]) {
    let settings = root;
    const path: string[] = [];
    for (const name of requested) {
        const group = settings.find(setting => setting.name === name);
        const children = group && childrenOf(group);
        if (!children) break;
        path.push(name);
        settings = children;
    }
    return {settings, path};
}
