'use client'

import { useSearchParams } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * Abas da página do cliente. A aba escolhida vai para o endereço sem ir ao servidor; o Resumo tira o parâmetro.
 * As abas acompanham o endereço: um link para outra aba, como "Ver maturidade", abre a aba mesmo quando o servidor
 * manda a mesma aba inicial de antes (a pessoa voltou de uma avaliação, foi ao Resumo e clicou no link).
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
  const pedida = useSearchParams().get('aba')
  const [aba, setAba] = useState(inicial)
  // O endereço mudou desde a última vez: a aba segue o que ele pede (aba que o cliente não tem abre o Resumo).
  const [pedidaAntes, setPedidaAntes] = useState(pedida)
  if (pedida !== pedidaAntes) {
    setPedidaAntes(pedida)
    setAba(abas.find((a) => a.valor === pedida)?.valor ?? 'resumo')
  }

  function aoTrocar(nova: string) {
    setAba(nova)
    const caminho = window.location.pathname
    window.history.replaceState(null, '', nova === 'resumo' ? caminho : `${caminho}?aba=${nova}`)
  }

  return (
    <Tabs value={aba} onValueChange={aoTrocar}>
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
