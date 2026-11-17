import type { PlanoDetalhado, StatusPlano } from '@/lib/dados/tipos'
import { dataValida } from '@/lib/escopos/validacao'
import { planoFechado, STATUS_PLANO_ABERTOS } from './regras'

// Validação do cadastro e da edição do plano (parte 4, 5.6), no servidor. As mensagens são provisórias (DT-03).

export const MENSAGENS_PLANO = {
  nome: 'Informe o nome.',
  responsavel: 'Escolha o responsável.',
  responsavelSemVinculo: 'O responsável precisa ter vínculo com o cliente.',
  status: 'Escolha o status.',
  fechado: 'Para reabrir, use Reabrir na página do plano.',
  data: 'Informe uma data válida.',
  escopoFechado: 'Este escopo está fechado e não recebe planos novos.',
}

export type DadosPlano = {
  escopoId: string
  nome: string
  descricao: string
  responsavelId: string
  /** AAAA-MM-DD, como o campo de data manda; vazio quando não informado. */
  prazo: string
  status: string
  avaliacaoId: string
  observacoes: string
}

export type ErrosPlano = Partial<Record<'nome' | 'responsavelId' | 'status' | 'prazo', string>>

const CAMPOS = ['escopoId', 'nome', 'descricao', 'responsavelId', 'prazo', 'status', 'avaliacaoId', 'observacoes'] as const

/** Os campos do formulário, sem espaços nas pontas. */
export function lerDadosPlano(formData: FormData): DadosPlano {
  const dados = {} as DadosPlano
  for (const campo of CAMPOS) {
    const valor = formData.get(campo)
    dados[campo] = typeof valor === 'string' ? valor.trim() : ''
  }
  return dados
}

/**
 * Os erros por campo; vazio quando está tudo certo.
 * - `atual`: o plano em edição, ou null no cadastro. O plano fechado não muda de status pelo formulário (RN-17).
 * - `responsaveisPermitidos`: os ids de `listarResponsaveis` do cliente (RN-19).
 */
export function validarPlano(
  dados: DadosPlano,
  contexto: { atual: PlanoDetalhado | null; responsaveisPermitidos: string[] },
): ErrosPlano {
  const { atual, responsaveisPermitidos } = contexto
  const erros: ErrosPlano = {}

  if (!dados.nome.trim()) erros.nome = MENSAGENS_PLANO.nome
  if (!dados.responsavelId) erros.responsavelId = MENSAGENS_PLANO.responsavel
  else if (!responsaveisPermitidos.includes(dados.responsavelId)) erros.responsavelId = MENSAGENS_PLANO.responsavelSemVinculo

  // Status (6.1): Aberto e Em andamento, livres entre si. Concluir, cancelar e reabrir são ações da página.
  const status = dados.status as StatusPlano
  if (atual && planoFechado(atual.status)) {
    if (status !== atual.status) erros.status = MENSAGENS_PLANO.fechado
  } else if (!STATUS_PLANO_ABERTOS.includes(status)) {
    erros.status = MENSAGENS_PLANO.status
  }

  if (dados.prazo && !dataValida(dados.prazo)) erros.prazo = MENSAGENS_PLANO.data
  return erros
}
