import { AccountForm } from "@/features/accounts/components/AccountForm"
import { PageHeader } from "@/components/design/PageHeader"

export const metadata = {
  title: "Nova Conta | Atlas Financeiro",
}

export default function NewAccountPage() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader 
        title="Nova Conta" 
        description="Cadastre uma nova conta, cartão ou carteira digital para gerenciar seu saldo."
      />
      <AccountForm />
    </div>
  )
}
