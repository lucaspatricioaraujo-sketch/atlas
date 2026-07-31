"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, LayoutDashboard, Wallet, CreditCard, ArrowRightLeft, Target, PieChart, Sparkles, Settings, PiggyBank } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { FamilySwitcher } from "./FamilySwitcher"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Contas", href: "/dashboard/accounts", icon: Wallet },
  { name: "Cartões", href: "/dashboard/cards", icon: CreditCard },
  { name: "Transações", href: "/dashboard/transactions", icon: ArrowRightLeft },
  { name: "Orçamentos", href: "/dashboard/budgets", icon: PiggyBank },
  { name: "Metas", href: "/dashboard/goals", icon: Target },
  { name: "Relatórios", href: "/dashboard/reports", icon: PieChart },
  { name: "AI Assistant", href: "/dashboard/copilot", icon: Sparkles },
]

export function MobileNavigation() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  // Close sheet when route changes
  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="md:hidden shrink-0 inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-colors outline-none">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        <SheetHeader className="h-16 flex items-center justify-center border-b px-4 text-left">
          <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
          <FamilySwitcher />
        </SheetHeader>
        
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              pathname.startsWith("/dashboard/settings")
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
