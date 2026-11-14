'use client'

import type { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * Abas da página do cliente. A aba escolhida vai para o endereço sem ir ao servidor; o Resumo tira o parâmetro.
 * A `key` remonta as abas quando o servidor manda outra aba inicial, como no link "Ver maturidade".
 */
export function AbasCliente({
  abas,
  inicial,
  paineis,
}: {
  abas: { valor: string; rotulo: string }[]
  inicial: string
  paineis: Record<string, ReactNode>
}) {
  function aoTrocar(aba: string) {
    const caminho = window.location.pathname
    window.history.replaceState(null, '', aba === 'resumo' ? caminho : `${caminho}?aba=${aba}`)
  }

  return (
    <Tabs key={inicial} defaultValue={inicial} onValueChange={aoTrocar}>
      <TabsList aria-label="Seções do cliente">
        {abas.map((a) => (
          <TabsTrigger key={a.valor} value={a.valor}>
            {a.rotulo}
          </TabsTrigger>
        ))}
      </TabsList>
      {abas.map((a) => (
        <TabsContent key={a.valor} value={a.valor} className="pt-2">
          {paineis[a.valor]}
        </TabsContent>
      ))}
    </Tabs>
  )
}
