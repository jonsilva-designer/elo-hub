import type { ItemQueImpede } from '@/lib/dados/tipos'

// O que as ações do servidor devolvem às telas. No protótipo, salvar só simula (parte 2, seção 2):
// as ações conferem tudo e respondem como se tivessem gravado, e o aviso diz que nada ficou gravado.

/** Recusa para quem não pode usar a ação. Não diz se o registro existe. */
export const SEM_PERMISSAO = 'Você não tem permissão para esta ação.'

export const NAO_GRAVA = 'No protótipo, os dados não são gravados.'

export type ResultadoAcao =
  | { ok: true; mensagem: string }
  | { ok: false; mensagem: string; impedimentos?: ItemQueImpede[] }

/** mensagemDeSucesso('Cliente salvo.') → 'Cliente salvo. No protótipo, os dados não são gravados.' */
export function mensagemDeSucesso(frase: string): string {
  return `${frase} ${NAO_GRAVA}`
}
