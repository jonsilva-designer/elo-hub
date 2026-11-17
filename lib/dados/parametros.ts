import type { Criticidade } from '@/lib/design/status'
import { DIAS_DO_ALERTA, DIAS_PROXIMO_DO_PRAZO, INICIO_DA_OPERACAO, REFERENCIAS_DE_PRAZO } from './mock/parametros'

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
