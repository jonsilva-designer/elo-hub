import type { StatusDemanda } from '@/lib/dados/tipos'
import { CRITICIDADES } from '@/lib/escopos/regras'
import { dataValida } from '@/lib/escopos/validacao'
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
  categoria: 'Escolha a categoria.',
  criticidade: 'Escolha a criticidade.',
  atendimento: 'Escolha o responsável pelo atendimento.',
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

/** Os dados e a triagem da demanda, como o formulário de edição manda (parte 5, 5.11). */
export type DadosDemanda = Omit<DadosNovaDemanda, 'clienteId'> & {
  numero: string
  categoria: string
  criticidade: string
  prazo: string
  responsavelAtendimentoId: string
  especialistaIds: string[]
  principalId: string
}

const CAMPOS_EDICAO = [
  'numero',
  'contratoId',
  'escopoId',
  'origem',
  'assunto',
  'descricao',
  'categoria',
  'criticidade',
  'prazo',
  'responsavelTriagemId',
  'responsavelAtendimentoId',
  'principalId',
] as const

/** Os campos da edição, sem espaços nas pontas; os especialistas sem repetir. */
export function lerDadosDemanda(formData: FormData): DadosDemanda {
  const dados = {} as DadosDemanda
  for (const campo of CAMPOS_EDICAO) {
    const valor = formData.get(campo)
    dados[campo] = typeof valor === 'string' ? valor.trim() : ''
  }
  dados.especialistaIds = [...new Set(formData.getAll('especialistaIds').filter((v): v is string => typeof v === 'string'))]
  return dados
}

/** Os status que já passaram pela triagem: neles, categoria, criticidade e atendente são obrigatórios (CA-09.2). */
const DEPOIS_DA_TRIAGEM: StatusDemanda[] = ['Em atendimento', 'Aguardando retorno', 'Resolvida']

/**
 * Os erros da edição. O contexto vem do servidor: o status atual, se o cliente é o cadastro da ELO, os contratos e
 * escopos do cliente, os responsáveis possíveis (RN-19) e as categorias (DF-70).
 */
export function validarDemanda(
  dados: DadosDemanda,
  contexto: {
    status: StatusDemanda
    ehCadastroElo: boolean
    contratos: { id: string }[]
    escopos: { id: string; contratoId: string }[]
    responsaveis: string[]
    categorias: string[]
  },
): ErrosDemanda {
  const erros: ErrosDemanda = {}
  if (dados.contratoId && !contexto.contratos.some((c) => c.id === dados.contratoId)) erros.contratoId = MENSAGENS_DEMANDA.contrato
  if (dados.escopoId) {
    const escopo = contexto.escopos.find((e) => e.id === dados.escopoId)
    if (!escopo || (dados.contratoId && escopo.contratoId !== dados.contratoId)) erros.escopoId = MENSAGENS_DEMANDA.escopo
  }
  const origem = erroDaOrigem(dados.origem, contexto.ehCadastroElo)
  if (origem) erros.origem = origem
  if (!dados.assunto.trim()) erros.assunto = MENSAGENS_DEMANDA.assunto
  if (!dados.descricao.trim()) erros.descricao = MENSAGENS_DEMANDA.descricao

  if (!dados.responsavelTriagemId) erros.responsavelTriagemId = MENSAGENS_DEMANDA.responsavelTriagem
  else if (!contexto.responsaveis.includes(dados.responsavelTriagemId)) {
    erros.responsavelTriagemId = MENSAGENS_DEMANDA.responsavelSemVinculo
  }
  if (dados.responsavelAtendimentoId && !contexto.responsaveis.includes(dados.responsavelAtendimentoId)) {
    erros.responsavelAtendimentoId = MENSAGENS_DEMANDA.responsavelSemVinculo
  }
  if (dados.categoria && !contexto.categorias.includes(dados.categoria)) erros.categoria = MENSAGENS_DEMANDA.categoria
  if (dados.criticidade && !(CRITICIDADES as string[]).includes(dados.criticidade)) erros.criticidade = MENSAGENS_DEMANDA.criticidade
  if (dados.prazo && !dataValida(dados.prazo)) erros.prazo = MENSAGENS_DEMANDA.data

  if (DEPOIS_DA_TRIAGEM.includes(contexto.status)) {
    if (!dados.categoria) erros.categoria = MENSAGENS_DEMANDA.categoria
    if (!dados.criticidade) erros.criticidade = MENSAGENS_DEMANDA.criticidade
    if (!dados.responsavelAtendimentoId) erros.responsavelAtendimentoId = MENSAGENS_DEMANDA.atendimento
  }

  // Com mais de um especialista, um deles é o principal (DF-32, CA-09.12).
  if (dados.especialistaIds.length > 1 && !dados.especialistaIds.includes(dados.principalId)) {
    erros.especialistas = MENSAGENS_DEMANDA.principal
  }
  return erros
}
