"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Target, CheckCircle2, TrendingUp, Search } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { useGoals } from "../hooks/use-goals"
import { GoalCard } from "./GoalCard"

export function GoalsList() {
  const { data: goals, isLoading, isError, refetch } = useGoals()
  const [searchTerm, setSearchTerm] = useState("")

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorState 
        title="Erro ao carregar Metas"
        description="Não foi possível buscar as suas metas financeiras."
        onRetry={refetch}
      />
    )
  }

  const filteredGoals = goals?.filter(goal => 
    goal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (goal.description && goal.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  const totalTarget = goals?.reduce((acc, g) => acc + Number(g.target_amount), 0) || 0
  const totalCurrent = goals?.reduce((acc, g) => acc + Number(g.current_amount), 0) || 0
  const completedCount = goals?.filter(g => g.status === "COMPLETED" || Number(g.current_amount) >= Number(g.target_amount)).length || 0

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val)
  }

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Metas Financeiras</h1>
          <p className="text-sm text-muted-foreground">Planeje, acompanhe e conquiste os seus objetivos financeiros.</p>
        </div>
        <Link href="/dashboard/goals/new" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="h-4 w-4" /> Nova Meta
        </Link>
      </div>

      {/* KPI Cards Header */}
      {goals && goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Economizado</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(totalCurrent)}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Objetivo Acumulado</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(totalTarget)}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Metas Concluídas</p>
              <p className="text-lg font-bold text-foreground">{completedCount} de {goals.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {goals && goals.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por título ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Goals Grid or Empty State */}
      {filteredGoals.length === 0 ? (
        <EmptyState 
          icon={<Target className="h-8 w-8 text-muted-foreground" />}
          title={searchTerm ? "Nenhuma meta encontrada" : "Nenhuma meta cadastrada"}
          description={searchTerm ? "Tente buscar com outros termos." : "Crie sua primeira meta financeira para começar a acompanhar o seu progresso."}
          action={searchTerm ? undefined : (
            <Link href="/dashboard/goals/new" className={cn(buttonVariants())}>
              Criar Meta
            </Link>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  )
}
