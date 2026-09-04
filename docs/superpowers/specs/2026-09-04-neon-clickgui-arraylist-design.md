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
- dropdowns limitados ao viewport e navegáveis por scroll;
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
- seletores com muitas opções terão no máximo 420 px (ou o espaço disponível no viewport), scroll vertical interno e posicionamento acima do trigger quando não houver espaço suficiente abaixo;
- definições internas com espaçamento e hierarquia visual uniformes.

O dropdown é renderizado num portal. Enquanto estiver aberto, mede o espaço livre acima e abaixo do trigger e escolhe a direção que mostra mais conteúdo. Scroll dentro da lista não fecha o dropdown; scroll da página/painel continua a fechá-lo para evitar que o portal fique desalinhado.

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
- `Scale`: escala uniforme entre `0.5` e `2.0`, com default `1.0`, aplicada ao texto, espaçamento, fundo, barra e efeitos.

Defaults: `Theme=Blend`, `ShowTags=true`, alinhamento à direita, ordem descendente, fundo translúcido, glow desligado, sombra desligada e a animação atual. Os valores antigos continuam válidos; valores ausentes recebem estes defaults.

### Temas

Os presets a recriar são: Aubergine, Aqua, Banana, Blend, Blossom, Bubblegum, Candy Cane, Cherry, Christmas, Coral, Digital Horizon, Express, Lime Water, Lush, Halogen, Hyper, Magic, May, Orange Juice, Pastel, Pumpkin, Satin, Snowy Sky, Steel Fade, Sundae, Sunkist, Water, Legacy, Winter, Peony, Shadow, Wood, Creida, Creida Two, Gothic, Rue, Purple, Rainbow e Nord.

Cada preset terá duas ou três cores. A animação seguirá o Rise: o fator será uma onda senoidal baseada no tempo e na posição vertical da linha (`sin(time / 600 + y * 0.06) * 0.5 + 0.5`). Isto faz a cor atravessar continuamente os nomes de cima para baixo sem colorir os tags ou o fundo. `Rainbow` continuará dinâmico no tempo/posição. `Global` usará o acento e tint atuais do tema do LiquidBounce. `Custom` usará as duas cores escolhidas pelo utilizador.

O nome do módulo será o único texto com cor animada e glow. O tag mantém a cor cinzenta neutra. O fundo permanece estático; a barra só acompanha a cor animada quando o utilizador escolhe explicitamente `Border=Item`.

### Movimento e geometria

- o relógio visual será atualizado por `requestAnimationFrame` e alimentará uma lista reativa de cores;
- a entrada/saída usa um deslocamento curto com easing suave, enquanto `flip` reorganiza as restantes linhas;
- cada linha usa a largura medida do conteúdo, com transição de largura, evitando o salto quando tags como `Intave14 Fast` aparecem ou mudam;
- o espaço entre linhas passa de 2 px para 0, formando um fundo contínuo em escada;
- a escala usa `zoom`, já utilizado pelo componente Image e suportado pelo CEF do cliente, para que o HUD Editor também meça corretamente o elemento escalado.

## Implementação e fluxo de dados

1. O HUD Editor continua a guardar a configuração do componente ArrayList.
2. `ArrayList.svelte` lê a configuração, calcula o texto final (incluindo lowercase/tags), calcula a largura e ordena os módulos.
3. Um ciclo de animação por frame atualiza um estado reativo; o renderer calcula a onda de cor por posição/tempo e aplica variáveis CSS apenas ao nome de cada item.
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
- a cor dos presets muda continuamente seguindo a onda do Rise, enquanto o tag e o fundo não mudam de cor;
- adicionar/remover um módulo e alterar uma tag não provoca saltos de largura;
- os fundos das linhas ficam encostados, sem fendas;
- `Scale=0.5`, `1.0` e `2.0` redimensionam toda a ArrayList sem alterar a ordenação;
- um dropdown com 39 opções permanece dentro do viewport, pode ser percorrido com a roda do rato e não fecha durante o seu próprio scroll;
- uma configuração antiga sem as novas chaves é carregada sem erro.

## Referências

- LiquidBounce atual: `src-theme/src/routes/clickgui/` e `src-theme/src/routes/hud/elements/ArrayList.svelte`.
- Presets e efeitos estudados no Rise 6.9.5: `Themes`, `ModernInterface` e `ArrayListEntry`.
- Mockup da futura janela central: `.superpowers/brainstorm/635-1788519884/content/clickgui-rise-vs-neon.html`.
