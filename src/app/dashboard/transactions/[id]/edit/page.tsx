"use client"

import { use } from "react"
import { TransactionForm } from "@/features/transactions/components/TransactionForm"
import { PageHeader } from "@/components/design/PageHeader"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTransaction } from "@/features/transactions/hooks/use-transactions"
import { LoadingSkeleton } from "@/components/design/LoadingSkeleton"
import { EmptyState } from "@/components/design/EmptyState"

export default function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: transaction, isLoading, error } = useTransaction(id)

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton className="h-20 w-full" />
        <LoadingSkeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <EmptyState 
          title="Transação não encontrada" 
          description="A transação que você tentou acessar não existe ou você não tem permissão."
          action={
            <Link href="/dashboard/transactions">
              <Button>Voltar para Transações</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Editar Transação" 
        description="Atualize os detalhes desta movimentação financeira."
        action={
          <Link href="/dashboard/transactions">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        }
      />
      
      <TransactionForm initialData={transaction} />
    </div>
  )
}
