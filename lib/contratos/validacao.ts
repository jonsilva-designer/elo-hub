import type { Contrato, StatusContrato } from '@/lib/dados/tipos'
import { dataExiste, lerValorEmReais } from '@/lib/formato'
import { contratoFechado, STATUS_ABERTOS, STATUS_DO_CADASTRO, transicaoListada } from './regras'

// Validação do cadastro do contrato (parte 3, 5.5), no servidor. As mensagens são provisórias (DT-03).

export const MENSAGENS_CONTRATO = {
  cliente: 'Escolha o cliente.',
  codigo: 'Informe o código.',
  codigoRepetido: 'Este cliente já tem um contrato com este código.',
  contratante: 'Escolha o contratante.',
  objeto: 'Informe o objeto.',
  servicos: 'Escolha pelo menos um serviço.',
  responsavel: 'Escolha o responsável.',
  responsavelSemVinculo: 'O responsável precisa ter vínculo com o cliente.',
  status: 'Escolha o status.',
  fechado: 'Para reabrir, use Reabrir na página do contrato.',
  justificativa: 'Escreva a justificativa da mudança.',
  tipoVigencia: 'Escolha o tipo de vigência.',
  data: 'Informe uma data válida.',
  inicio: 'Informe o início da vigência.',
  termino: 'Informe o término da vigência.',
  terminoAntes: 'O término não pode ser antes do início.',
  valor: 'Informe um valor em reais.',
  documentoPrincipal: 'O documento principal precisa ser um contrato ou uma proposta deste contrato.',
}

export type DadosContrato = {
  clienteId: string
  codigo: string
  contratante: string
  objeto: string
  servicos: string[]
  responsavelId: string
  status: string
  justificativa: string
  tipoVigencia: string
  /** Datas em AAAA-MM-DD, como o campo de data manda; vazias quando não informadas. */
  dataProposta: string
  inicio: string
  termino: string
  /** Como o campo de valor manda ("1.850.000,00"); vazio quando não informado. */
  valor: string
  observacoes: string
}

export type ErrosContrato = Partial<
  Record<
    | 'clienteId'
    | 'codigo'
    | 'contratante'
    | 'objeto'
    | 'servicos'
    | 'responsavelId'
    | 'status'
    | 'justificativa'
    | 'tipoVigencia'
    | 'dataProposta'
    | 'inicio'
    | 'termino'
    | 'valor'
    | 'documentoPrincipalId',
    string
  >
>

const CAMPOS_DE_TEXTO = [
  'clienteId',
  'codigo',
  'contratante',
  'objeto',
  'responsavelId',
  'status',
  'justificativa',
  'tipoVigencia',
  'dataProposta',
  'inicio',
  'termino',
  'valor',
  'observacoes',
] as const

/** Os campos do formulário, sem espaços nas pontas. Os serviços vêm de vários campos `servicos`, sem repetir. */
export function lerDadosContrato(formData: FormData): DadosContrato {
  const dados = { servicos: [] } as unknown as DadosContrato
  for (const campo of CAMPOS_DE_TEXTO) {
    const valor = formData.get(campo)
    dados[campo] = typeof valor === 'string' ? valor.trim() : ''
  }
  const servicos = formData.getAll('servicos').filter((s): s is string => typeof s === 'string')
  dados.servicos = [...new Set(servicos.map((s) => s.trim()).filter(Boolean))]
  return dados
}

const normalizarCodigo = (codigo: string) => codigo.trim().toLocaleLowerCase('pt-BR')

/** A data no formato AAAA-MM-DD e que existe no calendário: 31/02 não vira 03/03. */
function dataValida(data: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data)
  return m !== null && dataExiste(Number(m[1]), Number(m[2]), Number(m[3]))
}

/**
 * Os erros por campo; vazio quando está tudo certo.
 * - `atual`: o contrato em edição, ou null no cadastro.
 * - `codigosDoCliente`: os códigos dos outros contratos do mesmo cliente (na edição, sem o próprio).
 * - `responsaveisPermitidos`: os ids de `listarResponsaveis` do cliente (RN-19).
 */
export function validarContrato(
  dados: DadosContrato,
  contexto: { atual: Contrato | null; codigosDoCliente: string[]; responsaveisPermitidos: string[] },
): ErrosContrato {
  const { atual, codigosDoCliente, responsaveisPermitidos } = contexto
  const erros: ErrosContrato = {}

  if (!dados.clienteId) erros.clienteId = MENSAGENS_CONTRATO.cliente
  if (!dados.codigo.trim()) erros.codigo = MENSAGENS_CONTRATO.codigo
  else if (codigosDoCliente.some((c) => normalizarCodigo(c) === normalizarCodigo(dados.codigo))) {
    erros.codigo = MENSAGENS_CONTRATO.codigoRepetido
  }
  if (!dados.contratante) erros.contratante = MENSAGENS_CONTRATO.contratante
  if (!dados.objeto.trim()) erros.objeto = MENSAGENS_CONTRATO.objeto
  if (dados.servicos.length === 0) erros.servicos = MENSAGENS_CONTRATO.servicos
  if (!dados.responsavelId) erros.responsavelId = MENSAGENS_CONTRATO.responsavel
  else if (!responsaveisPermitidos.includes(dados.responsavelId)) erros.responsavelId = MENSAGENS_CONTRATO.responsavelSemVinculo
  if (!dados.tipoVigencia) erros.tipoVigencia = MENSAGENS_CONTRATO.tipoVigencia

  // Status (6.1): o contrato nasce em Proposta, Em contratação ou Ativo. O fechado só muda por Reabrir. Entre abertos,
  // o que não é transição listada é correção do Administrador e pede justificativa (RN-22).
  const status = dados.status as StatusContrato
  if (atual && contratoFechado(atual.status)) {
    if (status !== atual.status) erros.status = MENSAGENS_CONTRATO.fechado
  } else if (!(atual ? STATUS_ABERTOS : STATUS_DO_CADASTRO).includes(status)) {
    erros.status = MENSAGENS_CONTRATO.status
  } else if (atual && !transicaoListada(atual.status, status) && !dados.justificativa.trim()) {
    erros.justificativa = MENSAGENS_CONTRATO.justificativa
  }

  // Datas: a que foi informada precisa existir. Ativo e Suspenso exigem a vigência (RN-03, CA-03.2).
  for (const campo of ['dataProposta', 'inicio', 'termino'] as const) {
    if (dados[campo] && !dataValida(dados[campo])) erros[campo] = MENSAGENS_CONTRATO.data
  }
  if (status === 'Ativo' || status === 'Suspenso') {
    if (!dados.inicio && !erros.inicio) erros.inicio = MENSAGENS_CONTRATO.inicio
    if (dados.tipoVigencia !== 'Prazo indeterminado' && !dados.termino && !erros.termino) {
      erros.termino = MENSAGENS_CONTRATO.termino
    }
  }
  if (!erros.inicio && !erros.termino && dados.inicio && dados.termino && dados.termino < dados.inicio) {
    erros.termino = MENSAGENS_CONTRATO.terminoAntes
  }

  if (dados.valor && lerValorEmReais(dados.valor) === null) erros.valor = MENSAGENS_CONTRATO.valor

  return erros
}
