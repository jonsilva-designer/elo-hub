import type { ReactNode } from 'react'

/** Cabeçalho da página: título h1, contexto abaixo, ações à direita e fio dourado embaixo. */
export function CabecalhoPagina({
  titulo,
  contexto,
  acoes,
}: {
  titulo: string
  contexto?: ReactNode
  acoes?: ReactNode
}) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-[var(--elo-dourado-suave)] pb-3.5">
      <div className="min-w-0 space-y-1">
        <h1 className="text-[26px] font-semibold tracking-[-.02em] text-primary">{titulo}</h1>
        {contexto ? <div className="text-xs text-muted-foreground">{contexto}</div> : null}
      </div>
      {acoes ? <div className="flex flex-wrap items-center gap-2">{acoes}</div> : null}
    </header>
  )
}
