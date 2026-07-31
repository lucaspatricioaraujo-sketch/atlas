"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GoalForm } from "@/features/goals/components/GoalForm"

export default function NewGoalPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/goals" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Meta Financeira</h1>
          <p className="text-sm text-muted-foreground">Defina um novo objetivo para poupar e acompanhar.</p>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-border/50 bg-card">
        <GoalForm />
      </div>
    </div>
  )
}
