"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Tabs as TabsPrimitive } from "radix-ui"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-3 data-horizontal:flex-col", className)}
      {...props}
    />
  )
}

// Abas sublinhadas, sem fundo de pílula. A divisória fica embaixo da lista, desenhada por dentro (sombra interna),
// e o sublinhado da aba ativa passa por cima dela. Nada sai da altura da lista: sem setas de rolagem. Em tela estreita,
// a lista rola na horizontal sem mostrar barra.
// Passar o mouse escurece o texto; pressionar mostra o sublinhado no tom da borda de campo (padrão 7).
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex w-full items-center gap-5 overflow-x-auto overflow-y-hidden text-muted-foreground shadow-[inset_0_-1px_0_var(--color-divisoria)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 rounded-sm border-b-2 border-transparent px-0.5 pt-1 pb-2.5 text-secundario font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground not-disabled:active:text-foreground not-disabled:not-data-active:active:border-input disabled:pointer-events-none disabled:opacity-50 data-active:border-primary data-active:font-semibold data-active:text-primary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
