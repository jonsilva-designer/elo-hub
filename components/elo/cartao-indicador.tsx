import Link from 'next/link'
import type { ReactNode } from 'react'
import { formatarNumero } from '@/lib/formato'
import { cn } from '@/lib/utils'
import { CLASSE_ROTULO } from './textos'

const CAIXA = 'block min-w-0 rounded-xl border border-border bg-card p-4.5'

/** O destaque do indicador, como a barra da linha da tabela: âmbar para atenção e vermelho para problema. */
const BARRA = {
  atencao: 'shadow-[inset_3px_0_0_var(--elo-status-atencao)]',
  problema: 'shadow-[inset_3px_0_0_var(--elo-status-problema)]',
}

/** Quatro colunas no computador, depois duas, depois uma (seção 5 do padrão visual). */
export function GradeIndicadores({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
}

/**
 * Indicador do painel. Com `href` o cartão inteiro é um link para a lista filtrada. Com `tom`, ganha a barra de 3px na
 * borda esquerda, como os destaques de contrato e de atividade (padrão visual).
 */
export function CartaoIndicador({
  rotulo,
  valor,
  detalhe,
  href,
  tom,
}: {
  rotulo: string
  valor: number
  detalhe?: ReactNode
  href?: string
  tom?: 'atencao' | 'problema'
}) {
  const conteudo = (
    <>
      <span className={cn('block', CLASSE_ROTULO)}>
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
      <Link href={href} data-tom={tom} className={cn(CAIXA, tom && BARRA[tom], 'transition-colors hover:border-input')}>
        {conteudo}
      </Link>
    )
  }
  return (
    <div data-tom={tom} className={cn(CAIXA, tom && BARRA[tom])}>
      {conteudo}
    </div>
  )
}
