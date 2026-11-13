'use client'

import Image from 'next/image'
import type { Usuario } from '@/lib/dados/tipos'
import { Menu, RodapeMenu } from './menu'

/** Lateral flutuante, a 12px das bordas. Abaixo de 1024px dá lugar à barra do celular. */
export function Lateral({ usuario }: { usuario: Usuario }) {
  return (
    <aside
      data-sidebar
      className="sticky top-3 my-3 ml-3 hidden h-[calc(100dvh-1.5rem)] w-[212px] shrink-0 flex-col rounded-2xl bg-sidebar text-sidebar-foreground shadow-[var(--shadow-flutuante)] lg:flex"
    >
      <div className="flex justify-center px-4 pt-5 pb-3">
        <Image
          src="/marca/logo-elo-claro.png"
          alt="ELO HUB"
          width={814}
          height={627}
          priority
          className="h-14 w-auto"
        />
      </div>
      <Menu usuario={usuario} />
      <RodapeMenu usuario={usuario} />
    </aside>
  )
}
