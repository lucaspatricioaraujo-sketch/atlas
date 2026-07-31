"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { AccountForm } from "@/features/accounts/components/AccountForm"
import { PageHeader } from "@/components/design/PageHeader"
import { useAccount } from "@/features/accounts/hooks/use-accounts"
import { LoadingSkeleton } from "@/components/design/LoadingSkeleton"

export default function EditAccountPage() {
  const params = useParams()
  const id = params.id as string
  const { data: account, isLoading } = useAccount(id)

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <LoadingSkeleton className="h-20 w-full" />
        <LoadingSkeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!account) {
    return <div className="p-8 text-center text-muted-foreground">Conta não encontrada.</div>
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader 
        title="Editar Conta" 
        description={`Alterando configurações da conta: ${account.name}`}
      />
      <AccountForm initialData={account} />
    </div>
  )
}
