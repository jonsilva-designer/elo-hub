import Link from 'next/link'
import { Num } from '@/components/elo/num'
import { formatarNumero } from '@/lib/formato'
import { cn } from '@/lib/utils'

type Tom = 'atencao' | 'problema' | 'concluido'

export type Contagem = {
  rotulo: string
  valor: number
  /** A lista já filtrada que o número representa (CA-13.3). */
  href: string
  tom?: Tom
}

/** A cor da parte: azul-marinho sem tom; com tom, a cor de status do padrão visual. */
const COR: Record<Tom | 'neutro', string> = {
  neutro: 'bg-primary',
  atencao: 'bg-[var(--elo-status-atencao)]',
  problema: 'bg-[var(--elo-status-problema)]',
  concluido: 'bg-[var(--elo-status-concluido)]',
}

// Sem arredondar: a parte de 0,3% arredondada viraria zero e sumiria da barra, ainda que esteja na legenda.
const porcento = (valor: number, total: number) => (total > 0 ? (Math.max(valor, 0) / total) * 100 : 0)

/**
 * Um todo e as partes dele (revisão do Início, 19/11/2026): o total em destaque, uma barra só, dividida na proporção de
 * cada parte, e a legenda com o número de cada uma. As partes somam o total, e cada número leva à lista já filtrada.
 * O complemento (os suspensos, as concluídas) fica numa linha à parte, fora da barra, porque não é parte desse todo.
 */
export function Composicao({ total, partes, complemento }: { total: Contagem; partes: Contagem[]; complemento?: Contagem }) {
  const resumo = `${formatarNumero(total.valor)} ${total.rotulo}: ${partes.map((p) => `${p.rotulo} ${formatarNumero(p.valor)}`).join(', ')}`
  return (
    <div className="space-y-4">
      <Link
        href={total.href}
        aria-label={`${formatarNumero(total.valor)} ${total.rotulo}`}
        className="inline-flex items-baseline gap-2 rounded-sm hover:underline"
      >
        <Num className="text-indicador font-medium text-primary">{formatarNumero(total.valor)}</Num>
        <span className="text-sm text-muted-foreground">{total.rotulo}</span>
      </Link>
      <div role="img" aria-label={resumo} className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-muted">
        {total.valor > 0
          ? partes
              .filter((p) => p.valor > 0)
              .map((p) => (
                // A largura vem do dado (a fatia do total), e não do layout.
                <span key={p.href} data-parte className={cn('min-w-1', COR[p.tom ?? 'neutro'])} style={{ width: `${porcento(p.valor, total.valor)}%` }} />
              ))
          : null}
      </div>
      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-3">
        {partes.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              aria-label={`${p.rotulo}: ${formatarNumero(p.valor)}`}
              data-tom={p.tom}
              className="flex items-center gap-2 rounded-sm text-sm hover:underline"
            >
              <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', COR[p.tom ?? 'neutro'])} />
              <span className="truncate text-foreground">{p.rotulo}</span>
              <Num className="ml-auto font-semibold text-primary">{formatarNumero(p.valor)}</Num>
            </Link>
          </li>
        ))}
      </ul>
      {complemento ? (
        <div className="border-t border-divisoria pt-3">
          <Link
            href={complemento.href}
            aria-label={`${complemento.rotulo}: ${formatarNumero(complemento.valor)}`}
            data-tom={complemento.tom}
            className="flex items-center gap-2 rounded-sm text-sm text-muted-foreground hover:underline"
          >
            {complemento.rotulo}
            <Num className="font-semibold text-primary">{formatarNumero(complemento.valor)}</Num>
          </Link>
        </div>
      ) : null}
    </div>
  )
}
