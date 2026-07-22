"use client"

import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
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
