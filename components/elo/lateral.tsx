'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { Usuario } from '@/lib/dados/tipos'
import { Menu, RodapeMenu } from './menu'

type Props = { usuario: Usuario }
type PropsEstatica = { usuario: Usuario | null }

/** Lateral flutuante, a 12px das bordas. Abaixo de 1024px dá lugar à barra do celular. */
export function Lateral({ usuario }: Props) {
  return <CorpoLateral usuario={usuario} rotaAtual={usePathname()} />
}

/**
 * A mesma lateral, sem ler o endereço e sem item marcado. É a espera do Suspense do layout
 * enquanto a rota não é conhecida (rota dinâmica fora do `generateStaticParams`).
 */
export function LateralEstatica({ usuario }: PropsEstatica) {
  return <CorpoLateral usuario={usuario} rotaAtual={null} />
}

function CorpoLateral({ usuario, rotaAtual }: PropsEstatica & { rotaAtual: string | null }) {
  return (
    <aside
      data-sidebar
      className="sticky top-3 my-3 ml-3 hidden h-[calc(100dvh---spacing(6))] w-lateral shrink-0 flex-col rounded-2xl bg-sidebar text-sidebar-foreground shadow-[var(--shadow-flutuante)] lg:flex"
    >
      <div className="flex justify-center px-4 pt-5 pb-3">
        {/* Sem preload nem loading="eager": no celular a lateral fica escondida e o logo não deve baixar.
            O carregamento preguiçoso pula imagem escondida; a prioridade alta adianta a visível. */}
        <Image
          src="/marca/logo-elo-claro.png"
          alt="ELO HUB"
          width={814}
          height={627}
          fetchPriority="high"
          className="h-14 w-auto"
        />
      </div>
      <Menu usuario={usuario} rotaAtual={rotaAtual} />
      <RodapeMenu usuario={usuario} rotaAtual={rotaAtual} />
    </aside>
  )
}
