import type { ReactNode } from 'react'
import { VAZIO } from '@/lib/formato'

/** Sem valor: null, undefined, texto vazio ou só com espaços. Zero é valor. */
function semValor(valor: ReactNode) {
  return valor === null || valor === undefined || (typeof valor === 'string' && valor.trim() === '')
}

/**
 * Campos de um registro: rótulo em cima, valor embaixo. O rótulo é pequeno, em caixa alta e cinza, como o rótulo de
 * indicador (padrão 4.2); o valor vem em destaque. Sem valor, mostra o traço apagado, para não parecer um valor.
 */
export function ListaCampos({ itens }: { itens: { rotulo: string; valor: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
      {itens.map(({ rotulo, valor }) => (
        <div key={rotulo} className="min-w-0">
          <dt className="text-rotulo font-semibold tracking-rotulo text-muted-foreground uppercase">{rotulo}</dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            {semValor(valor) ? <span className="font-normal text-muted-foreground">{VAZIO}</span> : valor}
          </dd>
        </div>
      ))}
    </dl>
  )
}
