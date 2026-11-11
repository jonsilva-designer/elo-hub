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
