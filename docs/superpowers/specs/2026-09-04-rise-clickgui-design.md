# Rise ClickGUI — especificação de design

## Objetivo

Adicionar ao tema oficial do LiquidBounce um segundo layout de ClickGUI inspirado na organização do Rise: uma única janela central, navegação lateral por categoria e uma área principal dedicada a módulos e definições. O layout Neon por painéis permanece disponível e funcional.

## Âmbito

Incluído nesta fase:

- opção de layout `Rise` ou `Panels` no módulo ClickGUI;
- janela central responsiva com sidebar, cabeçalho e área principal;
- navegação pelas categorias reais devolvidas pela API do LiquidBounce;
- pesquisa global de módulos;
- clique esquerdo para ativar ou desativar um módulo;
- clique direito para abrir a página de definições do módulo;
- página de definições com nome, descrição, bind, estado e todos os controlos já suportados;
- acesso ao HUD Editor e às definições globais a partir da sidebar;
- estados de loading, vazio e erro integrados na janela;
- sincronização em tempo real com os eventos atuais do LiquidBounce.

Fora de âmbito:

- copiar código, fontes, logótipo ou assets proprietários do Rise;
- alterar a lógica dos módulos ou o protocolo REST/websocket;
- remover o layout Neon existente;
- reescrever os componentes de settings que já funcionam;
- implementar temas visuais adicionais nesta fase.

## Abordagem escolhida

O ClickGUI terá dois layouts selecionáveis. `Panels` renderiza o `ClickGui.svelte` atual, mantendo arrasto, snapping, grelha e posições guardadas. `Rise` renderiza uma nova árvore de componentes dentro do `TabbedClickGui.svelte`. A seleção é persistida pelo valor `Layout` do módulo ClickGUI e não converte nem apaga posições do modo `Panels`.

Esta separação evita adaptar os painéis móveis a uma arquitetura para a qual não foram desenhados. Os dois layouts reutilizam as mesmas funções REST, eventos websocket, tipos e componentes `GenericSetting`.

## Estrutura visual

A janela Rise fica centrada no ecrã, com `width: min(1180px, calc(100vw - 48px))` e `height: min(780px, calc(100vh - 48px))`. Usa um fundo carvão frio translúcido, borda interior discreta, sombra tingida e cantos exteriores suaves. Não usa o logótipo do Rise; apresenta uma marca tipográfica simples `LB`.

A janela divide-se em duas áreas:

1. Sidebar com marca, pesquisa, categorias dinâmicas, `HUD Editor` e `Client Settings`.
2. Área principal com cabeçalho contextual e conteúdo scrollável.

As categorias mantêm os nomes do LiquidBounce para que nenhum módulo desapareça por causa de um mapeamento artificial. Cada entrada recebe um ícone já existente quando disponível e um fallback tipográfico consistente quando não existir asset.

O acento continua a vir de `--accent-color`. Texto principal, texto secundário, superfícies e estados derivam das variáveis de tema atuais, com novas variáveis Rise apenas onde a semântica não existir. Animações usam `transform` e `opacity`, entre 160 e 240 ms, sem movimento excessivo.

## Navegação e interação

### Categorias e módulos

Ao abrir o layout Rise, fica selecionada a primeira categoria não vazia pela ordem recebida da API. A área principal mostra os módulos dessa categoria numa lista vertical compacta. Cada linha contém nome, descrição curta, indicador de estado e seta de definições; todos os módulos têm uma página de detalhes porque bind e estado estão sempre disponíveis.

- clique esquerdo na linha ativa ou desativa o módulo;
- clique direito abre a página de definições e impede o menu de contexto do browser;
- clicar na seta também abre as definições, para tornar a ação descobrível;
- mudar de categoria fecha a página de definições e mostra a lista da categoria escolhida;
- eventos `moduleToggle` atualizam imediatamente todas as representações do módulo.

### Definições do módulo

A página dedicada apresenta botão de voltar, nome, descrição, toggle, bind e os settings existentes. O componente `GenericSetting` continua responsável por cada tipo de controlo e `setModuleSettings` continua a persistir alterações.

O conteúdo tem scroll próprio e mantém o cabeçalho visível. Grupos aninhados continuam expansíveis. Se um módulo não tiver definições além de bind/hidden, a página mostra o estado e o bind sem uma secção vazia.

### Pesquisa

A pesquisa fica no topo da sidebar. Enquanto tiver texto, substitui a lista de categoria por resultados globais sem distinguir maiúsculas. A ordenação dá prioridade a nome iniciado pelo termo, alias iniciado pelo termo e, por fim, termo contido no nome ou alias; empates mantêm a ordem recebida da API. Os resultados preservam as mesmas ações: clique esquerdo alterna o módulo; clique direito ou seta abre as definições. Limpar a pesquisa regressa à categoria anteriormente selecionada.

### HUD Editor e Client Settings

`HUD Editor` e `Client Settings` aparecem no fim da sidebar e reutilizam os componentes atuais `HudEditor.svelte` e `GlobalSettings.svelte` dentro da área principal. A tab superior atual deixa de ser necessária no modo Rise; continua visível e inalterada no modo Panels durante a primeira entrega. No modo Rise, mudar para estas áreas não perde a categoria selecionada.

## Componentes e responsabilidades

- `TabbedClickGui.svelte`: carrega os valores do módulo ClickGUI e escolhe entre `Rise` e `Panels`.
- `RiseClickGui.svelte`: coordena carregamento, seleção de vista, pesquisa e eventos de módulos.
- `RiseSidebar.svelte`: apresenta pesquisa, categorias e destinos utilitários.
- `RiseModuleList.svelte`: renderiza módulos da categoria ou resultados de pesquisa e emite ações.
- `RiseModuleDetails.svelte`: carrega, apresenta e persiste settings do módulo selecionado.
- `rise_clickgui_state.ts`: contém tipos e funções puras para seleção inicial, filtragem e transições de vista.
- componentes existentes `GenericSetting`, `HudEditor` e `GlobalSettings`: continuam a executar a lógica já testada.

Os componentes novos recebem dados e callbacks explícitos. Apenas o coordenador fala diretamente com o websocket para estado global; a página de detalhes usa as funções REST existentes para carregar e guardar a configuração selecionada.

## Fluxo de dados

1. `TabbedClickGui.svelte` lê `ClickGUI.Layout` e seleciona o renderer.
2. `RiseClickGui.svelte` chama `getModules`, agrupa por categoria e escolhe a primeira categoria não vazia.
3. Sidebar e lista recebem cópias reativas destes dados.
4. Um clique esquerdo chama `setModuleEnabled`; o evento `moduleToggle` confirma e sincroniza o estado.
5. Um clique direito define a vista `module` e passa o nome a `RiseModuleDetails`.
6. A página chama `getModuleSettings`; alterações chamam `setModuleSettings` e recarregam o configurável, como no componente atual.
7. Pesquisa e seleção de categoria alteram apenas estado local de navegação.

## Estados especiais

- Loading: skeletons de linhas enquanto módulos ou settings são carregados.
- Erro: mensagem curta dentro da área principal com botão `Retry`; a janela não fecha.
- Categoria vazia: texto `No modules in this category`.
- Pesquisa vazia: texto `No modules found` e ação para limpar a pesquisa.
- Módulo removido durante a página de detalhes: regressa à lista e mostra uma notificação inline discreta.
- Resolução pequena: sidebar reduz a largura, a janela respeita margens mínimas e apenas o conteúdo principal faz scroll.

## Compatibilidade e persistência

O novo valor `Layout` terá `Rise` como default para novas configurações. Configurações antigas sem o valor recebem esse default através do sistema normal de valores do módulo. O modo `Panels` mantém todas as chaves `clickgui.panel.*`, por isso voltar ao layout antigo restaura exatamente as posições existentes.

Não serão alterados nomes de settings, formatos de módulos, binds ou storage já existente. A escala global do ClickGUI continua aplicada por `ScaledClickGuiContent`.

## Testes e critérios de aceitação

- funções de estado selecionam a primeira categoria válida e preservam a categoria ao entrar/sair de pesquisa;
- pesquisa encontra módulos por nome e aliases sem distinguir maiúsculas;
- clique esquerdo alterna o módulo sem abrir settings;
- clique direito não abre o menu do browser e navega para detalhes;
- detalhe carrega todos os settings e persiste alterações pela API existente;
- eventos externos `moduleToggle` atualizam a linha aberta e os resultados de pesquisa;
- categorias, pesquisa, voltar, HUD Editor e Client Settings são navegáveis;
- listas longas e settings extensos permanecem dentro da janela e têm scroll;
- `Layout=Panels` mantém o ClickGUI Neon, arrasto, snapping e storage atuais;
- `Layout=Rise` não lê nem apaga posições dos painéis;
- `npm run test:unit`, `npm run check`, `npm run build` e `gradlew build` passam;
- teste manual confirma abertura, toggle, botão direito, bind, dropdown, sliders, cores e HUD Editor dentro do jogo.

## Referências visuais

- screenshot Rise v7 fornecida pelo utilizador em 4 de setembro de 2026;
- implementação pública deobfuscada do Rise 6.9.5 usada apenas como referência de comportamento e organização;
- componentes e variáveis existentes em `src-theme/src/routes/clickgui/` e `src-theme/src/colors.scss`.
