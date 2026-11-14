import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Painel do produto: título à esquerda; contagem e ação à direita; divisória e conteúdo. Só borda, sem sombra.
 * `semRespiro` tira o respiro do corpo, para uma tabela ou lista ir de borda a borda.
 */
export function Painel({
  titulo,
  contagem,
  acao,
  semRespiro = false,
  children,
}: {
  titulo: string
  contagem?: ReactNode
  acao?: ReactNode
  semRespiro?: boolean
  children: ReactNode
}) {
  const id = useId()
  // `!= null`: a contagem zero também aparece.
  const temContagem = contagem != null
  return (
    <section
      aria-labelledby={id}
      // Sem respiro, o corte arredonda o fundo da última linha nos cantos do painel.
      className={cn('min-w-0 rounded-xl border border-border bg-card', semRespiro && 'overflow-hidden')}
    >
      <div className="flex items-center gap-3 border-b border-divisoria px-5 py-3">
        <h2 id={id} className="text-sm font-bold text-primary">
          {titulo}
        </h2>
        {temContagem || acao ? (
          <div className="ml-auto flex items-center gap-3">
            {temContagem ? <span className="text-secundario text-muted-foreground">{contagem}</span> : null}
            {acao}
          </div>
        ) : null}
      </div>
      <div className={cn(!semRespiro && 'p-5')}>{children}</div>
    </section>
  )
}
