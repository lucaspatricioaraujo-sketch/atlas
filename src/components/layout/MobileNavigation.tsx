"use client"

import { useState } from "react"
import Link from "next/link"
import { Home, Menu, PieChart, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen(!isOpen)
  const close = () => setIsOpen(false)

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={toggle} aria-label="Abrir menu">
        <Menu className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex bg-background/80 backdrop-blur-sm">
          <aside className="w-64 bg-card h-full flex flex-col p-4 shadow-xl border-r">
            <div className="flex items-center justify-between h-14 px-2">
              <span className="font-bold text-xl">Atlas Financeiro</span>
              <Button variant="ghost" size="icon" onClick={close}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="flex-1 space-y-2 mt-4">
              <Link href="/dashboard" onClick={close} className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <Home className="h-5 w-5" />
                Dashboard
              </Link>
              <Link href="/dashboard/reports" onClick={close} className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <PieChart className="h-5 w-5" />
                Relatórios
              </Link>
            </nav>
            <div className="mt-auto pt-4 border-t">
              <Link href="/dashboard/settings" onClick={close} className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <Settings className="h-5 w-5" />
                Configurações
              </Link>
            </div>
          </aside>
          <div className="flex-1" onClick={close} />
        </div>
      )}
    </div>
  )
}
