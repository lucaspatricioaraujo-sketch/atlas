"use client"

import * as React from "react"
import { Search, Bell } from "lucide-react"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserMenu } from "./UserMenu"
import { MobileNavigation } from "./MobileNavigation"
import { Button } from "@/components/ui/button"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

export function Topbar() {
  const pathname = usePathname()
  
  // Basic breadcrumb generation (can be improved with a route map)
  const paths = pathname.split("/").filter(Boolean)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      
      <div className="flex items-center gap-2">
        <MobileNavigation />
        <span className="md:hidden font-bold tracking-tight text-lg ml-1">Atlas</span>
      </div>

      <div className="hidden md:flex items-center flex-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {paths.length > 1 && <BreadcrumbSeparator />}
            {paths.length > 1 && (
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">
                  {paths[1].replace("-", " ")}
                </BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-end gap-3 flex-1 md:flex-initial">
        <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0" aria-label="Buscar">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0 relative" aria-label="Notificações">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-destructive border-2 border-background"></span>
        </Button>
        <ThemeToggle />
        <UserMenu />
      </div>
      
    </header>
  )
}
