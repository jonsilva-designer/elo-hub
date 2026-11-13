'use client'

import { Menu as IconeMenu, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { Usuario } from '@/lib/dados/tipos'
import { cn } from '@/lib/utils'
import { Menu, RodapeMenu } from './menu'

// Botões discretos sobre o azul-marinho: passar o mouse e pressionar usam o tom da lateral,
// e não o fundo claro do botão discreto.
const SOBRE_A_LATERAL =
  'text-sidebar-accent-foreground not-disabled:not-aria-disabled:hover:bg-sidebar-accent not-disabled:not-aria-disabled:active:bg-sidebar-accent aria-expanded:bg-sidebar-accent'

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
            className={SOBRE_A_LATERAL}
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
              className={cn('absolute top-3 right-3', SOBRE_A_LATERAL)}
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
