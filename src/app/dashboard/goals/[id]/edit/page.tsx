"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { GoalForm } from "@/features/goals/components/GoalForm"
import { useGoal } from "@/features/goals/hooks/use-goals"

interface EditGoalPageProps {
  params: Promise<{ id: string }>
}

export default function EditGoalPage({ params }: EditGoalPageProps) {
  const { id } = use(params)
  const { data: goal, isLoading } = useGoal(id)

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (!goal) {
    return <div>Meta não encontrada.</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/goals/${id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Meta</h1>
          <p className="text-sm text-muted-foreground">Atualize os detalhes da meta financeira.</p>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-border/50 bg-card">
        <GoalForm initialData={goal} />
      </div>
    </div>
  )
}
