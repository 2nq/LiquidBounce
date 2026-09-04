# Neon ClickGUI e ArrayList — especificação de design

## Objetivo

Dar ao tema Nextgen do LiquidBounce um visual mais limpo e configurável, inspirado na organização do Neon Client e nos temas/efeitos do Rise. A primeira entrega será o modo Neon; a janela central inspirada no Rise fica guardada para uma fase posterior.

## Limites da primeira fase

Incluído:

- redesign visual do ClickGUI existente;
- layout inicial alinhado dos painéis;
- arrasto e snapping da grelha existentes;
- ação para repor o layout;
- melhorias visuais nos painéis, módulos e definições;
- novas opções de aparência da ArrayList;
- 39 presets de cores equivalentes aos temas definidos no Rise;
- modo `Custom` com duas cores editáveis.

Não incluído:

- janela central/sidebar do Rise;
- alteração da lógica de módulos;
- alteração da ScriptAPI ou do AutoSpawner;
- fonte nova;
- cópia de código ou assets do Rise. O Rise será usado como referência visual e de dados de cor; a implementação será própria na arquitetura Svelte do LiquidBounce.

## ClickGUI Neon

O ClickGUI continuará a usar as rotas e componentes atuais (`ClickGui.svelte`, `Panel.svelte`, `Module.svelte` e `TabbedClickGui.svelte`). A interação não muda: clicar num módulo alterna-o, expandir mostra definições, os painéis podem ser arrastados e o snapping continua a usar a grelha configurada.

O visual terá:

- painéis com largura e cabeçalho consistentes;
- layout inicial determinístico, alinhado em colunas e sem sobreposições;
- botão/ação `Reset Layout` que limpa as posições guardadas e reaplica o layout inicial;
- cabeçalho compacto com ícone, categoria e controlo de expansão;
- cantos arredondados, fundo translúcido, borda de acento e sombra discreta;
- estados de hover, módulo ativo e módulo expandido com transições curtas;
- pesquisa e tabs atuais preservados;
- definições internas com espaçamento e hierarquia visual uniformes.

O layout guardado pelo utilizador continua a ser persistido por categoria. A migração não deve apagar posições existentes automaticamente; `Reset Layout` será a forma explícita de reaplicar o novo arranjo.

## ArrayList

O componente atual `src/routes/hud/elements/ArrayList.svelte` será mantido, com a configuração e os tipos estendidos.

### Opções

- `Lowercase`: converte nomes e tags para minúsculas;
- `ShowTags`: mostra ou esconde tags;
- `ItemAlignment`: `Left` ou `Right`;
- `Order`: `Ascending` ou `Descending` por largura;
- `Theme`: `Global`, os 39 presets do Rise ou `Custom`;
- `CustomPrimary` e `CustomSecondary`: cores usadas no modo `Custom`;
- `Background`: `Off`, `Solid` ou `Translucent`;
- `BackgroundAlpha`: transparência do fundo;
- `Glow`: `Off`, `Soft` ou `Strong`;
- `Shadow`: ligado/desligado;
- `Animation`: entrada/saída deslizante, mantendo a animação de reorganização atual;
- `AnimationSpeed`: duração configurável;
- `Border`: sem barra, barra de acento ou barra com a cor do item.

Defaults: `Theme=Blend`, `ShowTags=true`, alinhamento à direita, ordem descendente, fundo translúcido, glow desligado, sombra desligada e a animação atual. Os valores antigos continuam válidos; valores ausentes recebem estes defaults.

### Temas

Os presets a recriar são: Aubergine, Aqua, Banana, Blend, Blossom, Bubblegum, Candy Cane, Cherry, Christmas, Coral, Digital Horizon, Express, Lime Water, Lush, Halogen, Hyper, Magic, May, Orange Juice, Pastel, Pumpkin, Satin, Snowy Sky, Steel Fade, Sundae, Sunkist, Water, Legacy, Winter, Peony, Shadow, Wood, Creida, Creida Two, Gothic, Rue, Purple, Rainbow e Nord.

Cada preset terá duas ou três cores interpoladas ao longo da lista. `Rainbow` será dinâmico no tempo/posição. `Global` usará o acento e tint atuais do tema do LiquidBounce. `Custom` usará as duas cores escolhidas pelo utilizador.

## Implementação e fluxo de dados

1. O HUD Editor continua a guardar a configuração do componente ArrayList.
2. `ArrayList.svelte` lê a configuração, calcula o texto final (incluindo lowercase/tags), calcula a largura e ordena os módulos.
3. O renderer calcula a cor por índice/posição e tempo, e aplica variáveis CSS por item.
4. Glow e shadow serão efeitos CSS limitados ao texto/barra para não introduzir um pipeline de shaders novo.
5. O ClickGUI mantém o websocket/REST atual; só a apresentação e o cálculo do layout inicial mudam.

## Testes e aceitação

- `npm run check` passa sem erros no tema;
- `npm run build` gera os assets do tema;
- ClickGUI abre e fecha normalmente;
- pesquisa, toggle, expansão, arrasto, snapping e persistência continuam funcionais;
- `Reset Layout` coloca todos os painéis num arranjo alinhado;
- ArrayList mantém a ordenação e alinhamento atuais quando as novas opções ficam nos defaults;
- cada preset muda as cores sem alterar o estado dos módulos;
- lowercase, tags, fundo, glow, shadow e velocidade de animação são observáveis no jogo;
- uma configuração antiga sem as novas chaves é carregada sem erro.

## Referências

- LiquidBounce atual: `src-theme/src/routes/clickgui/` e `src-theme/src/routes/hud/elements/ArrayList.svelte`.
- Presets e efeitos estudados no Rise 6.9.5: `Themes`, `ModernInterface` e `ArrayListEntry`.
- Mockup da futura janela central: `.superpowers/brainstorm/635-1788519884/content/clickgui-rise-vs-neon.html`.
