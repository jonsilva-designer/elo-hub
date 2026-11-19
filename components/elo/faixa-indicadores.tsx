import Link from 'next/link'
import { useId } from 'react'
import { formatarNumero } from '@/lib/formato'

/**
 * Os números principais num card só (revisão do Início, 19/11/2026), separados por linhas finas: quatro colunas no
 * computador e duas em tela menor. Cada número leva à lista filtrada (CA-13.3). As linhas são o fundo da borda
 * aparecendo no vão de 1px entre as células.
 */
export function FaixaIndicadores({
  rotulo,
  itens,
}: {
  /** Nome da faixa para o leitor de tela. */
  rotulo: string
  itens: { rotulo: string; valor: number; href: string }[]
}) {
  const id = useId()
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="sr-only">
        {rotulo}
      </h2>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
        {itens.map((i) => (
          <Link key={i.href} href={i.href} className="block min-w-0 bg-card p-4.5 transition-colors hover:bg-papel">
            <span className="block text-rotulo font-semibold uppercase tracking-rotulo text-muted-foreground">{i.rotulo}</span>
            <span className="mt-2 block font-mono text-indicador font-medium tabular-nums text-primary">
              {formatarNumero(i.valor)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
