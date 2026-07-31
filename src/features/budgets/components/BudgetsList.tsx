"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Wallet, AlertCircle, CheckCircle2, Search } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { useBudgets } from "../hooks/use-budgets"
import { BudgetCard } from "./BudgetCard"

export function BudgetsList() {
  const { data: budgets, isLoading, isError, refetch } = useBudgets()
  const [searchTerm, setSearchTerm] = useState("")

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorState 
        title="Erro ao carregar Orçamentos"
        description="Não foi possível recuperar os orçamentos financeiros."
        onRetry={refetch}
      />
    )
  }

  const filteredBudgets = budgets?.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const totalLimit = budgets?.reduce((acc, b) => acc + Number(b.total_limit), 0) || 0

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orçamentos Financeiros</h1>
          <p className="text-sm text-muted-foreground">Controle e limite de gastos mensais por categoria.</p>
        </div>
        <Link href="/dashboard/budgets/new" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="h-4 w-4" /> Novo Orçamento
        </Link>
      </div>

      {/* KPI Cards Summary */}
      {budgets && budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Limite Total Orçado</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(totalLimit)}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Orçamentos Ativos</p>
              <p className="text-lg font-bold text-foreground">{budgets.length} orçamento(s)</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {budgets && budgets.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar orçamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Grid or Empty */}
      {filteredBudgets.length === 0 ? (
        <EmptyState 
          icon={<Wallet className="h-8 w-8 text-muted-foreground" />}
          title={searchTerm ? "Nenhum orçamento encontrado" : "Nenhum orçamento definido"}
          description={searchTerm ? "Tente buscar com outros termos." : "Crie um orçamento para definir teto de gastos e evitar estourar o seu orçamento mensal."}
          action={searchTerm ? undefined : (
            <Link href="/dashboard/budgets/new" className={cn(buttonVariants())}>
              Criar Orçamento
            </Link>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBudgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </div>
      )}
    </div>
  )
}
