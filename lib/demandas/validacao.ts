import { origemPermitida, ORIGENS_DEMANDA } from './regras'

// Validação da nova demanda e da edição (parte 5, 5.9 e 5.11), no servidor. As mensagens são provisórias (DT-03).

export const MENSAGENS_DEMANDA = {
  cliente: 'Escolha o cliente.',
  origem: 'Escolha a origem.',
  institucionalForaDaElo: 'A origem Institucional é só para o cadastro da ELO.',
  eloSoInstitucional: 'O cadastro da ELO só aceita a origem Institucional.',
  assunto: 'Informe o assunto.',
  descricao: 'Descreva a demanda.',
  responsavelTriagem: 'Escolha o responsável pela triagem.',
  responsavelSemVinculo: 'O responsável precisa ter vínculo com o cliente.',
  contrato: 'O contrato precisa ser do cliente.',
  escopo: 'O escopo precisa ser do contrato escolhido.',
  data: 'Informe uma data válida.',
  principal: 'Escolha o principal entre os especialistas.',
}

export type DadosNovaDemanda = {
  clienteId: string
  contratoId: string
  escopoId: string
  origem: string
  assunto: string
  descricao: string
  responsavelTriagemId: string
}

export type ErrosDemanda = Partial<
  Record<
    | 'clienteId'
    | 'contratoId'
    | 'escopoId'
    | 'origem'
    | 'assunto'
    | 'descricao'
    | 'responsavelTriagemId'
    | 'responsavelAtendimentoId'
    | 'categoria'
    | 'criticidade'
    | 'prazo'
    | 'especialistas',
    string
  >
>

const CAMPOS_NOVA = ['clienteId', 'contratoId', 'escopoId', 'origem', 'assunto', 'descricao', 'responsavelTriagemId'] as const

/** Os campos da nova demanda, sem espaços nas pontas. */
export function lerDadosNovaDemanda(formData: FormData): DadosNovaDemanda {
  const dados = {} as DadosNovaDemanda
  for (const campo of CAMPOS_NOVA) {
    const valor = formData.get(campo)
    dados[campo] = typeof valor === 'string' ? valor.trim() : ''
  }
  return dados
}

/** O erro da origem, ou nada: obrigatória, e a Institucional só no cadastro da ELO (CA-09.15, DF-40). */
export function erroDaOrigem(origem: string, ehCadastroElo: boolean): string | undefined {
  if (!(ORIGENS_DEMANDA as string[]).includes(origem)) return MENSAGENS_DEMANDA.origem
  if (origemPermitida(origem, ehCadastroElo)) return undefined
  return ehCadastroElo ? MENSAGENS_DEMANDA.eloSoInstitucional : MENSAGENS_DEMANDA.institucionalForaDaElo
}

/**
 * Os erros da nova demanda. O contexto vem do servidor: o cliente escolhido (null quando não pode ser escolhido), os
 * contratos e escopos dele que o usuário vê e os responsáveis possíveis pela triagem.
 */
export function validarNovaDemanda(
  dados: DadosNovaDemanda,
  contexto: {
    cliente: { ehCadastroElo: boolean } | null
    contratos: { id: string }[]
    escopos: { id: string; contratoId: string }[]
    responsaveis: string[]
  },
): ErrosDemanda {
  const erros: ErrosDemanda = {}
  if (!contexto.cliente) erros.clienteId = MENSAGENS_DEMANDA.cliente
  if (dados.contratoId && !contexto.contratos.some((c) => c.id === dados.contratoId)) erros.contratoId = MENSAGENS_DEMANDA.contrato
  if (dados.escopoId) {
    const escopo = contexto.escopos.find((e) => e.id === dados.escopoId)
    if (!escopo || (dados.contratoId && escopo.contratoId !== dados.contratoId)) erros.escopoId = MENSAGENS_DEMANDA.escopo
  }
  const origem = erroDaOrigem(dados.origem, contexto.cliente?.ehCadastroElo ?? false)
  if (origem && (contexto.cliente || !dados.origem)) erros.origem = origem
  if (!dados.assunto.trim()) erros.assunto = MENSAGENS_DEMANDA.assunto
  if (!dados.descricao.trim()) erros.descricao = MENSAGENS_DEMANDA.descricao
  if (!dados.responsavelTriagemId) erros.responsavelTriagemId = MENSAGENS_DEMANDA.responsavelTriagem
  else if (contexto.cliente && !contexto.responsaveis.includes(dados.responsavelTriagemId)) {
    erros.responsavelTriagemId = MENSAGENS_DEMANDA.responsavelSemVinculo
  }
  return erros
}
