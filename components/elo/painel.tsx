import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Painel do produto: título, contagem e ação no cabeçalho, divisória e conteúdo. Só borda, sem sombra. */
export function Painel({
  titulo,
  contagem,
  acao,
  children,
}: {
  titulo: string
  contagem?: ReactNode
  acao?: ReactNode
  children: ReactNode
}) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className={cn('min-w-0 rounded-xl border border-border bg-card')}
    >
      <div className="flex items-center gap-3 border-b border-[var(--elo-divisoria)] px-5 py-3">
        <h2 id={id} className="text-sm font-bold text-primary">
          {titulo}
        </h2>
        {contagem ? <span className="text-[13px] text-muted-foreground">{contagem}</span> : null}
        {acao ? <div className="ml-auto">{acao}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}
