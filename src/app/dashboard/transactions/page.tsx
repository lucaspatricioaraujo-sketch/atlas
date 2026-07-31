import { Metadata } from "next"
import { TransactionsList } from "@/features/transactions/components/TransactionsList"

export const metadata: Metadata = {
  title: "Transações | Atlas Financeiro",
  description: "Gerencie suas receitas, despesas e transferências.",
}

export default function TransactionsPage() {
  return (
    <div className="w-full">
      <TransactionsList />
    </div>
  )
}
