# ArrayList Themes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar a ArrayList configurável, com lowercase, efeitos visuais, cores customizadas e os 39 presets inspirados nos temas do Rise.

**Architecture:** Extrair os presets e o cálculo de cor para um módulo TypeScript puro. `ArrayList.svelte` continuará a obter módulos/configuração pela integração existente, mas delegará texto, ordenação e cor ao novo módulo; o componente HUD apenas aplica classes/variáveis CSS por item.

**Tech Stack:** Svelte 5, TypeScript, SCSS, Vite, stores Svelte e configuração de componentes HUD em JSON.

---

### Task 1: Definir temas e resolução de cor

**Files:**
- Create: `src-theme/src/routes/hud/elements/arraylist_themes.ts`
- Test: `src-theme/src/routes/hud/elements/arraylist_themes.test.ts`
- Modify: `src-theme/package.json`
- Modify: `src-theme/package-lock.json`

- [ ] **Step 1: Criar os tipos e o catálogo de temas**

Criar um módulo sem dependências de Svelte:

```ts
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
```

Preencher todas as 39 entradas com os valores RGB do enum `Themes.java`, preservando os nomes de apresentação. Não copiar classes, métodos ou assets do Rise; apenas os valores de cor como dados.

- [ ] **Step 2: Implementar interpolação e Rainbow**

Adicionar funções puras para interpolar duas/três cores e resolver uma cor por índice:

```ts
export function interpolateColor(a: number, b: number, factor: number): number {
    const t = Math.max(0, Math.min(1, factor));
    const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
    const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
    return (Math.round(ar + (br - ar) * t) << 16)
        | (Math.round(ag + (bg - ag) * t) << 8)
        | Math.round(ab + (bb - ab) * t);
}

export function resolveArrayListColor(
    theme: ArrayListThemeName,
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
        return hslToRgb(hue, 0.7, 0.62);
    }

    const selected = theme === "Global"
        ? [globalPrimary, globalSecondary] as const
        : theme === "Custom"
            ? [customPrimary, customSecondary] as const
            : (ARRAYLIST_THEMES.find(entry => entry.name === theme)?.colors ?? [globalPrimary, globalSecondary]);

    const factor = count <= 1 ? 0 : index / (count - 1);
    const [first, second, third] = selected;
    if (third === undefined || factor <= 0.5) {
        return interpolateColor(first, second, third === undefined ? factor : factor * 2);
    }
    return interpolateColor(second, third, (factor - 0.5) * 2);
}
```

Adicionar também uma implementação pura de `hslToRgb(hue, saturation, lightness)` no mesmo módulo. Deve devolver um inteiro RGB sem alpha:

```ts
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
```

Para `Global`, os dois argumentos vêm das cores de acento/tint atuais.

- [ ] **Step 3: Escrever testes puros antes de integrar o componente**

Em `arraylist_themes.test.ts`, usar Vitest e cobrir pelo menos:

```ts
import { describe, expect, it } from "vitest";
import { interpolateColor, resolveArrayListColor } from "./arraylist_themes";

describe("ArrayList theme colors", () => {
    it("interpolates RGB endpoints", () => {
        expect(interpolateColor(0x000000, 0xffffff, 0)).toBe(0x000000);
        expect(interpolateColor(0x000000, 0xffffff, 1)).toBe(0xffffff);
    });

    it("resolves a custom gradient across the list", () => {
        expect(resolveArrayListColor("Custom", 0, 3, 0, 0, 0, 0x000000, 0xffffff)).toBe(0x000000);
        expect(resolveArrayListColor("Custom", 2, 3, 0, 0, 0, 0x000000, 0xffffff)).toBe(0xffffff);
    });

    it("Rainbow changes with time", () => {
        expect(resolveArrayListColor("Rainbow", 0, 3, 0, 0, 0, 0, 0))
            .not.toBe(resolveArrayListColor("Rainbow", 0, 3, 3000, 0, 0, 0, 0));
    });
});

```

Adicionar Vitest como dependência de desenvolvimento e o script `"test:unit": "vitest run"` em `src-theme/package.json` com:

```powershell
npm install --save-dev vitest
```

Depois de instalar, acrescentar no objeto `scripts`:

```json
"test:unit": "vitest run"
```

Não duplicar a lógica de cor num segundo ficheiro de teste.

- [ ] **Step 4: Validar os testes da unidade**

Run: `npm run test:unit && npm run check` (a partir de `src-theme`)

Expected: o novo módulo e os tipos compilam sem erros.

- [ ] **Step 5: Commit**

```powershell
git add src-theme/src/routes/hud/elements/arraylist_themes.ts src-theme/src/routes/hud/elements/arraylist_themes.test.ts
git commit -m "feat(arraylist): add Rise-inspired theme palette resolver"
```

### Task 2: Estender a configuração persistida do componente

**Files:**
- Modify: `src-theme/public/components/arraylist.json`
- Modify: `src-theme/src/routes/hud/components.d.ts`

- [ ] **Step 1: Atualizar o schema JSON sem remover valores antigos**

Manter `ShowTags`, `ItemAlignment` e `Order`, e adicionar os valores abaixo com defaults compatíveis com o design:

```json
{
  "type": "BOOLEAN", "name": "Lowercase", "value": false
}
```

Adicionar `Theme=Blend` como `CHOOSE` com as 39 opções de `ArrayListThemeName`, `CustomPrimary=0xff8c6cff` e `CustomSecondary=0xff49ead6` como `COLOR`, `Background=Translucent` como `CHOOSE` (`Off`, `Solid`, `Translucent`), `BackgroundAlpha=68` como `INT` com range `0..100`, `Glow=Off` como `CHOOSE` (`Off`, `Soft`, `Strong`), `Shadow=false` como `BOOLEAN`, `Animation=Slide` como `CHOOSE` (`Slide`), `AnimationSpeed=200` como `INT` com range `50..1000` e `Border=Accent` como `CHOOSE` (`None`, `Accent`, `Item`). O schema deve continuar a carregar configurações antigas que não tenham estes campos.

- [ ] **Step 2: Alinhar `HudArrayListSettings`**

Em `components.d.ts`, substituir a interface curta por:

```ts
interface HudArrayListSettings {
    showTags: boolean;
    lowercase: boolean;
    itemAlignment: "Left" | "Right";
    order: "Ascending" | "Descending";
    theme: string;
    customPrimary: number;
    customSecondary: number;
    background: "Off" | "Solid" | "Translucent";
    backgroundAlpha: number;
    glow: "Off" | "Soft" | "Strong";
    shadow: boolean;
    animation: "Slide";
    animationSpeed: number;
    border: "None" | "Accent" | "Item";
}
```

Usar fallback em runtime para todos os campos, pois `settings` pode vir de uma configuração gravada antes desta versão.

- [ ] **Step 3: Validar schema/tipos**

Run: `npm run check` (a partir de `src-theme`)

Expected: nenhum erro de TypeScript/Svelte.

- [ ] **Step 4: Commit**

```powershell
git add src-theme/public/components/arraylist.json src-theme/src/routes/hud/components.d.ts
git commit -m "feat(arraylist): expose appearance settings"
```

### Task 3: Integrar texto, cores, efeitos e animações no renderer

**Files:**
- Modify: `src-theme/src/routes/hud/elements/ArrayList.svelte`
- Modify: `src-theme/src/colors.scss`

- [ ] **Step 1: Normalizar settings antigos e texto apresentado**

Criar defaults no início do componente:

```ts
const DEFAULTS: HudArrayListSettings = {
    showTags: true,
    lowercase: false,
    itemAlignment: "Right",
    order: "Descending",
    theme: "Blend",
    customPrimary: 0x8c6cff,
    customSecondary: 0x49ead6,
    background: "Translucent",
    backgroundAlpha: 68,
    glow: "Off",
    shadow: false,
    animation: "Slide",
    animationSpeed: 200,
    border: "Accent",
};

function withDefaults(raw: Record<string, any>): HudArrayListSettings {
    return {...DEFAULTS, ...raw} as HudArrayListSettings;
}
```

Ao montar cada item, aplicar `toLowerCase()` apenas quando `cSettings.lowercase` for verdadeiro e manter o cálculo de largura baseado no texto final, incluindo tag se ativada.

- [ ] **Step 2: Resolver cor por item**

Importar `resolveArrayListColor` e mapear o resultado para CSS RGB:

```ts
function rgb(value: number): string {
    return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`;
}
```

No `each`, passar `style:background-color`, `style:--arraylist-item-color`, `style:--arraylist-glow-color` e a classe do modo de fundo/efeito. O índice deve corresponder à lista já ordenada.

- [ ] **Step 3: Aplicar fundo, barra e efeitos sem shaders novos**

Em `colors.scss`, adicionar variáveis sem remover as atuais:

```scss
--arraylist-background-solid-color: color-mix(in srgb, var(--arraylist-base-color) var(--arraylist-alpha), transparent);
--arraylist-glow-color: var(--arraylist-item-color);
--arraylist-shadow-color: color-mix(in srgb, black 65%, transparent);
```

No componente, usar `background: transparent` para `Off`, alpha configurado para `Solid`/`Translucent`, `box-shadow` apenas nos modos de glow/shadow e a barra lateral conforme `border`. Limitar o glow a `filter: drop-shadow`/`box-shadow` para preservar performance.

- [ ] **Step 4: Preservar e parametrizar animações**

Manter `animate:flip`, mas trocar o `duration: 200` fixo pelo valor limitado de `AnimationSpeed` entre `50` e `1000`. Manter `fly` para entrada e aplicar a mesma duração para saída. Quando `Animation=Slide`, usar `x` dependente do alinhamento; a opção está preparada para modos futuros sem mudar o schema.

- [ ] **Step 5: Validar o tema**

Run: `npm run check && npm run build` (a partir de `src-theme`)

Expected: ambos terminam com exit code `0`.

- [ ] **Step 6: Commit**

```powershell
git add src-theme/src/routes/hud/elements/ArrayList.svelte src-theme/src/colors.scss
git commit -m "feat(arraylist): add configurable colors and effects"
```

### Task 4: Regressão manual e instalação da build

**Files:**
- Test: cliente LiquidBounce usando os assets compilados de `src-theme/dist`

- [ ] **Step 1: Verificar configurações antigas**

Carregar um perfil que só tenha `ShowTags`, `ItemAlignment` e `Order`; confirmar que a ArrayList aparece e recebe `Blend`/defaults sem erro.

- [ ] **Step 2: Verificar todos os grupos de opções**

Testar `Lowercase`, tags, esquerda/direita, ordem, pelo menos três presets, `Rainbow`, `Custom`, os três fundos, glow, shadow, barra e velocidade de animação.

- [ ] **Step 3: Verificar módulos em tempo real**

Ativar/desativar módulos e confirmar que a entrada, saída, largura, ordenação e cor atualizam sem duplicar itens nem perder tags.

- [ ] **Step 4: Construir o cliente**

Run: `./gradlew.bat build` (raiz do fork)

Expected: o `.jar` remapeado é criado em `build/libs` e inclui os assets `src-theme/dist`.

- [ ] **Step 5: Documentar as novas opções**

Atualizar o README com os nomes das novas opções da ArrayList e executar:

```powershell
git add README.md
git commit -m "docs(arraylist): document theme and effect settings"
```
