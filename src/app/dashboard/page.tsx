"use client"

import { useEffect, useState } from "react"
import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react"

import {
  WelcomeHeader,
  KpiCard,
  KpiCardSkeleton,
  CashFlowChart,
  ExpensesByCategoryChart,
  GoalsProgress,
  BudgetOverview,
  UpcomingBills,
  RecentTransactions,
} from "@/features/dashboard/components"

import { AnalyticsService } from "@/features/analytics/services"
import { formatCurrency } from "@/utils/format"
import { useSupabase } from "@/providers/supabase-provider"

import type { DashboardSummaryDTO, UpcomingBillDTO, ExpenseByCategoryDTO, CashFlowChartDTO } from "@/features/analytics/types"

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function getMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  }
}

// ──────────────────────────────────────────────
// Page Component
// ──────────────────────────────────────────────

export default function DashboardPage() {
  const { startDate, endDate } = getMonthRange()
  // Use familyId and supabase directly from context — single source of truth
  const { familyId, supabase } = useSupabase()

  const [familyName, setFamilyName] = useState("Família")

  // Data States
  const [summary, setSummary] = useState<DashboardSummaryDTO | null>(null)
  const [cashFlow, setCashFlow] = useState<CashFlowChartDTO[] | undefined>(undefined)
  const [expenses, setExpenses] = useState<ExpenseByCategoryDTO[] | undefined>(undefined)
  const [bills, setBills] = useState<UpcomingBillDTO[] | undefined>(undefined)
  const [goals, setGoals] = useState<any[] | undefined>(undefined)
  const [budgets, setBudgets] = useState<any[] | undefined>(undefined)
  const [recentTx, setRecentTx] = useState<any[] | undefined>(undefined)

  // Loading/Error States
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [loadingCashFlow, setLoadingCashFlow] = useState(true)
  const [loadingExpenses, setLoadingExpenses] = useState(true)
  const [loadingBills, setLoadingBills] = useState(true)
  const [loadingGoals, setLoadingGoals] = useState(true)
  const [loadingBudgets, setLoadingBudgets] = useState(true)
  const [loadingTx, setLoadingTx] = useState(true)

  const [errorSummary, setErrorSummary] = useState(false)
  const [errorCashFlow, setErrorCashFlow] = useState(false)
  const [errorExpenses, setErrorExpenses] = useState(false)
  const [errorBills, setErrorBills] = useState(false)
  const [errorGoals, setErrorGoals] = useState(false)
  const [errorBudgets, setErrorBudgets] = useState(false)
  const [errorTx, setErrorTx] = useState(false)

  // ── Load family name when familyId is available ──
  useEffect(() => {
    if (!familyId) return
    supabase
      .from("families")
      .select("name")
      .eq("id", familyId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.name) setFamilyName(data.name)
      })
  }, [familyId, supabase])

  // ── Fetch analytics data when familyId is available ──
  useEffect(() => {
    if (!familyId) return

    // Reset loading/error states on new familyId
    setLoadingSummary(true)
    setLoadingCashFlow(true)
    setLoadingExpenses(true)
    setLoadingBills(true)
    setLoadingGoals(true)
    setLoadingBudgets(true)
    setLoadingTx(true)
    setErrorSummary(false)
    setErrorCashFlow(false)
    setErrorExpenses(false)
    setErrorBills(false)
    setErrorGoals(false)
    setErrorBudgets(false)
    setErrorTx(false)

    // 1. Dashboard Summary (KPIs)
    AnalyticsService.getDashboardSummary(familyId, startDate, endDate)
      .then(setSummary)
      .catch(() => setErrorSummary(true))
      .finally(() => setLoadingSummary(false))

    // 2. Cash Flow Chart
    AnalyticsService.getCashFlowChart(familyId, startDate, endDate)
      .then(setCashFlow)
      .catch(() => setErrorCashFlow(true))
      .finally(() => setLoadingCashFlow(false))

    // 3. Expenses by Category
    AnalyticsService.getExpensesByCategory(familyId, startDate, endDate)
      .then(setExpenses)
      .catch(() => setErrorExpenses(true))
      .finally(() => setLoadingExpenses(false))

    // 4. Upcoming Bills
    AnalyticsService.getUpcomingBills(familyId, 5)
      .then(setBills)
      .catch(() => setErrorBills(true))
      .finally(() => setLoadingBills(false))

    // 5. Goals Progress
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from("goals")
          .select("name, target_amount, current_amount, status")
          .eq("family_id", familyId)
          .eq("status", "ACTIVE")
          .limit(5)
        if (error) { setErrorGoals(true); return }
        setGoals(data || [])
      } catch { setErrorGoals(true) }
      finally { setLoadingGoals(false) }
    })()

    // 6. Budget Overview
    ;(async () => {
      try {
        const { data: budgetData, error } = await supabase
          .from("budgets")
          .select("id, name, total_limit, start_date, end_date")
          .eq("family_id", familyId)
          .gte("end_date", startDate)
          .lte("start_date", endDate)
          .limit(5)
        if (error) { setErrorBudgets(true); return }
        setBudgets((budgetData || []).map((b) => ({ ...b, spent: 0 })))
      } catch { setErrorBudgets(true) }
      finally { setLoadingBudgets(false) }
    })()

    // 7. Recent Transactions
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("id, description, amount, transaction_type, status, transaction_date, categories(name), accounts(name)")
          .eq("family_id", familyId)
          .order("transaction_date", { ascending: false })
          .limit(8)
        if (error) { setErrorTx(true); return }
        setRecentTx((data || []).map((tx: any) => ({
          ...tx,
          category_name: tx.categories?.name,
          account_name: tx.accounts?.name,
        })))
      } catch { setErrorTx(true) }
      finally { setLoadingTx(false) }
    })()

  }, [familyId, startDate, endDate, supabase])

  // ──────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────

  return (
    <>
      {/* 1. Welcome Header */}
      <WelcomeHeader familyName={familyName} />

      {/* 2. Financial Summary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {loadingSummary ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : summary ? (
          <>
            <KpiCard
              title="Saldo Total"
              value={formatCurrency(summary.totalBalance)}
              icon={Wallet}
              description="Saldo de todas as contas"
            />
            <KpiCard
              title="Receita do Mês"
              value={formatCurrency(summary.totalIncome)}
              icon={TrendingUp}
              trend="up"
              description="Entradas no período"
            />
            <KpiCard
              title="Despesas do Mês"
              value={formatCurrency(summary.totalExpense)}
              icon={TrendingDown}
              trend="down"
              description="Saídas no período"
            />
            <KpiCard
              title="Fluxo Líquido"
              value={formatCurrency(summary.netCashFlow)}
              icon={ArrowLeftRight}
              trend={summary.netCashFlow >= 0 ? "up" : "down"}
              description={summary.netCashFlow >= 0 ? "Positivo" : "Negativo"}
            />
          </>
        ) : (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        )}
      </div>

      {/* 3 & 4. Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <CashFlowChart data={cashFlow} isLoading={loadingCashFlow} isError={errorCashFlow} />
        <ExpensesByCategoryChart data={expenses} isLoading={loadingExpenses} isError={errorExpenses} />
      </div>

      {/* 5, 6 & 7. Goals, Budget, Bills Row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-6">
        <GoalsProgress data={goals} isLoading={loadingGoals} isError={errorGoals} />
        <BudgetOverview data={budgets} isLoading={loadingBudgets} isError={errorBudgets} />
        <UpcomingBills data={bills} isLoading={loadingBills} isError={errorBills} />
      </div>

      {/* 8. Recent Transactions */}
      <div className="grid gap-4 mb-6">
        <RecentTransactions data={recentTx} isLoading={loadingTx} isError={errorTx} />
      </div>
    </>
  )
}
