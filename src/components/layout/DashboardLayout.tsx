"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { useSupabase } from "@/providers/supabase-provider"
import { Loader2 } from "lucide-react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { familyId, isLoading, user } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    // Only redirect after loading is complete and user is authenticated but has no family
    if (!isLoading && user && familyId === null) {
      router.push("/create-family")
    }
  }, [isLoading, user, familyId, router])

  // Show a full-screen loader while resolving auth + family
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando Atlas...</p>
        </div>
      </div>
    )
  }

  // While redirecting to create-family, don't render the shell
  if (user && familyId === null) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-muted/20">
        <Topbar />
        <main className="flex-1 flex flex-col p-4 md:p-6 xl:p-8 overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
