import { useId, type ReactNode } from 'react'

/**
 * Bloco "Protótipo" das telas de acesso: atalhos que só existem nesta fase, como a entrada por perfil, separados
 * do formulário de verdade (padrão 6). Sai inteiro na Etapa 3. Usa as cores de aviso da biblioteca, como o
 * AvisoConfirmacao.
 */
export function QuadroPrototipo({ children }: { children: ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="space-y-3 rounded-xl border border-[var(--elo-status-atencao)] bg-card p-4">
      <h2 id={id} className="text-grupo font-semibold tracking-grupo text-[var(--elo-status-suspenso-texto)] uppercase">
        Protótipo
      </h2>
      {children}
    </section>
  )
}
