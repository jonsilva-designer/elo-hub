import type { Criticidade, Prioridade } from '@/lib/design/status'

/** Dados fictícios da página /designsystem. Datas sempre em texto fixo. */

export const STATUS_POR_TOM = [
  { tom: 'Neutro', status: ['Prospect', 'Proposta', 'Planejado', 'Não iniciada', 'Nova', 'Em análise', 'Em elaboração', 'Não aplicável', 'Superado'] },
  { tom: 'Em curso', status: ['Em contratação', 'Em andamento', 'Em triagem', 'Em atendimento', 'Aberto'] },
  { tom: 'Atenção', status: ['Em espera', 'Aguardando retorno', 'Próximo do vencimento'] },
  { tom: 'Suspenso', status: ['Suspenso'] },
  { tom: 'Concluído ou ativo', status: ['Ativo', 'Vigente', 'Concluído', 'Concluída', 'Resolvida'] },
  { tom: 'Problema', status: ['Vencido'] },
  { tom: 'Fechado', status: ['Inativo', 'Encerrado', 'Encerrada', 'Cancelado', 'Cancelada'] },
]

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
