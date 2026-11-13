import type { ReactNode } from 'react'

/**
 * Bloco "Protótipo" das telas de acesso: atalhos que só existem nesta fase, separados do formulário
 * de verdade. Sai inteiro na Etapa 3. Usa as cores de aviso da biblioteca, como o AvisoConfirmacao.
 */
export function QuadroPrototipo({ children }: { children: ReactNode }) {
  return (
    <section
      aria-labelledby="titulo-prototipo"
      className="space-y-3 rounded-xl border border-[var(--elo-status-atencao)] bg-card p-4"
    >
      <h2
        id="titulo-prototipo"
        className="text-[10.5px] font-semibold tracking-[.12em] text-[var(--elo-status-suspenso-texto)] uppercase"
      >
        Protótipo
      </h2>
      {children}
    </section>
  )
}
