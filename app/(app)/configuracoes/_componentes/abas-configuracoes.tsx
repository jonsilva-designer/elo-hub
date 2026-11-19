'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CLASSE_ABA, CLASSE_LISTA_ABAS } from '@/components/ui/tabs'

const ABAS = [
  { rotulo: 'Usuários', href: '/configuracoes/usuarios' },
  { rotulo: 'Listas oficiais', href: '/configuracoes/listas' },
  { rotulo: 'Parâmetros', href: '/configuracoes/parametros' },
]

/**
 * As três telas de configuração do Administrador (parte 8, escolha 2), como abas no topo. São links entre páginas,
 * com o mesmo visual das abas da página do cliente: a ativa leva o sublinhado (data-active).
 */
export function AbasConfiguracoes() {
  const rota = usePathname()
  return (
    <nav aria-label="Configurações" className={cn(CLASSE_LISTA_ABAS, 'mb-5')}>
      {ABAS.map((a) => {
        const atual = rota === a.href || rota.startsWith(`${a.href}/`)
        return (
          <Link
            key={a.href}
            href={a.href}
            aria-current={atual ? 'page' : undefined}
            data-active={atual ? '' : undefined}
            className={CLASSE_ABA}
          >
            {a.rotulo}
          </Link>
        )
      })}
    </nav>
  )
}
