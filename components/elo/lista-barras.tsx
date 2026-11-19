import Link from 'next/link'
import { Num } from '@/components/elo/num'
import { formatarNumero } from '@/lib/formato'
import { cn } from '@/lib/utils'

export type ItemBarra = {
  rotulo: string
  valor: number
  /** A lista já filtrada que o número representa (CA-13.3). */
  href: string
  tom?: 'atencao' | 'problema' | 'concluido'
}

/** A cor da barra: azul-marinho sem tom; com tom, a cor de status do padrão visual. */
const COR: Record<NonNullable<ItemBarra['tom']> | 'neutro', string> = {
  neutro: 'bg-primary',
  atencao: 'bg-[var(--elo-status-atencao)]',
  problema: 'bg-[var(--elo-status-problema)]',
  concluido: 'bg-[var(--elo-status-concluido)]',
}

/**
 * Gráfico de barras horizontais (revisão do Início, 19/11/2026): uma linha por item, com o nome à esquerda, o número à
 * direita e a barra embaixo, proporcional ao maior valor da lista. A linha inteira leva à lista filtrada. As linhas
 * têm a mesma altura: o nome longo é cortado com reticências, e não quebra.
 */
export function ListaBarras({ itens, duasColunas = false }: { itens: ItemBarra[]; duasColunas?: boolean }) {
  const maior = Math.max(0, ...itens.map((i) => i.valor))
  return (
    <ul className={cn('grid gap-y-1', duasColunas && 'gap-x-6 sm:grid-cols-2')}>
      {itens.map((i) => {
        const largura = maior > 0 ? Math.round((Math.max(i.valor, 0) / maior) * 100) : 0
        return (
          <li key={i.href}>
            <Link
              href={i.href}
              aria-label={`${i.rotulo}: ${formatarNumero(i.valor)}`}
              data-tom={i.tom}
              className="-mx-2 block rounded-md px-2 py-1.5 transition-colors hover:bg-papel"
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm text-foreground">{i.rotulo}</span>
                <Num className="text-sm font-semibold text-primary">{formatarNumero(i.valor)}</Num>
              </span>
              <span className="mt-1.5 block h-1.5 rounded-full bg-muted">
                {/* A largura vem do dado (a proporção do maior valor), e não do layout. */}
                <span data-barra className={cn('block h-full rounded-full', COR[i.tom ?? 'neutro'])} style={{ width: `${largura}%` }} />
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
