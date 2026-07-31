import { AccountsList } from "@/features/accounts/components/AccountsList"

export const metadata = {
  title: "Contas | Atlas Financeiro",
}

export default function AccountsPage() {
  return (
    <div className="w-full h-full p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <AccountsList />
    </div>
  )
}
