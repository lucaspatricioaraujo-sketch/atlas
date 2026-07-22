export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r hidden md:block bg-card text-card-foreground p-6">
        <h2 className="text-xl font-bold mb-8">Atlas Financeiro</h2>
        <nav className="space-y-4">
          {/* Navegação virá aqui no futuro */}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col p-8">
        {children}
      </main>
    </div>
  )
}
