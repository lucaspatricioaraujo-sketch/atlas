import { Metadata } from "next"
import { TransactionForm } from "@/features/transactions/components/TransactionForm"
import { PageHeader } from "@/components/design/PageHeader"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Nova Transação | Atlas Financeiro",
}

export default function NewTransactionPage() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Nova Transação" 
        description="Registre uma nova movimentação financeira no seu Atlas."
        action={
          <Link href="/dashboard/transactions">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        }
      />
      
      <TransactionForm />
    </div>
  )
}
