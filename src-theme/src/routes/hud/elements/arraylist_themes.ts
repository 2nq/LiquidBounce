export type ArrayListThemeName =
    | "Global" | "Custom" | "Rainbow"
    | "Aubergine" | "Aqua" | "Banana" | "Blend" | "Blossom" | "Bubblegum"
    | "Candy Cane" | "Cherry" | "Christmas" | "Coral" | "Digital Horizon"
    | "Express" | "Lime Water" | "Lush" | "Halogen" | "Hyper" | "Magic"
    | "May" | "Orange Juice" | "Pastel" | "Pumpkin" | "Satin"
    | "Snowy Sky" | "Steel Fade" | "Sundae" | "Sunkist" | "Water" | "Legacy"
    | "Winter" | "Peony" | "Shadow" | "Wood" | "Creida" | "Creida Two"
    | "Gothic" | "Rue" | "Purple" | "Nord";

export interface ArrayListTheme {
    name: ArrayListThemeName;
    colors: readonly [number, number, number?];
    dynamic?: boolean;
}

export const ARRAYLIST_THEMES: readonly ArrayListTheme[] = [
    {name: "Aubergine", colors: [0xaa076b, 0x61045f]},
    {name: "Aqua", colors: [0xb9faff, 0x4fc7c8]},
    {name: "Banana", colors: [0xfdecb1, 0xffffff]},
    {name: "Blend", colors: [0x4794fd, 0x47fda0]},
    {name: "Blossom", colors: [0xe2d0f9, 0x317773]},
    {name: "Bubblegum", colors: [0xf391d8, 0x98a5f3]},
    {name: "Candy Cane", colors: [0xff0000, 0xffffff]},
    {name: "Cherry", colors: [0xbb377d, 0xfbd3e9]},
    {name: "Christmas", colors: [0xff4040, 0xffffff, 0x40ff40]},
    {name: "Coral", colors: [0xf4a896, 0x348597]},
    {name: "Digital Horizon", colors: [0x5fc3e4, 0xe55d87]},
    {name: "Express", colors: [0xad5389, 0x3c1053]},
    {name: "Lime Water", colors: [0x12fff7, 0xb3ffab]},
    {name: "Lush", colors: [0xa8e063, 0x56ab2f]},
    {name: "Halogen", colors: [0xff416c, 0xff4b2b]},
    {name: "Hyper", colors: [0xec6ead, 0x3494e6]},
    {name: "Magic", colors: [0x4a00e0, 0x8e2de2]},
    {name: "May", colors: [0xee4fee, 0xfddbf5]},
    {name: "Orange Juice", colors: [0xfc4a1a, 0xf7b733]},
    {name: "Pastel", colors: [0xf39bb2, 0xcfc4f3]},
    {name: "Pumpkin", colors: [0xf1a662, 0xffd8a9, 0xe38b2a]},
    {name: "Satin", colors: [0xd73c43, 0x8c1727]},
    {name: "Snowy Sky", colors: [0x01abb3, 0xeaeaea, 0x12e8e8]},
    {name: "Steel Fade", colors: [0x4286f4, 0x373b44]},
    {name: "Sundae", colors: [0xce4a7e, 0x7a2c4d]},
    {name: "Sunkist", colors: [0xf2c94c, 0xf2994a]},
    {name: "Water", colors: [0x0ce8c7, 0x0ca3e8]},
    {name: "Legacy", colors: [0x70ceff, 0x70ceff]},
    {name: "Winter", colors: [0xffffff, 0xffffff]},
    {name: "Peony", colors: [0xe2d0f9, 0xcfabff]},
    {name: "Shadow", colors: [0x6183ff, 0xced4ff]},
    {name: "Wood", colors: [0x4f6d51, 0xaa8b57, 0xf0ebce]},
    {name: "Creida", colors: [0x9fa7e5, 0x37394e]},
    {name: "Creida Two", colors: [0x9acaeb, 0x5983a1]},
    {name: "Gothic", colors: [0x1f1e1e, 0xc4bebe]},
    {name: "Rue", colors: [0xea76b0, 0x1f1e1e]},
    {name: "Purple", colors: [0x524391, 0x7560cf]},
    {name: "Rainbow", colors: [0xff0000, 0xff0000], dynamic: true},
    {name: "Nord", colors: [0x8fbcbb, 0xa3be8c, 0xeceff4]},
];

function clamp(value: number, min = 0, max = 1): number {
    return Math.max(min, Math.min(max, value));
}

const RISE_ROW_SPACING = 12;

export function riseBlendFactor(index: number, now: number): number {
    const y = index * RISE_ROW_SPACING;
    return Math.sin(now / 600 + y * 0.06) * 0.5 + 0.5;
}

export function interpolateColor(a: number, b: number, factor: number): number {
    const t = clamp(factor);
    const ar = (a >> 16) & 0xff;
    const ag = (a >> 8) & 0xff;
    const ab = a & 0xff;
    const br = (b >> 16) & 0xff;
    const bg = (b >> 8) & 0xff;
    const bb = b & 0xff;

    return (Math.round(ar + (br - ar) * t) << 16)
        | (Math.round(ag + (bg - ag) * t) << 8)
        | Math.round(ab + (bb - ab) * t);
}

export function hslToRgb(hue: number, saturation: number, lightness: number): number {
    const channel = (offset: number): number => {
        const k = (offset + hue * 12) % 12;
        const a = saturation * Math.min(lightness, 1 - lightness);
        return lightness - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    };

    return (Math.round(channel(0) * 255) << 16)
        | (Math.round(channel(8) * 255) << 8)
        | Math.round(channel(4) * 255);
}

export function resolveArrayListColor(
    theme: ArrayListThemeName | string,
    index: number,
    count: number,
    now: number,
    globalPrimary: number,
    globalSecondary: number,
    customPrimary: number,
    customSecondary: number,
): number {
    if (theme === "Rainbow") {
        const hue = ((now / 6000) + index / Math.max(1, count)) % 1;
        return hslToRgb(hue < 0 ? hue + 1 : hue, 0.7, 0.62);
    }

    const selected: readonly [number, number, number?] = theme === "Global"
        ? [globalPrimary, globalSecondary]
        : theme === "Custom"
            ? [customPrimary, customSecondary]
            : (ARRAYLIST_THEMES.find(entry => entry.name === theme)?.colors ?? [globalPrimary, globalSecondary]);

    const factor = riseBlendFactor(index, now);
    const [first, second, third] = selected;
    if (third === undefined || factor <= 0.5) {
        return interpolateColor(first, second, third === undefined ? factor : factor * 2);
    }
    return interpolateColor(second, third, (factor - 0.5) * 2);
}
