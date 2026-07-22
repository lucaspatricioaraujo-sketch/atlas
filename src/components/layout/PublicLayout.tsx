export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center border-b px-6">
        <span className="text-xl font-bold">Atlas Financeiro</span>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Atlas Financeiro. Todos os direitos reservados.
      </footer>
    </div>
  )
}
