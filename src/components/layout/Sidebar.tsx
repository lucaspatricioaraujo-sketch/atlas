"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  ArrowRightLeft, 
  Target, 
  PieChart, 
  Sparkles, 
  Settings,
  PiggyBank
} from "lucide-react"

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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card text-card-foreground">
      {/* Header / Family Switcher */}
      <div className="h-16 flex items-center px-4 border-b">
        <FamilySwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto scrollbar-thin">
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

      {/* Footer Navigation */}
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
    </aside>
  )
}
