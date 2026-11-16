'use client'

import { useRouter } from 'next/navigation'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaCriticidade, EtiquetaPlanejamento, EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import type { EscopoDetalhado } from '@/lib/dados/tipos'
import { ordenarEscopos } from '@/lib/escopos/filtros'
import { CRITICIDADES } from '@/lib/escopos/regras'

// As colunas da lista de escopos, sem o Cliente, que é o da página (parte 3, 5.11).
const COLUNAS: Coluna<EscopoDetalhado>[] = [
  {
    id: 'escopo',
    titulo: 'Escopo',
    largura: 'w-1/3',
    ordenarPor: (e) => e.nome,
    celula: (e) => (
      <span className="flex min-w-0 flex-col items-start gap-1">
        <span className="font-medium text-foreground">{e.nome}</span>
        {e.planejamento ? <EtiquetaPlanejamento /> : null}
      </span>
    ),
  },
  { id: 'contrato', titulo: 'Contrato', ordenarPor: (e) => e.codigoContrato, celula: (e) => <Num>{e.codigoContrato}</Num> },
  { id: 'status', titulo: 'Status', ordenarPor: (e) => e.status, celula: (e) => <EtiquetaStatus status={e.status} /> },
  {
    id: 'criticidade',
    titulo: 'Criticidade',
    ordenarPor: (e) => CRITICIDADES.indexOf(e.criticidade),
    celula: (e) => <EtiquetaCriticidade criticidade={e.criticidade} />,
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
]

/**
 * Aba Escopos do cliente (parte 3, 5.11): os escopos dele, na ordem da lista de escopos. Sem ação: o escopo nasce na
 * página do contrato. A linha abre o escopo.
 */
export function AbaEscopos({ escopos }: { escopos: EscopoDetalhado[] }) {
  const router = useRouter()
  return (
    <Painel titulo="Escopos" semRespiro>
      <TabelaDados
        colunas={COLUNAS}
        linhas={ordenarEscopos(escopos)}
        chave={(e) => e.id}
        aoClicarLinha={(e) => router.push(`/escopos/${e.id}`)}
        vazio={<EstadoVazio titulo="Nenhum escopo deste cliente." />}
      />
    </Painel>
  )
}
