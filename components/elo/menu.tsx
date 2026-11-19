'use client'

import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { sair } from '@/lib/acesso/acoes'
import type { Usuario } from '@/lib/dados/tipos'
import { cn } from '@/lib/utils'
import { BotaoIcone } from './botao-icone'
import { itemAtivo, itensDoPerfil } from './navegacao'

// Pressionado: um passo mais forte que o passar o mouse, nos tons da lateral (padrão 7).
const BASE_ITEM =
  'relative mx-2.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-secundario font-medium text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground active:bg-sidebar-accent-active active:text-sidebar-accent-foreground'
const ITEM_ATIVO =
  "bg-sidebar-accent font-semibold text-sidebar-accent-foreground before:absolute before:top-2 before:bottom-2 before:left-0 before:w-0.75 before:rounded-sm before:bg-sidebar-primary before:content-['']"

// Botões discretos sobre o azul-marinho: passar o mouse e pressionar usam os tons da lateral,
// e não o fundo claro do botão discreto. Pressionado é um passo mais forte que passar o mouse.
export const SOBRE_A_LATERAL =
  'text-sidebar-accent-foreground not-disabled:not-aria-disabled:hover:bg-sidebar-accent not-disabled:not-aria-disabled:active:bg-sidebar-accent-active aria-expanded:bg-sidebar-accent'

type PropsMenu = {
  /** `null` enquanto o usuário não chegou (espera do Suspense): sem nome, perfil nem Sair. */
  usuario: Usuario | null
  /** Endereço da página, para marcar o item atual. `null` não marca nenhum (rota ainda desconhecida). */
  rotaAtual: string | null
  aoNavegar?: () => void
}

const ativo = (rotaAtual: string | null, href: string) => rotaAtual !== null && itemAtivo(rotaAtual, href)

/** Lista de links do menu principal, usada pela lateral e pela gaveta do celular. */
export function Menu({ usuario, rotaAtual, aoNavegar }: PropsMenu) {
  const itens = itensDoPerfil(usuario?.perfil ?? null)
  const grupos = [null, 'Carteira', 'Apoio'] as const

  return (
    <nav aria-label="Menu principal" className="flex flex-col gap-4 overflow-y-auto overscroll-contain py-2">
      {grupos.map((grupo) => {
        const doGrupo = itens.filter((i) => i.grupo === grupo)
        if (doGrupo.length === 0) return null
        return (
          <div key={grupo ?? 'geral'} className="flex flex-col gap-0.5">
            {grupo ? (
              <div className="mx-2.5 mb-1 px-3 text-grupo font-semibold tracking-grupo text-sidebar-primary uppercase">
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

/** Rodapé do menu: o usuário e Sair. Compartilhado pela lateral e pela gaveta. O padrão visual saiu do menu
 * (pedido do Jonathan, 19/11/2026) e abre só pelo endereço /designsystem. */
export function RodapeMenu({ usuario }: PropsMenu) {
  return (
    <div className="mt-auto border-t border-sidebar-border pt-3 pb-3">
      {usuario ? (
        <div className="mx-2.5 flex items-center justify-between gap-2 pl-3">
          <div className="min-w-0">
            <div className="truncate text-secundario font-semibold text-sidebar-accent-foreground">{usuario.nome}</div>
            <div className="text-xs text-lateral-texto-fraco">{usuario.perfil}</div>
          </div>
          <form action={sair}>
            <BotaoIcone type="submit" rotulo="Sair" icone={LogOut} size="icon-sm" className={SOBRE_A_LATERAL} />
          </form>
        </div>
      ) : null}
    </div>
  )
}
