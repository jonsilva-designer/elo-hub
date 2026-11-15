import { DIAS_DO_ALERTA } from './mock/parametros'

/** Dias de antecedência do alerta de vencimento (DF-34, DF-81). A parte 8 deixa o Administrador mudar. */
export async function obterDiasDoAlerta(): Promise<number> {
  return DIAS_DO_ALERTA
}
