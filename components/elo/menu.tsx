'use client'

import { Palette } from 'lucide-react'
import Link from 'next/link'
import type { Usuario } from '@/lib/dados/tipos'
import { cn } from '@/lib/utils'
import { itemAtivo, itensDoPerfil } from './navegacao'

// Pressionado: um passo mais forte que o passar o mouse, nos tons da lateral (padrão 7).
const BASE_ITEM =
  'relative mx-2.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground active:bg-sidebar-accent-active active:text-sidebar-accent-foreground'
const ITEM_ATIVO =
  "bg-sidebar-accent font-semibold text-sidebar-accent-foreground before:absolute before:top-2 before:bottom-2 before:left-0 before:w-[3px] before:rounded-sm before:bg-sidebar-primary before:content-['']"

type PropsMenu = {
  usuario: Usuario
  /** Endereço da página, para marcar o item atual. `null` não marca nenhum (rota ainda desconhecida). */
  rotaAtual: string | null
  aoNavegar?: () => void
}

const ativo = (rotaAtual: string | null, href: string) => rotaAtual !== null && itemAtivo(rotaAtual, href)

/** Lista de links do menu principal, usada pela lateral e pela gaveta do celular. */
export function Menu({ usuario, rotaAtual, aoNavegar }: PropsMenu) {
  const itens = itensDoPerfil(usuario.perfil)
  const grupos = [null, 'Carteira', 'Apoio'] as const

  return (
    <nav aria-label="Menu principal" className="flex flex-col gap-4 overflow-y-auto py-2">
      {grupos.map((grupo) => {
        const doGrupo = itens.filter((i) => i.grupo === grupo)
        if (doGrupo.length === 0) return null
        return (
          <div key={grupo ?? 'geral'} className="flex flex-col gap-0.5">
            {grupo ? (
              <div className="mx-2.5 mb-1 px-3 text-[10.5px] font-semibold tracking-[.12em] text-sidebar-primary uppercase">
                {grupo}
              </div>
            ) : null}
            {doGrupo.map((item) => {
              const atual = ativo(rotaAtual, item.href)
              const Icone = item.icone
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onNavigate={aoNavegar}
                  aria-current={atual ? 'page' : undefined}
                  className={cn(BASE_ITEM, atual && ITEM_ATIVO)}
                >
                  <Icone className="size-4 shrink-0" aria-hidden="true" />
                  {item.rotulo}
                </Link>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}

/** Rodapé do menu: link do padrão visual e o usuário. Compartilhado pela lateral e pela gaveta. */
export function RodapeMenu({ usuario, rotaAtual, aoNavegar }: PropsMenu) {
  const atual = ativo(rotaAtual, '/designsystem')
  return (
    <div className="mt-auto border-t border-sidebar-border pt-2 pb-3">
      <Link
        href="/designsystem"
        onNavigate={aoNavegar}
        aria-current={atual ? 'page' : undefined}
        className={cn(BASE_ITEM, 'mb-2 py-1.5 text-xs', atual && ITEM_ATIVO)}
      >
        <Palette className="size-4 shrink-0" aria-hidden="true" />
        Padrão visual
      </Link>
      <div className="mx-2.5 px-3">
        <div className="text-[13px] font-semibold text-sidebar-accent-foreground">{usuario.nome}</div>
        <div className="text-xs text-lateral-texto-fraco">{usuario.perfil}</div>
      </div>
    </div>
  )
}
