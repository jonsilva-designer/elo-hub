import type { AtividadeDetalhada, Perfil, StatusAtividade } from '@/lib/dados/tipos'
import { dataValida } from '@/lib/escopos/validacao'
import { PRIORIDADES } from '@/lib/escopos/regras'
import { destinosDaAtividade, reaberturaDaAtividade } from './regras'

// Validação do cadastro e da edição da atividade (parte 4, 5.7), no servidor. As mensagens são provisórias (DT-03).

export const MENSAGENS_ATIVIDADE = {
  nome: 'Informe o nome.',
  responsavel: 'Escolha o responsável.',
  responsavelSemVinculo: 'O responsável precisa ter vínculo com o cliente.',
  prazo: 'Informe o prazo.',
  data: 'Informe uma data válida.',
  prioridade: 'Escolha a prioridade.',
  status: 'Escolha o status.',
  justificativa: 'Escreva a justificativa da reabertura.',
  planoFechado: 'Este plano está fechado e não recebe atividades novas.',
  reabrirComPlanoFechado: 'O plano está fechado. Reabra o plano antes.',
}

export type DadosAtividade = {
  planoId: string
  nome: string
  descricao: string
  responsavelId: string
  /** Só o nome de quem executa (DF-71); vazio sem executor. */
  executor: string
  /** AAAA-MM-DD, como o campo de data manda. */
  prazo: string
  prioridade: string
  status: string
  justificativa: string
  observacoes: string
  /** "Salvar mesmo assim" no aviso da RN-21: o campo `confirmarAviso` igual a "sim". */
  confirmarAviso: boolean
}

export type ErrosAtividade = Partial<
  Record<'nome' | 'responsavelId' | 'prazo' | 'prioridade' | 'status' | 'justificativa', string>
>

const CAMPOS = [
  'planoId',
  'nome',
  'descricao',
  'responsavelId',
  'executor',
  'prazo',
  'prioridade',
  'status',
  'justificativa',
  'observacoes',
] as const

/** Os campos do formulário, sem espaços nas pontas. */
export function lerDadosAtividade(formData: FormData): DadosAtividade {
  const dados = {} as DadosAtividade
  for (const campo of CAMPOS) {
    const valor = formData.get(campo)
    dados[campo] = typeof valor === 'string' ? valor.trim() : ''
  }
  dados.confirmarAviso = formData.get('confirmarAviso') === 'sim'
  return dados
}

/**
 * Os erros por campo; vazio quando está tudo certo.
 * - `atual`: a atividade em edição, ou null no cadastro. O status precisa estar nos destinos do perfil (6.1), e a
 *   reabertura pede justificativa (RN-22).
 * - `responsaveisPermitidos`: os ids de `listarResponsaveis` do cliente (RN-19).
 */
export function validarAtividade(
  dados: DadosAtividade,
  contexto: { atual: AtividadeDetalhada | null; perfil: Perfil; responsaveisPermitidos: string[] },
): ErrosAtividade {
  const { atual, perfil, responsaveisPermitidos } = contexto
  const erros: ErrosAtividade = {}

  if (!dados.nome.trim()) erros.nome = MENSAGENS_ATIVIDADE.nome
  if (!dados.responsavelId) erros.responsavelId = MENSAGENS_ATIVIDADE.responsavel
  else if (!responsaveisPermitidos.includes(dados.responsavelId)) {
    erros.responsavelId = MENSAGENS_ATIVIDADE.responsavelSemVinculo
  }

  // Prazo e prioridade obrigatórios, porque o atraso e os alertas dependem do prazo (DF-10).
  if (!dados.prazo) erros.prazo = MENSAGENS_ATIVIDADE.prazo
  else if (!dataValida(dados.prazo)) erros.prazo = MENSAGENS_ATIVIDADE.data
  if (!(PRIORIDADES as string[]).includes(dados.prioridade)) erros.prioridade = MENSAGENS_ATIVIDADE.prioridade

  const status = dados.status as StatusAtividade
  if (!destinosDaAtividade(atual?.status ?? null, perfil).includes(status)) {
    erros.status = MENSAGENS_ATIVIDADE.status
  } else if (atual && reaberturaDaAtividade(atual.status, status) && !dados.justificativa.trim()) {
    erros.justificativa = MENSAGENS_ATIVIDADE.justificativa
  }
  return erros
}
