import type { MaturidadeGeral, NivelDimensao } from '@/lib/dados/tipos'
import { VAZIO } from '@/lib/formato'
import { PASSO_DO_NIVEL } from '@/lib/maturidade/regras'
import { cn } from '@/lib/utils'

const PASSOS = [1, 2, 3, 4, 5] as const

const passoDo = (nivel: NivelDimensao | MaturidadeGeral): number =>
  nivel in PASSO_DO_NIVEL ? PASSO_DO_NIVEL[nivel as keyof typeof PASSO_DO_NIVEL] : 0

/**
 * Nível de maturidade (padrão 4.6): o nome com uma régua de 5 passos em azul-marinho, preenchida até o nível.
 * Não avaliada e Inconclusiva ficam em texto secundário, com a régua vazia. O nível não é status:
 * não usa cor de alerta. A régua é só visual; o leitor de tela ouve o nome.
 */
export function NivelMaturidade({ nivel }: { nivel: NivelDimensao | MaturidadeGeral | null }) {
  if (nivel === null) return <span className="text-muted-foreground">{VAZIO}</span>
  const passo = passoDo(nivel)
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className={cn(passo === 0 && 'text-muted-foreground')}>{nivel}</span>
      <span data-slot="regua" aria-hidden="true" className="inline-flex items-center gap-0.5">
        {PASSOS.map((p) => (
          <span
            key={p}
            data-slot="passo"
            {...(p <= passo ? { 'data-preenchida': 'true' } : {})}
            className={cn('h-1 w-3 rounded-sm', p <= passo ? 'bg-primary' : 'bg-border')}
          />
        ))}
      </span>
    </span>
  )
}
