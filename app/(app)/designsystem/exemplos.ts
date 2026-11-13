import { STATUS_POR_TOM, type Criticidade, type Prioridade, type TomDeStatus } from '@/lib/design/status'

/** Dados fictícios da página /designsystem. Datas sempre em texto fixo. */

const ROTULO_DO_TOM: Record<TomDeStatus, string> = {
  neutro: 'Neutro',
  'em-curso': 'Em curso',
  atencao: 'Atenção',
  suspenso: 'Suspenso',
  concluido: 'Concluído ou ativo',
  problema: 'Problema',
  fechado: 'Fechado',
}

/** Grupos de status por tom, derivados da tabela de lib/design/status.ts. */
export const GRUPOS_DE_STATUS = (Object.entries(STATUS_POR_TOM) as [TomDeStatus, readonly string[]][]).map(
  ([tom, status]) => ({ tom: ROTULO_DO_TOM[tom], status }),
)

export const CRITICIDADES: Criticidade[] = ['Baixa', 'Moderada', 'Alta', 'Crítica']
export const PRIORIDADES: Prioridade[] = ['Baixa', 'Média', 'Alta']

export const ESCOPO_EXEMPLO = {
  titulo: 'Mapeamento de processos de compras',
  status: 'Em andamento',
  criticidade: 'Alta' as Criticidade,
  prioridade: 'Média' as Prioridade,
}

export const NUMEROS_EXEMPLO = {
  data: '2026-11-09',
  valor: 48500,
  quantidade: 1234,
  percentual: 0.105,
  demanda: 'ELO-2026-0147',
}

export const MENSAGEM_AVISO =
  'A data de término é anterior à data de início. Deseja salvar mesmo assim?'

export const INDICADORES_EXEMPLO = {
  clientes: 18,
  contratos: { vigentes: 24, proximos: 3, vencidos: 1 },
  atividades: { abertas: 67, atrasadas: 5, proximas: 8 },
  demandas: { abertas: 9, criticas: 2, semTriagem: 3 },
}

export const CONTRATO_EXEMPLO = {
  cliente: 'Grupo Horizonte Agro',
  numero: 'CT-2026-031',
  inicio: '2026-03-01',
  termino: '2027-02-28',
  valor: 48500,
}

export type ContratoDaLista = {
  numero: string
  cliente: string
  status: string
  vigencia: 'Vigente' | 'Próximo do vencimento' | 'Vencido'
  termino: string
  valor: number
}

export const VIGENCIAS: ContratoDaLista['vigencia'][] = ['Vigente', 'Próximo do vencimento', 'Vencido']

/** Contratos fictícios da tabela. Datas em texto fixo. */
export const CONTRATOS_EXEMPLO: ContratoDaLista[] = [
  { numero: 'CT-2026-031', cliente: 'Grupo Horizonte Agro', status: 'Ativo', vigencia: 'Vigente', termino: '2027-02-28', valor: 48500 },
  { numero: 'CT-2026-027', cliente: 'Transportes Serra Azul', status: 'Ativo', vigencia: 'Próximo do vencimento', termino: '2026-12-15', valor: 32000 },
  { numero: 'CT-2025-114', cliente: 'Clínica São Lucas', status: 'Encerrado', vigencia: 'Vencido', termino: '2026-10-31', valor: 18900 },
  { numero: 'CT-2026-019', cliente: 'Cooperativa Vale Verde', status: 'Suspenso', vigencia: 'Vigente', termino: '2027-05-20', valor: 76250 },
  { numero: 'CT-2026-022', cliente: 'Indústria Pedra Branca', status: 'Ativo', vigencia: 'Vigente', termino: '2027-08-31', valor: 124000 },
  { numero: 'CT-2025-098', cliente: 'Escola Novo Caminho', status: 'Ativo', vigencia: 'Próximo do vencimento', termino: '2026-12-02', valor: 21400 },
  { numero: 'CT-2026-035', cliente: 'Mercado Bom Preço', status: 'Ativo', vigencia: 'Vigente', termino: '2027-03-15', valor: 15800 },
  { numero: 'CT-2025-087', cliente: 'Laboratório Aurora', status: 'Encerrado', vigencia: 'Vencido', termino: '2026-09-30', valor: 41300 },
  { numero: 'CT-2026-040', cliente: 'Construtora Alvorada', status: 'Ativo', vigencia: 'Vigente', termino: '2027-11-30', valor: 98700 },
  { numero: 'CT-2026-012', cliente: 'Hotel Mirante do Vale', status: 'Suspenso', vigencia: 'Próximo do vencimento', termino: '2026-12-20', valor: 27600 },
  { numero: 'CT-2026-044', cliente: 'Padaria Pão de Ouro', status: 'Ativo', vigencia: 'Vigente', termino: '2027-06-30', valor: 9800 },
  { numero: 'CT-2026-048', cliente: 'Farmácia Saúde Plena', status: 'Ativo', vigencia: 'Vigente', termino: '2027-09-10', valor: 13250 },
]
