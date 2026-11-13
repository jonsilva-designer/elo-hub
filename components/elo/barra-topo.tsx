'use client'

import { Menu as IconeMenu, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { Usuario } from '@/lib/dados/tipos'
import { Menu, RodapeMenu } from './menu'

/** Barra do celular (abaixo de 1024px) com o botão que abre a gaveta do menu. */
export function BarraTopo({ usuario }: { usuario: Usuario }) {
  const [aberta, setAberta] = useState(false)
  const fechar = () => setAberta(false)

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-sidebar px-4 py-2 lg:hidden">
      <Image
        src="/marca/logo-elo-claro.png"
        alt="ELO HUB"
        width={814}
        height={627}
        className="h-9 w-auto"
      />
      <Sheet open={aberta} onOpenChange={setAberta}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-accent-foreground not-disabled:not-aria-disabled:hover:bg-sidebar-accent aria-expanded:bg-sidebar-accent"
          >
            <IconeMenu strokeWidth={1.6} aria-hidden="true" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          showCloseButton={false}
          data-sidebar
          aria-describedby={undefined}
          className="data-[side=left]:w-[280px] data-[side=left]:sm:max-w-[280px] gap-0 rounded-r-2xl border-0 bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-3 right-3 text-sidebar-accent-foreground not-disabled:not-aria-disabled:hover:bg-sidebar-accent"
            >
              <X strokeWidth={1.6} aria-hidden="true" />
              <span className="sr-only">Fechar menu</span>
            </Button>
          </SheetClose>
          <div className="flex justify-center px-4 pt-5 pb-3">
            <Image
              src="/marca/logo-elo-claro.png"
              alt="ELO HUB"
              width={814}
              height={627}
              className="h-14 w-auto"
            />
          </div>
          <Menu usuario={usuario} aoNavegar={fechar} />
          <RodapeMenu usuario={usuario} aoNavegar={fechar} />
        </SheetContent>
      </Sheet>
    </header>
  )
}
