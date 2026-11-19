import Link from 'next/link'
import { Num } from '@/components/elo/num'
import { formatarNumero } from '@/lib/formato'
import type { Contagem } from './composicao'

/**
 * Contagens em linhas (revisão do Início, 19/11/2026): o nome à esquerda e o número à direita, todas com a mesma
 * altura; o nome longo é cortado com reticências, e não quebra. A linha inteira leva à lista filtrada (CA-13.3).
 */
export function ListaContagens({ itens }: { itens: Contagem[] }) {
  return (
    <ul className="divide-y divide-divisoria">
      {itens.map((i) => (
        <li key={i.href}>
          <Link
            href={i.href}
            aria-label={`${i.rotulo}: ${formatarNumero(i.valor)}`}
            className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:bg-papel"
          >
            <span className="truncate text-sm text-foreground">{i.rotulo}</span>
            <Num className="text-sm font-semibold text-primary">{formatarNumero(i.valor)}</Num>
          </Link>
        </li>
      ))}
    </ul>
  )
}
