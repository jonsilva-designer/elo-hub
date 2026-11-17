'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { EtiquetaCriticidade, EtiquetaSinal, EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import type { DemandaDetalhada } from '@/lib/dados/tipos'
import { ordenarDemandas } from '@/lib/demandas/filtros'
import { CRITICIDADES } from '@/lib/escopos/regras'
import { formatarData } from '@/lib/formato'

const semValor = (texto: string) => <span className="text-muted-foreground">{texto}</span>

function colunas(daFila: boolean): Coluna<DemandaDetalhada>[] {
  return [
    {
      id: 'numero',
      titulo: 'Número',
      ordenarPor: (d) => d.numero,
      celula: (d) => <Num className="font-medium text-foreground">{d.numero}</Num>,
    },
    {
      id: 'assunto',
      titulo: 'Assunto',
      largura: 'w-1/3',
      ordenarPor: (d) => d.assunto,
      celula: (d) => (
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-foreground">{d.assunto}</span>
          {daFila ? <span className="text-xs text-muted-foreground">{d.nomeCliente}</span> : null}
        </span>
      ),
    },
    { id: 'status', titulo: 'Status', ordenarPor: (d) => d.status, celula: (d) => <EtiquetaStatus status={d.status} /> },
    {
      id: 'criticidade',
      titulo: 'Criticidade',
      ordenarPor: (d) => (d.criticidade ? CRITICIDADES.indexOf(d.criticidade) : null),
      celula: (d) => (d.criticidade ? <EtiquetaCriticidade criticidade={d.criticidade} /> : semValor('Na triagem')),
    },
    ...(daFila
      ? [
          {
            id: 'responsavel',
            titulo: 'Responsável',
            ordenarPor: (d: DemandaDetalhada) => d.nomeAtendimento || d.nomeTriagem,
            celula: (d: DemandaDetalhada) => d.nomeAtendimento || d.nomeTriagem,
          },
        ]
      : []),
    {
      id: 'prazo',
      titulo: 'Prazo',
      ordenarPor: (d) => d.prazo,
      celula: (d) =>
        d.prazo ? (
          <span className="flex flex-wrap items-center gap-1.5">
            <Num>{formatarData(d.prazo)}</Num>
            {d.vencida ? <EtiquetaSinal texto="Vencida" tom="problema" /> : null}
          </span>
        ) : (
          semValor('Sem prazo')
        ),
    },
  ]
}

/**
 * As demandas (parte 5, 5.8 e 5.12), na fila, na aba do cliente e no painel do escopo. A vencida ganha a etiqueta e a
 * barra vermelha, como o contrato Vencido. A linha abre a demanda.
 */
export function TabelaDemandas({
  demandas,
  daFila = false,
  vazio,
}: {
  demandas: DemandaDetalhada[]
  /** Na fila, a tabela mostra o cliente e o responsável. */
  daFila?: boolean
  vazio: ReactNode
}) {
  const router = useRouter()
  return (
    <TabelaDados
      colunas={colunas(daFila)}
      linhas={ordenarDemandas(demandas)}
      chave={(d) => d.numero}
      aoClicarLinha={(d) => router.push(`/central/${d.numero}`)}
      destaque={(d) => (d.vencida ? 'problema' : null)}
      vazio={vazio}
    />
  )
}
