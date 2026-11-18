import { dataValida } from '@/lib/escopos/validacao'

// Validação dos parâmetros do Administrador (parte 8, 4.3; DF-81, Apêndice C; arquitetura 4.3, `configuracao`): os dias
// dos alertas são inteiros de 1 a 90; o remetente é do domínio elogovernance.com.br (DF-21); a referência de prazo é um
// inteiro positivo ou vazia (DF-22); o início da operação é uma data ou vazio (DF-46).

export const MENSAGENS_PARAMETROS = {
  dias: 'Informe um número inteiro de 1 a 90.',
  remetente: 'Informe um e-mail do domínio elogovernance.com.br.',
  referencia: 'Informe um número inteiro de dias, maior que zero, ou deixe vazio.',
  data: 'Informe uma data válida.',
}

export const CAMPOS_PARAMETROS = [
  'diasProximoDoPrazo',
  'diasDoAlerta',
  'remetenteDemanda',
  'remetenteSite',
  'referenciaBaixa',
  'referenciaModerada',
  'referenciaAlta',
  'referenciaCritica',
  'inicioOperacao',
] as const

export type CampoParametro = (typeof CAMPOS_PARAMETROS)[number]

export type DadosParametros = Record<CampoParametro, string>

export type ErrosParametros = Partial<Record<CampoParametro, string>>

export function lerDadosParametros(formData: FormData): DadosParametros {
  const dados = {} as DadosParametros
  for (const campo of CAMPOS_PARAMETROS) {
    const valor = formData.get(campo)
    dados[campo] = typeof valor === 'string' ? valor.trim() : ''
  }
  return dados
}

const inteiro = (texto: string) => (/^\d+$/.test(texto) ? Number(texto) : null)

const doDominio = (email: string) => /^[^\s@]+@elogovernance\.com\.br$/i.test(email)

export function validarParametros(dados: DadosParametros): ErrosParametros {
  const erros: ErrosParametros = {}
  for (const campo of ['diasProximoDoPrazo', 'diasDoAlerta'] as const) {
    const n = inteiro(dados[campo])
    if (n === null || n < 1 || n > 90) erros[campo] = MENSAGENS_PARAMETROS.dias
  }
  for (const campo of ['remetenteDemanda', 'remetenteSite'] as const) {
    if (!doDominio(dados[campo])) erros[campo] = MENSAGENS_PARAMETROS.remetente
  }
  for (const campo of ['referenciaBaixa', 'referenciaModerada', 'referenciaAlta', 'referenciaCritica'] as const) {
    const n = inteiro(dados[campo])
    if (dados[campo] && (n === null || n < 1)) erros[campo] = MENSAGENS_PARAMETROS.referencia
  }
  if (dados.inicioOperacao && !dataValida(dados.inicioOperacao)) erros.inicioOperacao = MENSAGENS_PARAMETROS.data
  return erros
}
