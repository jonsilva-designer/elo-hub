'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'

const ABAS = [
  { rotulo: 'Usuários', href: '/configuracoes/usuarios' },
  { rotulo: 'Listas oficiais', href: '/configuracoes/listas' },
  { rotulo: 'Parâmetros', href: '/configuracoes/parametros' },
]

/** As três telas de configuração do Administrador (parte 8, escolha 2), como abas no topo. */
export function AbasConfiguracoes() {
  const rota = usePathname()
  return (
    <nav aria-label="Configurações" className="mb-5 flex flex-wrap gap-2">
      {ABAS.map((a) => {
        const atual = rota === a.href || rota.startsWith(`${a.href}/`)
        return (
          <Link
            key={a.href}
            href={a.href}
            aria-current={atual ? 'page' : undefined}
            className={buttonVariants({ variant: atual ? 'secondary' : 'ghost' })}
          >
            {a.rotulo}
          </Link>
        )
      })}
    </nav>
  )
}
