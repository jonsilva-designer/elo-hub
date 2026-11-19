'use client'

import { useRouter } from 'next/navigation'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { TextoComDetalhe } from '@/components/elo/textos'
import type { OrigemEspecialista, StatusEspecialista } from '@/lib/dados/tipos'
import { formatarData } from '@/lib/formato'

type Ligacao = { tipo: string; id: string; nome: string; cliente: string; status: string; href: string }

const COLUNAS_LIGACOES: Coluna<Ligacao>[] = [
  { id: 'tipo', titulo: 'Tipo', ordenarPor: (l) => l.tipo, celula: (l) => l.tipo },
  {
    id: 'nome',
    titulo: 'Escopo ou demanda',
    largura: 'w-2/5',
    ordenarPor: (l) => l.nome,
    celula: (l) => <TextoComDetalhe texto={l.nome} />,
  },
  { id: 'cliente', titulo: 'Cliente', ordenarPor: (l) => l.cliente, celula: (l) => l.cliente },
  { id: 'status', titulo: 'Status', ordenarPor: (l) => l.status, celula: (l) => <EtiquetaStatus status={l.status} /> },
]

/** Os escopos e as demandas do especialista, só dos clientes de quem vê (CA-11.4). A linha abre o registro. */
export function TabelaLigacoes({ ligacoes }: { ligacoes: Ligacao[] }) {
  const router = useRouter()
  return (
    <TabelaDados
      colunas={COLUNAS_LIGACOES}
      linhas={ligacoes}
      chave={(l) => `${l.tipo}-${l.id}`}
      aoClicarLinha={(l) => router.push(l.href)}
      vazio={<EstadoVazio titulo="Nenhum escopo ou demanda ligado a este especialista." />}
    />
  )
}

type Candidatura = { id: string; nome: string; cadastradoEm: string; status: StatusEspecialista; origem: OrigemEspecialista }

const COLUNAS_CANDIDATURAS: Coluna<Candidatura>[] = [
  { id: 'nome', titulo: 'Nome', celula: (c) => <TextoComDetalhe texto={c.nome} /> },
  { id: 'data', titulo: 'Data', celula: (c) => <Num>{formatarData(c.cadastradoEm)}</Num> },
  { id: 'origem', titulo: 'Origem', celula: (c) => c.origem },
  { id: 'status', titulo: 'Status', celula: (c) => <EtiquetaStatus status={c.status} /> },
]

/** As outras candidaturas e cadastros com o mesmo e-mail (DF-50, CA-11.6). A linha abre a candidatura. */
export function TabelaCandidaturas({ candidaturas }: { candidaturas: Candidatura[] }) {
  const router = useRouter()
  return (
    <TabelaDados
      colunas={COLUNAS_CANDIDATURAS}
      linhas={candidaturas}
      chave={(c) => c.id}
      aoClicarLinha={(c) => router.push(`/especialistas/${c.id}`)}
      vazio={null}
    />
  )
}
