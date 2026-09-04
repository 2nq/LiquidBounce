# Neon ClickGUI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o ClickGUI Nextgen existente num layout Neon alinhado, arrastável e visualmente consistente sem alterar a lógica de módulos.

**Architecture:** Manter a implementação Svelte atual e as integrações REST/WebSocket. O layout inicial será calculado no `Panel.svelte`, o pedido de reposição será um contador no store partilhado, e o acabamento visual ficará nos componentes ClickGUI e nas variáveis de `colors.scss`.

**Tech Stack:** Svelte 5, TypeScript, SCSS, Vite, integração REST/WebSocket do tema LiquidBounce.

---

### Task 1: Adicionar reset de layout e posições iniciais determinísticas

**Files:**
- Modify: `src-theme/src/routes/clickgui/clickgui_store.ts`
- Modify: `src-theme/src/routes/clickgui/Panel.svelte`
- Modify: `src-theme/src/routes/clickgui/ClickGui.svelte`

- [ ] **Step 1: Criar o sinal de reposição no store**

Em `clickgui_store.ts`, acrescentar:

```ts
export const layoutReset = writable(0);

export function requestLayoutReset(): void {
    layoutReset.update(value => value + 1);
}
```

- [ ] **Step 2: Fazer o `Panel` calcular uma posição inicial em grelha**

Substituir o default atual `top: panelIndex * 50 + 20, left: 20` por uma função determinística que use o índice, a largura do painel e o espaçamento:

```ts
const INITIAL_PANEL_WIDTH = 250;
const INITIAL_PANEL_GAP = 16;
const INITIAL_PANEL_MARGIN = 24;
const INITIAL_PANEL_ROW_HEIGHT = 120;

function initialPanelPosition(index: number): { top: number; left: number } {
    const availableWidth = document.documentElement.clientWidth * (2 / $scaleFactor);
    const columns = Math.max(
        1,
        Math.floor((availableWidth - INITIAL_PANEL_MARGIN * 2 + INITIAL_PANEL_GAP) /
            (INITIAL_PANEL_WIDTH + INITIAL_PANEL_GAP))
    );

    return {
        left: INITIAL_PANEL_MARGIN + (index % columns) * (INITIAL_PANEL_WIDTH + INITIAL_PANEL_GAP),
        top: INITIAL_PANEL_MARGIN + Math.floor(index / columns) * INITIAL_PANEL_ROW_HEIGHT,
    };
}
```

O objeto devolvido por `loadPanelConfig()` deve usar `initialPanelPosition(panelIndex)` apenas quando não existir configuração persistida.

- [ ] **Step 3: Reagir ao contador de reset no `Panel`**

Importar `layoutReset` e, em `onMount`, subscrever sem executar a reposição no valor inicial:

```ts
let receivedReset = false;
const unsubscribeLayoutReset = layoutReset.subscribe(() => {
    if (!receivedReset) {
        receivedReset = true;
        return;
    }

    const position = initialPanelPosition(panelIndex);
    panelConfig.left = position.left;
    panelConfig.top = position.top;
    panelConfig.zIndex = panelIndex;
    fixPosition();
    savePanelConfig();
});

onMount(() => unsubscribeLayoutReset);
```

Manter a subscrição existente de destaque e a persistência do painel. Se o componente já tiver um `onMount`, juntar a limpeza à função de cleanup desse bloco para não criar uma segunda subscrição órfã.

- [ ] **Step 4: Adicionar o controlo `Reset Layout` ao ClickGUI**

Em `ClickGui.svelte`, importar `requestLayoutReset` e renderizar um botão pequeno junto da pesquisa/toolbar:

```svelte
<button class="reset-layout" type="button" on:click={requestLayoutReset}>
    Reset Layout
</button>
```

O botão não deve fechar a pesquisa nem interferir com o arrasto dos painéis.

- [ ] **Step 5: Validar o comportamento base**

Run: `npm run check` (a partir de `src-theme`)

Expected: `svelte-check` termina sem erros.

- [ ] **Step 6: Commit**

```powershell
git add src-theme/src/routes/clickgui/clickgui_store.ts src-theme/src/routes/clickgui/Panel.svelte src-theme/src/routes/clickgui/ClickGui.svelte
git commit -m "feat(clickgui): add aligned initial layout and reset"
```

### Task 2: Aplicar o acabamento visual Neon aos painéis e módulos

**Files:**
- Modify: `src-theme/src/routes/clickgui/Panel.svelte`
- Modify: `src-theme/src/routes/clickgui/Module.svelte`
- Modify: `src-theme/src/routes/clickgui/Search.svelte`
- Modify: `src-theme/src/routes/clickgui/ClickGui.svelte`
- Modify: `src-theme/src/colors.scss`

- [ ] **Step 1: Atualizar as variáveis de cor do ClickGUI**

Manter as variáveis existentes, mas definir valores Neon coerentes em `colors.scss`: fundo preto translúcido, texto principal claro, texto dimmed cinzento, painel com alpha elevado, hover ligeiramente roxo/azul, borda e estados ativos ligados a `--accent-color`. Não remover nomes de variáveis existentes; componentes externos dependem deles.

O conjunto mínimo deve manter esta forma:

```scss
--clickgui-panel-header-background-color: color-mix(in srgb, var(--surface-color) 92%, transparent);
--clickgui-panel-body-background-color: color-mix(in srgb, var(--surface-color) 82%, transparent);
--clickgui-panel-header-border-color: var(--accent-color);
--clickgui-module-hover-background-color: color-mix(in srgb, var(--accent-color) 14%, transparent);
--clickgui-module-enabled-color: var(--accent-color);
--clickgui-panel-shadow-color: color-mix(in srgb, black 65%, transparent);
```

- [ ] **Step 2: Uniformizar o cabeçalho do painel**

No bloco `.panel`/`.title` de `Panel.svelte`, usar largura fixa de `250px`, `border-radius: 6px`, `overflow: hidden`, sombra discreta e transições curtas. O cabeçalho deve conservar o ícone, o nome da categoria e o botão de expansão, com altura e padding iguais em todas as categorias.

- [ ] **Step 3: Tornar estados de módulo mais claros**

Em `Module.svelte`, manter a alternância por clique e expansão por clique direito, mas aplicar uma hierarquia visual explícita:

```scss
.name {
    min-height: 34px;
    padding: 9px 12px;
    color: var(--clickgui-text-dimmed-color);
    transition: background-color 160ms ease, color 160ms ease;
}

.name.enabled {
    color: var(--clickgui-module-enabled-color);
}

.name:hover {
    background-color: var(--clickgui-module-hover-background-color);
    color: var(--clickgui-text-color);
}
```

As definições expandidas continuam dentro do painel, com a borda de acento existente e sem aumentar a largura do painel.

- [ ] **Step 4: Integrar toolbar, pesquisa e fundo**

Em `ClickGui.svelte`, criar um wrapper de toolbar que contenha pesquisa e `Reset Layout`, sem mudar as props passadas a `Search`. Em `Search.svelte`, reduzir o raio/sombra e manter o comportamento de teclado e filtragem intacto. O fundo escurecido e a grelha só aparecem quando os stores atuais indicarem isso.

- [ ] **Step 5: Verificar build do tema**

Run: `npm run check && npm run build` (a partir de `src-theme`)

Expected: ambos terminam com exit code `0` e `build` gera `src-theme/dist` sem erros SCSS/Svelte.

- [ ] **Step 6: Commit**

```powershell
git add src-theme/src/routes/clickgui/Panel.svelte src-theme/src/routes/clickgui/Module.svelte src-theme/src/routes/clickgui/Search.svelte src-theme/src/routes/clickgui/ClickGui.svelte src-theme/src/colors.scss
git commit -m "feat(clickgui): polish neon panel and module styling"
```

### Task 3: Regressão manual e documentação do ClickGUI

**Files:**
- Test: `src-theme/dist` via o cliente LiquidBounce construído
- Modify: `README.md`

- [ ] **Step 1: Abrir e fechar o ClickGUI**

Confirmar que o bind atual abre o ClickGUI, que as tabs `ClickGUI`, `HUD Editor` e `Settings` continuam acessíveis e que fechar o ecrã não deixa um browser órfão.

- [ ] **Step 2: Validar interação dos painéis**

Confirmar, em pelo menos três categorias, que clicar alterna o módulo, clicar direito expande definições, o arrasto funciona, o snapping ajusta a grelha e o painel fica em frente quando selecionado.

- [ ] **Step 3: Validar reposição**

Arrastar dois painéis, clicar `Reset Layout`, confirmar que voltam à grelha inicial e fechar/reabrir o ClickGUI para confirmar que a nova posição fica persistida.

- [ ] **Step 4: Documentar o novo reset de layout**

Adicionar ao `README.md` uma nota que o layout inicial é alinhado, que o snapping permanece ativo e que `Reset Layout` apaga as posições guardadas e reaplica o arranjo inicial. Executar:

```powershell
git add README.md
git commit -m "docs(clickgui): document neon layout reset"
```
