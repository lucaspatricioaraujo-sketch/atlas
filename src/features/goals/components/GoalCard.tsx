"use client"

import Link from "next/link"
import { Target, Calendar, CheckCircle2, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Goal } from "../types"

interface GoalCardProps {
  goal: Goal
}

export function GoalCard({ goal }: GoalCardProps) {
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

  return (
    <Card className="group relative overflow-hidden p-6 hover:shadow-lg transition-all border border-border/50 bg-card hover:border-primary/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md transition-transform group-hover:scale-105"
            style={{ backgroundColor: goal.color || "hsl(var(--primary))" }}
          >
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {goal.name}
            </h3>
            {goal.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">{goal.description}</p>
            )}
          </div>
        </div>

        <Badge 
          variant={isCompleted ? "default" : "outline"}
          className={isCompleted ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-primary/5 text-primary border-primary/20"}
        >
          {isCompleted ? (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Concluída
            </span>
          ) : (
            "Em Progresso"
          )}
        </Badge>
      </div>

      <div className="space-y-3 my-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-medium">Progresso ({percentage}%)</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(current)} <span className="text-xs font-normal text-muted-foreground">de {formatCurrency(target)}</span>
          </span>
        </div>

        <Progress 
          value={percentage} 
          className="h-2.5 bg-muted/60"
        />

        <div className="flex justify-between text-xs text-muted-foreground pt-1">
          <span>Restante: <strong className="text-foreground">{formatCurrency(remaining)}</strong></span>
          {goal.target_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              {new Date(goal.target_date).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-border/40 flex justify-end">
        <Link 
          href={`/dashboard/goals/${goal.id}`}
          className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1"
        >
          Ver Detalhes <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  )
}
