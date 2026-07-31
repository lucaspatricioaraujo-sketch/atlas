# Goals & Budgets Workspaces - Technical Deliverable (Atlas V1.0)

Este documento detalha a implementação técnica final dos workspaces de **Metas (Goals)** e **Orçamentos (Budgets)** no Atlas V1.0.

---

## 1. Arquitetura (Architecture)

Os módulos foram arquitetados sob a **Atlas Design Foundation** e os padrões existentes do ecossistema Next.js (App Router):

- **Data Layer**: Integram-se diretamente ao Supabase com `TanStack Query` para caching e revalidação em tempo real via mutações.
- **Goals Engine**: Acompanhamento dinâmico com barras de progresso, cálculo automático do saldo restante e status do objetivo (**Em Progresso** ou **Concluída**). Aporte de capital recalculado automaticamente no banco de dados via Trigger SQL (`handle_goal_contribution`).
- **Budgets Engine**: Consumo dinâmico da `AnalyticsEngine` e transações de despesas para calcular o consumo por categoria contra o limite configurado. Status visual dinâmico (**Normal** <80%, **Atenção** 80%-100%, **Excedido** >100%).
- **AI Copilot Readiness**: Os métodos de serviço expõem os dados agregados ao construtor de contexto do assistente inteligente.

---

## 2. Banco de Dados (Database)

Aproveitou-se a infraestrutura da migration `20260722000003_planning_module.sql`:

### Tabelas Principais:
1. `public.goals`:
   - `id` (UUID), `family_id` (UUID), `name` (TEXT), `description` (TEXT), `target_amount` (NUMERIC), `current_amount` (NUMERIC), `target_date` (DATE), `icon` (TEXT), `color` (TEXT), `status` (public.goal_status).
2. `public.goal_contributions`:
   - `id` (UUID), `goal_id` (UUID), `transaction_id` (UUID), `amount` (NUMERIC), `contribution_date` (TIMESTAMPTZ), `notes` (TEXT).
3. `public.budgets`:
   - `id` (UUID), `family_id` (UUID), `name` (TEXT), `period` (public.budget_period), `start_date` (DATE), `end_date` (DATE), `total_limit` (NUMERIC).
4. `public.budget_items`:
   - `id` (UUID), `budget_id` (UUID), `category_id` (UUID), `limit_amount` (NUMERIC).

### Automação via Triggers:
- `handle_goal_contribution()`: Recalcula o `current_amount` da meta e atualiza o `status` para `COMPLETED` automaticamente sempre que um aporte é inserido, editado ou excluído em `goal_contributions`.

---

## 3. Componentes (Components)

### Módulo de Metas (`src/features/goals/components`):
- `GoalsList.tsx`: Dashboard principal de metas com KPIs agregados, busca e grade de cards.
- `GoalCard.tsx`: Card visual de meta com cor customizada, progresso percentual, saldo restante e atalho de detalhes.
- `GoalForm.tsx`: Formulário de criação/edição com validação Zod e seletor de cores HSL.
- `GoalDetails.tsx`: Visão completa da meta contendo os cartões KPI, progresso, linha do tempo e lista de aportes.
- `ContributionModal.tsx`: Modal interativo para adicionar novo aporte.

### Módulo de Orçamentos (`src/features/budgets/components`):
- `BudgetsList.tsx`: Visão geral dos teto de gastos configurados com KPIs.
- `BudgetCard.tsx`: Card de orçamento com barra de progresso colorida por status (**Normal**, **Atenção**, **Excedido**).
- `BudgetForm.tsx`: Formulário de configuração de limites por categoria e período.

---

## 4. Hooks (Hooks)

- `src/features/goals/hooks/use-goals.ts`:
  - `useGoals()`, `useGoal(id)`, `useCreateGoal()`, `useUpdateGoal()`, `useDeleteGoal()`, `useGoalContributions(goalId)`, `useAddContribution()`, `useRemoveContribution()`.
- `src/features/budgets/hooks/use-budgets.ts`:
  - `useBudgets()`, `useBudget(id)`, `useBudgetUsage(id)`, `useCreateBudget()`, `useDeleteBudget()`.

---

## 5. Serviços (Services)

- `src/features/goals/services.ts`: `GoalService` (CRUD de metas e gestão de aportes).
- `src/features/budgets/services.ts`: `BudgetService` (CRUD de orçamentos e consulta dinâmica de consumo baseado em despesas).
- `src/features/ai-copilot/services.ts`: `buildContextPayload` expondo Metas e Orçamentos ao motor preditivo.

---

## 6. Lista de Verificação de Conclusão (Completion Checklist)

- [x] **Goals List**: Listagem com progresso e porcentagem.
- [x] **Create/Edit/Delete Goal**: Gerenciamento de metas.
- [x] **Goal Details**: Resumo, histórico de aportes e linha de tempo.
- [x] **Goal Contributions**: Adicionar, editar e deletar aportes com recálculo automático.
- [x] **Budgets List**: Visão geral de teto de gastos.
- [x] **Create/Edit/Delete Budget**: Gerenciamento de orçamentos por categoria.
- [x] **Budget Status**: Badges visuais **Normal**, **Atenção** (>80%), **Excedido** (>100%).
- [x] **Analytics Engine Integration**: Consumo dinâmico de despesas sem duplicação de lógicas.
- [x] **Dashboard Cards**: Resumos integrados na Dashboard raiz.
- [x] **AI Copilot Context**: Leitura de dados sem geração antecipada de recomendações.
