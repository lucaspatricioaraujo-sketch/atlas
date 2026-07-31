"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BudgetForm } from "@/features/budgets/components/BudgetForm"

export default function NewBudgetPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/budgets" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Orçamento</h1>
          <p className="text-sm text-muted-foreground">Defina um teto de gastos para controlar seu orçamento.</p>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-border/50 bg-card">
        <BudgetForm />
      </div>
    </div>
  )
}
