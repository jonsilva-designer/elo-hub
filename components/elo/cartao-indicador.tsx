import Link from 'next/link'
import type { ReactNode } from 'react'
import { formatarNumero } from '@/lib/formato'
import { cn } from '@/lib/utils'

const CAIXA = 'block min-w-0 rounded-xl border border-border bg-card p-[18px]'

/** Quatro colunas no computador, depois duas, depois uma (seção 5 do padrão visual). */
export function GradeIndicadores({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
}

/** Indicador do painel. Com `href` o cartão inteiro é um link para a lista filtrada. */
export function CartaoIndicador({
  rotulo,
  valor,
  detalhe,
  href,
}: {
  rotulo: string
  valor: number
  detalhe?: ReactNode
  href?: string
}) {
  const conteudo = (
    <>
      <span className="block text-rotulo font-semibold uppercase tracking-[.09em] text-muted-foreground">
        {rotulo}
      </span>
      <span className="mt-2 block font-mono text-indicador font-medium tabular-nums text-primary">
        {formatarNumero(valor)}
      </span>
      {/* `!= null`: um detalhe zero também aparece. */}
      {detalhe != null ? (
        <span className="mt-1 block text-secundario text-muted-foreground">{detalhe}</span>
      ) : null}
    </>
  )
  if (href) {
    return (
      <Link href={href} className={cn(CAIXA, 'transition-colors hover:border-input')}>
        {conteudo}
      </Link>
    )
  }
  return <div className={CAIXA}>{conteudo}</div>
}
