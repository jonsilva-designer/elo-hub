'use client'

import { Menu as IconeMenu, X } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { Usuario } from '@/lib/dados/tipos'
import { cn } from '@/lib/utils'
import { Menu, RodapeMenu, SOBRE_A_LATERAL } from './menu'

type Props = { usuario: Usuario }
type PropsEstatica = { usuario: Usuario | null }

/** Barra do celular (abaixo de 1024px) com o botão que abre a gaveta do menu. */
export function BarraTopo({ usuario }: Props) {
  return <CorpoBarraTopo usuario={usuario} rotaAtual={usePathname()} />
}

/**
 * A mesma barra, sem ler o endereço: na gaveta, nenhum item fica marcado. É a espera do
 * Suspense do layout enquanto a rota não é conhecida (rota dinâmica fora do `generateStaticParams`).
 */
export function BarraTopoEstatica({ usuario }: PropsEstatica) {
  return <CorpoBarraTopo usuario={usuario} rotaAtual={null} />
}

function CorpoBarraTopo({ usuario, rotaAtual }: PropsEstatica & { rotaAtual: string | null }) {
  const [aberta, setAberta] = useState(false)
  const fechar = () => setAberta(false)

  return (
    // data-sidebar: o foco do teclado sobre o azul-marinho é dourado, como na lateral.
    <header data-sidebar className="sticky top-0 z-40 flex items-center justify-between bg-sidebar px-4 py-2 lg:hidden">
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
            <IconeMenu aria-hidden="true" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          showCloseButton={false}
          data-sidebar
          aria-describedby={undefined}
          className="data-[side=left]:w-gaveta data-[side=left]:sm:max-w-gaveta gap-0 rounded-r-2xl border-0 bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn('absolute top-3 right-3', SOBRE_A_LATERAL)}
            >
              <X aria-hidden="true" />
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
          <Menu usuario={usuario} rotaAtual={rotaAtual} aoNavegar={fechar} />
          <RodapeMenu usuario={usuario} rotaAtual={rotaAtual} aoNavegar={fechar} />
        </SheetContent>
      </Sheet>
    </header>
  )
}
