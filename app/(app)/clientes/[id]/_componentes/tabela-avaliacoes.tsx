'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { NivelMaturidade } from '@/components/elo/nivel-maturidade'
import { Num } from '@/components/elo/num'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { Apagado } from '@/components/elo/textos'
import type { AvaliacaoDetalhada } from '@/lib/dados/tipos'
import { formatarData, VAZIO } from '@/lib/formato'

const COLUNAS: Coluna<AvaliacaoDetalhada>[] = [
  { id: 'data', titulo: 'Data', largura: 'w-1/6', ordenarPor: (a) => a.data, celula: (a) => <Num>{formatarData(a.data)}</Num> },
  { id: 'avaliador', titulo: 'Avaliador', largura: 'w-1/5', ordenarPor: (a) => a.nomeAvaliador, celula: (a) => a.nomeAvaliador },
  { id: 'status', titulo: 'Status', largura: 'w-1/6', ordenarPor: (a) => a.status, celula: (a) => <EtiquetaStatus status={a.status} /> },
  { id: 'maturidade', titulo: 'Maturidade geral', largura: 'w-1/4', celula: (a) => <NivelMaturidade nivel={a.maturidadeGeral} /> },
  {
    id: 'prontidao',
    titulo: 'Prontidão',
    celula: (a) => (a.prontidao ? <EtiquetaStatus status={a.prontidao} /> : <Apagado>{VAZIO}</Apagado>),
  },
]

/** As avaliações do cliente, da mais recente para a mais antiga. A linha abre a avaliação. */
export function TabelaAvaliacoes({ avaliacoes, vazio }: { avaliacoes: AvaliacaoDetalhada[]; vazio: ReactNode }) {
  const router = useRouter()
  return (
    <TabelaDados
      colunas={COLUNAS}
      linhas={avaliacoes}
      chave={(a) => a.id}
      aoClicarLinha={(a) => router.push(`/avaliacoes/${a.id}`)}
      vazio={vazio}
    />
  )
}
