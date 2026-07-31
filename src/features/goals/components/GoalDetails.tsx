"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Trash2, 
  Edit, 
  Calendar, 
  Target, 
  TrendingUp, 
  History,
  CheckCircle2
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { useGoal, useGoalContributions, useDeleteGoal, useRemoveContribution } from "../hooks/use-goals"
import { ContributionModal } from "./ContributionModal"

interface GoalDetailsProps {
  id: string
}

export function GoalDetails({ id }: GoalDetailsProps) {
  const router = useRouter()
  const [deleteGoalOpen, setDeleteGoalOpen] = useState(false)

  const { data: goal, isLoading: goalLoading, isError: goalError, refetch } = useGoal(id)
  const { data: contributions, isLoading: contribsLoading } = useGoalContributions(id)

  const deleteGoalMutation = useDeleteGoal()
  const removeContribMutation = useRemoveContribution(id)

  if (goalLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (goalError || !goal) {
    return (
      <ErrorState 
        title="Meta não encontrada"
        description="Não foi possível recuperar os detalhes dessa meta."
        onRetry={refetch}
      />
    )
  }

  const target = Number(goal.target_amount) || 0
  const current = Number(goal.current_amount) || 0
  const percentage = Math.min(100, Math.round((current / target) * 100)) || 0
  const remaining = Math.max(0, target - current)
  const isCompleted = goal.status === "COMPLETED" || current >= target

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val)
  }

  const handleDeleteGoal = async () => {
    await deleteGoalMutation.mutateAsync(goal.id)
    router.push("/dashboard/goals")
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/goals" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2")}>
          <ArrowLeft className="h-4 w-4" /> Voltar para Metas
        </Link>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/goals/${goal.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}>
            <Edit className="h-4 w-4" /> Editar Meta
          </Link>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setDeleteGoalOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" /> Excluir
          </Button>
        </div>
      </div>

      {/* Main Goal Summary Card */}
      <Card className="p-6 md:p-8 border border-border/50 bg-card relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div 
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
              style={{ backgroundColor: goal.color || "hsl(var(--primary))" }}
            >
              <Target className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{goal.name}</h1>
                <Badge 
                  variant={isCompleted ? "default" : "outline"}
                  className={isCompleted ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-primary/5 text-primary border-primary/20"}
                >
                  {isCompleted ? "Concluída" : "Em Progresso"}
                </Badge>
              </div>
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
              )}
            </div>
          </div>

          <ContributionModal goalId={goal.id} />
        </div>

        {/* Progress Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-6">
          <div className="p-4 rounded-xl bg-muted/40 border border-border/30">
            <span className="text-xs text-muted-foreground font-medium">Acumulado Atual</span>
            <p className="text-2xl font-bold text-emerald-500 mt-1">{formatCurrency(current)}</p>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/30">
            <span className="text-xs text-muted-foreground font-medium">Valor Alvo</span>
            <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(target)}</p>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/30">
            <span className="text-xs text-muted-foreground font-medium">Falta Economizar</span>
            <p className="text-2xl font-bold text-amber-500 mt-1">{formatCurrency(remaining)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-semibold">
            <span>Progresso da Meta</span>
            <span className="text-primary">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-3.5" />
          {goal.target_date && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
              <Calendar className="h-3.5 w-3.5" /> Data Alvo: {new Date(goal.target_date).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
      </Card>

      {/* Contribution History & Timeline */}
      <Card className="p-6 border border-border/50 bg-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Histórico de Aportes</h2>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {contributions?.length || 0} aporte(s) registrado(s)
          </span>
        </div>

        {contribsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : !contributions || contributions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Nenhum aporte registrado ainda.</p>
            <p className="text-xs mt-1">Clique em "Adicionar Aporte" acima para registrar seus depósitos.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {contributions.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    +
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(Number(item.amount))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.contribution_date).toLocaleDateString("pt-BR")}
                      {item.notes && ` • ${item.notes}`}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                  onClick={() => removeContribMutation.mutate(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Delete Confirmation */}
      <ConfirmationDialog 
        isOpen={deleteGoalOpen}
        onOpenChange={setDeleteGoalOpen}
        title="Excluir Meta"
        description="Tem certeza de que deseja excluir esta meta? Todo o histórico de aportes associado será perdido."
        onConfirm={handleDeleteGoal}
      />
    </div>
  )
}
