import type { ReactNode } from 'react'
import { CLASSE_TITULO_PAGINA } from './textos'

/** Cabeçalho da página: título h1, contexto abaixo, ações à direita e fio dourado embaixo. */
export function CabecalhoPagina({
  titulo,
  contexto,
  acoes,
  nivel = 'h1',
}: {
  /** Texto, ou o texto com números em <Num> (JetBrains Mono em todos os números, padrão visual). */
  titulo: ReactNode
  contexto?: ReactNode
  acoes?: ReactNode
  /** h1 na página; h3 quando é só a demonstração, na página do padrão visual (um h1 por página). */
  nivel?: 'h1' | 'h3'
}) {
  const Titulo = nivel
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-dourado-suave pb-3.5">
      <div className="min-w-0 space-y-1">
        <Titulo className={CLASSE_TITULO_PAGINA}>{titulo}</Titulo>
        {contexto ? <div className="text-xs text-muted-foreground">{contexto}</div> : null}
      </div>
      {acoes ? <div className="flex flex-wrap items-center gap-2">{acoes}</div> : null}
    </header>
  )
}
