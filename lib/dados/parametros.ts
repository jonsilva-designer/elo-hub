import type { Criticidade } from '@/lib/design/status'
import { DIAS_DO_ALERTA, DIAS_PROXIMO_DO_PRAZO, INICIO_DA_OPERACAO, REFERENCIAS_DE_PRAZO, REMETENTES } from './mock/parametros'
import { ehAdmin } from './regras'
import { obterUsuarioAtual } from './sessao'

/** Dias de antecedência do alerta de vencimento (DF-34, DF-81). A parte 8 deixa o Administrador mudar. */
export async function obterDiasDoAlerta(): Promise<number> {
  return DIAS_DO_ALERTA
}

/** Dias antes do prazo em que a atividade fica "próxima do prazo" (DF-72, RN-10). A parte 8 deixa o Administrador mudar. */
export async function obterDiasProximoDoPrazo(): Promise<number> {
  return DIAS_PROXIMO_DO_PRAZO
}

/** A referência de prazo por criticidade, em dias, só como orientação na triagem (DF-22). Vazia até a ELO definir. */
export async function obterReferenciasDePrazo(): Promise<Partial<Record<Criticidade, number>>> {
  return { ...REFERENCIAS_DE_PRAZO }
}

/** A data do início oficial da operação, ou null enquanto não registrado (DF-46). A parte 8 deixa registrar. */
export async function obterInicioDaOperacao(): Promise<string | null> {
  return INICIO_DA_OPERACAO
}

export type Parametros = {
  diasProximoDoPrazo: number
  diasDoAlerta: number
  remetenteDemanda: string
  remetenteSite: string
  referencias: Partial<Record<Criticidade, number>>
  inicioOperacao: string | null
}

/** Todos os parâmetros do Administrador, para a tela de configurações (parte 8, 4.3). Null para a Equipe (CA-01.2). */
export async function obterParametros(): Promise<Parametros | null> {
  if (!ehAdmin(await obterUsuarioAtual())) return null
  return {
    diasProximoDoPrazo: DIAS_PROXIMO_DO_PRAZO,
    diasDoAlerta: DIAS_DO_ALERTA,
    remetenteDemanda: REMETENTES.notificacaoDemanda,
    remetenteSite: REMETENTES.avisosDoSite,
    referencias: { ...REFERENCIAS_DE_PRAZO },
    inicioOperacao: INICIO_DA_OPERACAO,
  }
}
