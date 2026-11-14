import type { Cliente } from '@/lib/dados/tipos'

// Abas da página do cliente (parte 2, 5.6). A aba aberta vai para o endereço (`?aba=maturidade`),
// para a volta de uma avaliação cair na aba certa.

export type AbaCliente = 'resumo' | 'maturidade' | 'contratos' | 'escopos' | 'demandas' | 'documentos' | 'historico'

export const ROTULOS_DAS_ABAS: Record<AbaCliente, string> = {
  resumo: 'Resumo',
  maturidade: 'Maturidade',
  contratos: 'Contratos',
  escopos: 'Escopos',
  demandas: 'Demandas',
  documentos: 'Documentos',
  historico: 'Histórico',
}

const TODAS: AbaCliente[] = ['resumo', 'maturidade', 'contratos', 'escopos', 'demandas', 'documentos', 'historico']

/** O cadastro da ELO não tem maturidade, contratos nem escopos: só as demandas institucionais (DF-40). */
const DO_CADASTRO_DA_ELO: AbaCliente[] = ['resumo', 'demandas', 'documentos', 'historico']

export function abasDoCliente(cliente: Cliente): AbaCliente[] {
  return cliente.ehCadastroElo ? DO_CADASTRO_DA_ELO : TODAS
}

/** A aba do endereço, se o cliente a tem. Desconhecida ou ausente: Resumo. */
export function abaValida(aba: string | undefined, cliente: Cliente): AbaCliente {
  return abasDoCliente(cliente).find((a) => a === aba) ?? 'resumo'
}
