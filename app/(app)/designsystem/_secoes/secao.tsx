import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Quadro branco com borda e sem sombra: cartões só têm borda (padrão 4.5). */
export function Quadro({ children, className }: { children: ReactNode; className?: string }) {
  return (
    // min-w-0: sem isso, uma tabela larga dentro do painel alargaria a página em vez de rolar.
    <div className={cn('min-w-0 rounded-xl border border-border bg-card p-5 sm:p-6', className)}>
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
    // min-w-0: a seção pode ser item de grid ou flex da tela; sem isso o conteúdo largo a alarga.
    <section className="mt-10 min-w-0 space-y-4">
      <div className="space-y-1">
        <h2 className="text-[15px] font-bold text-[var(--elo-azul-marinho)]">{titulo}</h2>
        {descricao ? <p className="text-[13px] text-muted-foreground">{descricao}</p> : null}
      </div>
      {children}
    </section>
  )
}

/** Quadro de linhas `Exemplo`, separadas por divisória. É o único jeito de separar linhas na página. */
export function Linhas({ children }: { children: ReactNode }) {
  return (
    <Quadro className="divide-y divide-[color:var(--elo-divisoria)] [&>*]:py-4 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
      {children}
    </Quadro>
  )
}

/** Subtítulo h3 dentro de Componentes. O conteúdo vai num painel de linhas `Exemplo`. */
export function Subsecao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-[var(--elo-azul-marinho)]">{titulo}</h3>
      <Linhas>{children}</Linhas>
    </div>
  )
}

/**
 * Linha com o rótulo à esquerda e os exemplos à direita. Abaixo de 640px, o rótulo fica em cima.
 * `nota` é uma legenda opcional na terceira coluna. O alinhamento é pela linha de base do texto.
 */
export function Exemplo({
  rotulo,
  nota,
  children,
}: {
  rotulo: string
  nota?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
      <div className="text-xs text-muted-foreground sm:w-44 sm:shrink-0">{rotulo}</div>
      {/* min-w-0: deixa os exemplos quebrarem de linha em vez de alargar a linha. */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">{children}</div>
      {nota ? <div className="text-xs text-muted-foreground sm:w-56 sm:shrink-0">{nota}</div> : null}
    </div>
  )
}
