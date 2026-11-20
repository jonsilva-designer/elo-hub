'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { EtiquetaPlanejamento, EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { ResumoAtividades } from '@/components/elo/resumo-atividades'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { Apagado, TextoComDetalhe } from '@/components/elo/textos'
import type { PlanoDetalhado } from '@/lib/dados/tipos'
import { formatarData } from '@/lib/formato'
import { compararPlanos } from '@/lib/planos/regras'

const PLANO: Coluna<PlanoDetalhado> = {
  id: 'plano',
  titulo: 'Plano',
  largura: 'w-1/3',
  ordenarPor: (p) => p.nome,
  celula: (p) => (
    <TextoComDetalhe texto={p.nome}>{p.planejamento ? <EtiquetaPlanejamento /> : null}</TextoComDetalhe>
  ),
}

const STATUS: Coluna<PlanoDetalhado> = {
  id: 'status',
  titulo: 'Status',
  ordenarPor: (p) => p.status,
  celula: (p) => <EtiquetaStatus status={p.status} />,
}

const ATIVIDADES: Coluna<PlanoDetalhado> = {
  id: 'atividades',
  titulo: 'Atividades',
  largura: 'w-1/4',
  celula: (p) => <ResumoAtividades compacto resumo={p.resumo} />,
}

/** As colunas de cada lugar: no escopo, quem responde e o prazo; na avaliação, o escopo de onde o plano é. */
const COLUNAS: Record<'escopo' | 'avaliacao', Coluna<PlanoDetalhado>[]> = {
  escopo: [
    PLANO,
    { id: 'responsavel', titulo: 'Responsável', ordenarPor: (p) => p.nomeResponsavel, celula: (p) => p.nomeResponsavel },
    {
      id: 'prazo',
      titulo: 'Prazo',
      // Sem prazo vai para o fim, como na ordem padrão dos planos (revisão do código).
      ordenarPor: (p) => p.prazo ?? '9999-12-31',
      celula: (p) => (p.prazo ? <Num>{formatarData(p.prazo)}</Num> : <Apagado>Sem prazo</Apagado>),
    },
    STATUS,
    ATIVIDADES,
  ],
  avaliacao: [PLANO, { id: 'escopo', titulo: 'Escopo', ordenarPor: (p) => p.nomeEscopo, celula: (p) => p.nomeEscopo }, STATUS, ATIVIDADES],
}

/**
 * Os planos de ação (parte 4, 5.4 e 5.9), na página do escopo e na da avaliação. A linha abre o plano. Os abertos
 * primeiro, pelo prazo.
 */
export function TabelaPlanos({
  planos,
  onde,
  vazio,
}: {
  planos: PlanoDetalhado[]
  onde: 'escopo' | 'avaliacao'
  vazio: ReactNode
}) {
  const router = useRouter()
  return (
    <TabelaDados
      colunas={COLUNAS[onde]}
      linhas={[...planos].sort(compararPlanos)}
      chave={(p) => p.id}
      aoClicarLinha={(p) => router.push(`/planos/${p.id}`)}
      vazio={vazio}
    />
  )
}
