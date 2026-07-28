# Atlas Financeiro - Design Foundation

Este documento descreve os padrões visuais fundamentais, tokens de design e convenções de componentes do Atlas Financeiro. A interface foi projetada para transmitir confiança, modernidade e sofisticação de um SaaS financeiro guiado por Inteligência Artificial.

## 1. Princípios de Design
- **Elegância Limpa**: Interfaces focadas, com amplo uso de whitespace e sem distrações visuais.
- **Foco Analítico**: Alta legibilidade de dados numéricos (tipografia e contraste).
- **IA Invisível**: As funcionalidades de IA são sinalizadas através de tons Violeta/Azul e brilhos sutis, mas integradas nativamente na experiência.

## 2. Tipografia
Utilizamos a família de fontes **Geist** (Vercel) por sua aparência neutra, limpa e legibilidade excepcional para numerais (tabular figures).

- **Fonte Base (Sans)**: `Geist Sans`
- **Fonte Numérica/Código**: `Geist Mono`
- **Escala Sugerida**:
  - Títulos de Página: `text-3xl font-bold tracking-tight`
  - Cabeçalhos de Seção: `text-xl font-semibold`
  - Valores Grandes (KPIs): `text-3xl font-bold tracking-tight`
  - Valores Secundários: `text-sm text-muted-foreground`

## 3. Paleta de Cores (OKLCH)
A aplicação suporta Light e Dark mode nativamente com alto contraste. As cores são definidas em formato HSL/OKLCH via CSS Variables no `globals.css`.

- **Background & Surface**: Cinzas extremamente escuros (em Dark mode) ou brancos (em Light mode), evitando preto absoluto para reduzir fadiga visual.
- **Primary (Atlas Violet)**: Tons de Violeta (ex: `oklch(0.65 0.25 285)` em Dark Mode). Usado em CTAs, barras de progresso primárias e destaques de IA.
- **Gráficos**: Uma escala análoga (Violeta → Azul → Verde-água).
- **Feedback Semântico**:
  - `Success`: Verde esmeralda (Renda, metas atingidas).
  - `Danger`: Vermelho vibrante (Despesas excessivas, erros).
  - `Warning`: Laranja/Amarelo suave (Atenção, contas vencendo).

## 4. Geometria e Formas
O projeto adota arredondamentos suaves para amigabilidade e estética premium.

- **Cartões e Painéis (PremiumCard)**: Utilizam `rounded-3xl` (`var(--radius-3xl)`), aproximadamente `24px`.
- **Botões (Pílula ou Padrão)**: Botões principais usam `rounded-full` ou `rounded-xl`.
- **Containers Menores**: Usam `rounded-md` ou `rounded-lg`.

## 5. Profundidade e Sombras (Glassmorphism)
Sombras são usadas de forma contida para não poluir a interface.

- **shadow-premium-sm**: Sombra quase imperceptível para separar cartões do fundo.
- **shadow-premium-md**: Sombra direcional para hover em cartões interativos.
- **glass-effect (Utility)**: Fundo com blur e opacidade reduzida, usado para tooltips de gráficos, headers fixos ou cartões flutuantes.

## 6. Motion (Animação)
Movimentos são rápidos, suaves e utilitários. Não usamos animações espalhafatosas que retardam o uso diário.

- **Hover em Cartões**: `transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium-md`.
- **Carregamento (LoadingSkeleton)**: Animação suave em vez de saltos.
- **Aparecimento (Fade In)**: Entradas de tela utilizam `@utility animate-fade-in` (`duration: 0.3s ease-out`).

## 7. Componentes de Fundação (`src/components/design/`)
Os desenvolvedores **devem** utilizar estes componentes padronizados antes de construir do zero:

| Componente | Uso |
| --- | --- |
| `PremiumCard` | Base para todos os widgets e containers em painéis. Suporta hover. |
| `GlassCard` | Cartão flutuante ou semi-transparente sobre fundos complexos. |
| `WidgetContainer` | Wrapper que aplica um `PremiumCard` com cabeçalhos padrão para o Dashboard. |
| `PageHeader` | O topo de uma tela principal (comporta ícone, título e ações primárias). |
| `SectionHeader` | Para separar blocos de informação na mesma tela. |
| `MetricTile` | Para exibir saldos, KPIs ou estatísticas cruciais. Suporta tendência (alta/baixa). |
| `ProgressCard` | Exibe o avanço para uma Meta ou uso de Orçamento. |
| `StatusBadge` | Chips de categorias ou status (pendente, pago, etc). |
| `QuickAction` | Botão interativo grande em formato de cartão com ícone no topo. |

## 8. Gráficos (Recharts)
Ao implementar gráficos:
1. Remover grid lines do eixo X (deixar apenas no eixo Y, muito sutis `border/10`).
2. Esconder ou simplificar `axisLine` e `tickLine`.
3. Usar barras arredondadas (propriedade `radius={[4, 4, 0, 0]}`).
4. Tooltips devem usar o design "glass" ou se comportar visualmente como um mini-card escuro.

## 9. Acessibilidade
- O contraste de cor atende WCAG AA para textos legíveis.
- Elementos interativos (`QuickAction`, etc) possuem `focus-visible` explícito de alto contraste.
