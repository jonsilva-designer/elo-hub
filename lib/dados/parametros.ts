import { DIAS_DO_ALERTA, DIAS_PROXIMO_DO_PRAZO } from './mock/parametros'

/** Dias de antecedência do alerta de vencimento (DF-34, DF-81). A parte 8 deixa o Administrador mudar. */
export async function obterDiasDoAlerta(): Promise<number> {
  return DIAS_DO_ALERTA
}

/** Dias antes do prazo em que a atividade fica "próxima do prazo" (DF-72, RN-10). A parte 8 deixa o Administrador mudar. */
export async function obterDiasProximoDoPrazo(): Promise<number> {
  return DIAS_PROXIMO_DO_PRAZO
}
