import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Painel branco com borda e sem sombra: cartões só têm borda (padrão 4.5). */
export function Painel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-5 sm:p-6', className)}>
      {children}
    </div>
  )
}

/** Seção da página, com título h2. */
export function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string
  descricao?: string
  children: ReactNode
}) {
  return (
    <section className="mt-10 space-y-4">
      <div className="space-y-1">
        <h2 className="text-[15px] font-bold text-[var(--elo-azul-marinho)]">{titulo}</h2>
        {descricao ? <p className="text-[13px] text-muted-foreground">{descricao}</p> : null}
      </div>
      {children}
    </section>
  )
}

/** Subtítulo h3 dentro de Componentes. O conteúdo vai num painel de linhas `Exemplo`. */
export function Subsecao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-[var(--elo-azul-marinho)]">{titulo}</h3>
      <Painel className="divide-y divide-[color:var(--elo-divisoria)] [&>*]:py-4 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
        {children}
      </Painel>
    </div>
  )
}

/** Linha com o rótulo à esquerda e os exemplos à direita. Abaixo de 640px, o rótulo fica em cima. */
export function Exemplo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
      <div className="text-xs text-muted-foreground sm:w-44 sm:shrink-0">{rotulo}</div>
      <div className="flex min-w-0 flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}
