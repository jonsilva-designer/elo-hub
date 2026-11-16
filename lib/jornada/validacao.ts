import type { LinhaEtapa, StatusEtapa } from '@/lib/dados/tipos'
import { dataExiste } from '@/lib/formato'
import { etapaPedeJustificativa, MOTIVO_ULTIMA_APLICAVEL } from './regras'

// Validação da atualização de uma etapa da Jornada (parte 3, 5.10), no servidor. As mensagens são provisórias (DT-03).

export const MENSAGENS_ETAPA = {
  status: 'Escolha o status.',
  naoAplicavel: 'Uma etapa Em andamento ou Concluída não vira Não aplicável.',
  ultimaAplicavel: MOTIVO_ULTIMA_APLICAVEL,
  responsavelSemVinculo: 'O responsável precisa ter vínculo com o cliente.',
  data: 'Informe uma data válida.',
  conclusao: 'Informe a data de conclusão.',
  justificativa: 'Escreva a justificativa da mudança.',
  justificativaReabertura: 'Escreva a justificativa da reabertura.',
  fechado: 'As etapas não mudam com o escopo fechado.',
}

export type DadosEtapa = {
  escopoId: string
  etapa: string
  status: string
  /** Vazio: sem responsável. */
  responsavelId: string
  /** Datas em AAAA-MM-DD, como o campo de data manda; vazias quando não informadas. */
  inicio: string
  conclusao: string
  observacoes: string
  justificativa: string
}

export type ErrosEtapa = Partial<Record<'status' | 'responsavelId' | 'inicio' | 'conclusao' | 'justificativa', string>>

const CAMPOS = ['escopoId', 'etapa', 'status', 'responsavelId', 'inicio', 'conclusao', 'observacoes', 'justificativa'] as const

/** Os campos do formulário, sem espaços nas pontas. */
export function lerDadosEtapa(formData: FormData): DadosEtapa {
  const dados = {} as DadosEtapa
  for (const campo of CAMPOS) {
    const valor = formData.get(campo)
    dados[campo] = typeof valor === 'string' ? valor.trim() : ''
  }
  return dados
}

/** A data no formato AAAA-MM-DD e que existe no calendário: 31/02 não vira 03/03. */
function dataValida(data: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data)
  return m !== null && dataExiste(Number(m[1]), Number(m[2]), Number(m[3]))
}

/** O erro do status fora dos destinos: a última aplicável, a etapa já começada, ou um status que não vale. */
function erroDoStatus(atual: StatusEtapa, novo: string, motivo: string | null): string {
  if (novo !== 'Não aplicável') return MENSAGENS_ETAPA.status
  if (motivo === MOTIVO_ULTIMA_APLICAVEL) return MENSAGENS_ETAPA.ultimaAplicavel
  if (atual === 'Em andamento' || atual === 'Concluída') return MENSAGENS_ETAPA.naoAplicavel
  return motivo ?? MENSAGENS_ETAPA.status
}

/**
 * Os erros por campo; vazio quando está tudo certo. A permissão da Equipe é conferida antes, na ação.
 * - `destinos` e `motivo`: o que `mudancasDaEtapa` dá para a etapa e o perfil (PRD 6.1, DF-49).
 * - `responsaveisPermitidos`: os ids de `listarResponsaveis` do cliente (RN-19).
 */
export function validarEtapa(
  dados: DadosEtapa,
  contexto: { atual: LinhaEtapa; destinos: StatusEtapa[]; motivo: string | null; responsaveisPermitidos: string[] },
): ErrosEtapa {
  const { atual, destinos, motivo, responsaveisPermitidos } = contexto
  const erros: ErrosEtapa = {}
  const novo = dados.status as StatusEtapa

  if (novo !== atual.status && !destinos.includes(novo)) erros.status = erroDoStatus(atual.status, dados.status, motivo)
  if (dados.responsavelId && !responsaveisPermitidos.includes(dados.responsavelId)) {
    erros.responsavelId = MENSAGENS_ETAPA.responsavelSemVinculo
  }

  for (const campo of ['inicio', 'conclusao'] as const) {
    if (dados[campo] && !dataValida(dados[campo])) erros[campo] = MENSAGENS_ETAPA.data
  }
  // Concluir pede a data de conclusão (CA-06.3).
  if (novo === 'Concluída' && !dados.conclusao) erros.conclusao = MENSAGENS_ETAPA.conclusao

  // A reabertura de uma Concluída e as correções pedem justificativa (RN-22).
  if (!erros.status && etapaPedeJustificativa(atual.status, novo) && !dados.justificativa) {
    erros.justificativa =
      atual.status === 'Concluída' ? MENSAGENS_ETAPA.justificativaReabertura : MENSAGENS_ETAPA.justificativa
  }
  return erros
}
