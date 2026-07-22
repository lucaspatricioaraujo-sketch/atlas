import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserMenu } from "./UserMenu"
import { MobileNavigation } from "./MobileNavigation"

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6 bg-card text-card-foreground">
      <div className="flex items-center gap-4">
        <MobileNavigation />
        <span className="md:hidden font-bold">Atlas</span>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
