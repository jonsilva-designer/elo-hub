import type { ReactNode } from 'react'
import { VAZIO } from '@/lib/formato'

/** Campos de um registro: rótulo em cima, valor embaixo. `null` mostra o traço. */
export function ListaCampos({ itens }: { itens: { rotulo: string; valor: ReactNode | null }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
      {itens.map(({ rotulo, valor }) => (
        <div key={rotulo} className="min-w-0">
          <dt className="text-[13px] text-muted-foreground">{rotulo}</dt>
          <dd className="mt-0.5 text-sm">{valor === null ? VAZIO : valor}</dd>
        </div>
      ))}
    </dl>
  )
}
