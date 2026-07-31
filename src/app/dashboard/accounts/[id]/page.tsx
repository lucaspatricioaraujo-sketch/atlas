import { AccountDetails } from "@/features/accounts/components/AccountDetails"

export const metadata = {
  title: "Detalhes da Conta | Atlas Financeiro",
}

interface AccountDetailsPageProps {
  params: {
    id: string
  }
}

export default function AccountDetailsPage({ params }: AccountDetailsPageProps) {
  return (
    <div className="w-full h-full p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <AccountDetails accountId={params.id} />
    </div>
  )
}
