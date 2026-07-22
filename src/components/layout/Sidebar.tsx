import Link from "next/link"
import { Home, PieChart, Settings } from "lucide-react"

export function Sidebar() {
  return (
    <aside className="w-64 border-r hidden md:flex flex-col bg-card text-card-foreground p-4">
      <div className="flex h-14 items-center px-4 font-bold text-xl">
        Atlas Financeiro
      </div>
      <nav className="flex-1 space-y-2 py-4">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-4 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <Home className="h-5 w-5" />
          Dashboard
        </Link>
        <Link href="/dashboard/reports" className="flex items-center gap-3 rounded-lg px-4 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <PieChart className="h-5 w-5" />
          Relatórios
        </Link>
      </nav>
      <div className="mt-auto pt-4">
        <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-4 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <Settings className="h-5 w-5" />
          Configurações
        </Link>
      </div>
    </aside>
  )
}
