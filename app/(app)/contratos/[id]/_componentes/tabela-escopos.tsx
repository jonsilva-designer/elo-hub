'use client'

import type { ReactNode } from 'react'
import { EtiquetaCriticidade, EtiquetaStatus, IndicadorPrioridade } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import type { EscopoDetalhado } from '@/lib/dados/tipos'

const COLUNAS: Coluna<EscopoDetalhado>[] = [
  {
    id: 'escopo',
    titulo: 'Escopo',
    largura: 'w-1/4',
    ordenarPor: (e) => e.nome,
    celula: (e) => <span className="font-medium text-foreground">{e.nome}</span>,
  },
  { id: 'status', titulo: 'Status', ordenarPor: (e) => e.status, celula: (e) => <EtiquetaStatus status={e.status} /> },
  {
    id: 'criticidade',
    titulo: 'Criticidade',
    ordenarPor: (e) => e.criticidade,
    celula: (e) => <EtiquetaCriticidade criticidade={e.criticidade} />,
  },
  {
    id: 'prioridade',
    titulo: 'Prioridade',
    ordenarPor: (e) => e.prioridade,
    celula: (e) => <IndicadorPrioridade prioridade={e.prioridade} />,
  },
  {
    id: 'etapa',
    titulo: 'Etapa atual',
    largura: 'w-1/5',
    celula: (e) => (
      <span>
        {e.etapaAtual}
        <span aria-hidden="true"> · </span>
        <Num>{e.progresso.concluidas}</Num> de <Num>{e.progresso.aplicaveis}</Num>
      </span>
    ),
  },
  { id: 'responsavel', titulo: 'Responsável', ordenarPor: (e) => e.nomeResponsavel, celula: (e) => e.nomeResponsavel },
]

/** Os escopos do contrato (parte 3, 5.6). As linhas passam a abrir o escopo no plano 3B, com a página dele. */
export function TabelaEscopos({ escopos, vazio }: { escopos: EscopoDetalhado[]; vazio: ReactNode }) {
  return <TabelaDados colunas={COLUNAS} linhas={escopos} chave={(e) => e.id} vazio={vazio} />
}
