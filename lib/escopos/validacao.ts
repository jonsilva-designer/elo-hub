import type { Escopo, StatusEscopo } from '@/lib/dados/tipos'
import { dataExiste, formatarData } from '@/lib/formato'
import { CRITICIDADES, escopoFechado, PRIORIDADES, STATUS_ESCOPO_ABERTOS, transicaoListadaEscopo } from './regras'

// Validação do cadastro e da edição do escopo (parte 3, 5.8), no servidor. As mensagens são provisórias (DT-03).

export const MENSAGENS_ESCOPO = {
  nome: 'Informe o nome.',
  responsavel: 'Escolha o responsável.',
  responsavelSemVinculo: 'O responsável precisa ter vínculo com o cliente.',
  status: 'Escolha o status.',
  fechado: 'Para reabrir, use Reabrir na página do escopo.',
  justificativa: 'Escreva a justificativa da mudança.',
  prioridade: 'Escolha a prioridade.',
  criticidade: 'Escolha a criticidade.',
  justificativaCriticidade: 'Escreva a justificativa da criticidade.',
  data: 'Informe uma data válida.',
  contratoFechado: 'Este contrato está fechado e não recebe escopos novos.',
}

/** O aviso da RN-21 (CA-05.8): a conclusão prevista passa do término da vigência do contrato. */
export function avisoDaVigencia(termino: string): string {
  return `A conclusão prevista é depois do término da vigência do contrato (${formatarData(termino)}). Salvar mesmo assim?`
}

export type DadosEscopo = {
  contratoId: string
  nome: string
  descricao: string
  responsavelId: string
  status: string
  justificativa: string
  prioridade: string
  criticidade: string
  justificativaCriticidade: string
  /** Datas em AAAA-MM-DD, como o campo de data manda; vazias quando não informadas. */
  inicio: string
  conclusaoPrevista: string
  cicloAnteriorId: string
  observacoes: string
  /** "Salvar mesmo assim" no aviso da RN-21: o campo `confirmarAviso` igual a "sim". */
  confirmarAviso: boolean
}

export type ErrosEscopo = Partial<
  Record<
    | 'nome'
    | 'responsavelId'
    | 'status'
    | 'justificativa'
    | 'prioridade'
    | 'criticidade'
    | 'justificativaCriticidade'
    | 'inicio'
    | 'conclusaoPrevista',
    string
  >
>

const CAMPOS_DE_TEXTO = [
  'contratoId',
  'nome',
  'descricao',
  'responsavelId',
  'status',
  'justificativa',
  'prioridade',
  'criticidade',
  'justificativaCriticidade',
  'inicio',
  'conclusaoPrevista',
  'cicloAnteriorId',
  'observacoes',
] as const

/** Os campos do formulário, sem espaços nas pontas. */
export function lerDadosEscopo(formData: FormData): DadosEscopo {
  const dados = {} as DadosEscopo
  for (const campo of CAMPOS_DE_TEXTO) {
    const valor = formData.get(campo)
    dados[campo] = typeof valor === 'string' ? valor.trim() : ''
  }
  dados.confirmarAviso = formData.get('confirmarAviso') === 'sim'
  return dados
}

/** A data no formato AAAA-MM-DD e que existe no calendário: 31/02 não vira 03/03. */
function dataValida(data: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data)
  return m !== null && dataExiste(Number(m[1]), Number(m[2]), Number(m[3]))
}

/**
 * Os erros por campo; vazio quando está tudo certo.
 * - `atual`: o escopo em edição, ou null no cadastro. Na edição, a criticidade não é conferida: muda só por
 *   Reclassificar (CA-05.2).
 * - `responsaveisPermitidos`: os ids de `listarResponsaveis` do cliente (RN-19).
 */
export function validarEscopo(
  dados: DadosEscopo,
  contexto: { atual: Escopo | null; responsaveisPermitidos: string[] },
): ErrosEscopo {
  const { atual, responsaveisPermitidos } = contexto
  const erros: ErrosEscopo = {}

  if (!dados.nome.trim()) erros.nome = MENSAGENS_ESCOPO.nome
  if (!dados.responsavelId) erros.responsavelId = MENSAGENS_ESCOPO.responsavel
  else if (!responsaveisPermitidos.includes(dados.responsavelId)) erros.responsavelId = MENSAGENS_ESCOPO.responsavelSemVinculo

  // Status (6.1): o escopo nasce aberto. O fechado só muda por Reabrir. Entre abertos, o que não é transição listada
  // é correção e pede justificativa (RN-22).
  const status = dados.status as StatusEscopo
  if (atual && escopoFechado(atual.status)) {
    if (status !== atual.status) erros.status = MENSAGENS_ESCOPO.fechado
  } else if (!STATUS_ESCOPO_ABERTOS.includes(status)) {
    erros.status = MENSAGENS_ESCOPO.status
  } else if (atual && !transicaoListadaEscopo(atual.status, status) && !dados.justificativa.trim()) {
    erros.justificativa = MENSAGENS_ESCOPO.justificativa
  }

  if (!(PRIORIDADES as string[]).includes(dados.prioridade)) erros.prioridade = MENSAGENS_ESCOPO.prioridade
  if (!atual) {
    if (!(CRITICIDADES as string[]).includes(dados.criticidade)) erros.criticidade = MENSAGENS_ESCOPO.criticidade
    if (!dados.justificativaCriticidade.trim()) erros.justificativaCriticidade = MENSAGENS_ESCOPO.justificativaCriticidade
  }

  for (const campo of ['inicio', 'conclusaoPrevista'] as const) {
    if (dados[campo] && !dataValida(dados[campo])) erros[campo] = MENSAGENS_ESCOPO.data
  }
  return erros
}
