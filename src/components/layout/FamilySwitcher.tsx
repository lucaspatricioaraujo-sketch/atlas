"use client"

import * as React from "react"
import { ChevronsUpDown, Building2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function FamilySwitcher() {
  // In the future, fetch current family and roles from global state or context
  const activeFamily = { name: "Família Silva", role: "OWNER" }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 px-2 hover:bg-accent/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col items-start text-sm leading-none flex-1 overflow-hidden">
            <span className="font-semibold truncate w-full text-left">{activeFamily.name}</span>
            <span className="text-xs text-muted-foreground">{activeFamily.role}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" alignOffset={-4}>
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
          Workspaces (Famílias)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <Building2 className="h-3 w-3" />
          </div>
          <span className="font-medium">{activeFamily.name}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-muted-foreground">
          Criar nova Família...
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
