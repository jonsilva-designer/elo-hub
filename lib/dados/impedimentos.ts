import { demandasQueImpedem } from './demandas'
import { escoposQueImpedemFechar, etapasQueImpedemFechar } from './escopos'
import { planosQueImpedemFechar } from './planos'
import type { ItemQueImpede } from './tipos'

// O que impede fechar um contrato ou um escopo (RN-18, DF-26, DF-59), num lugar só: a ação do servidor e a janela
// da tela usam a mesma lista. Fica fora de escopos.ts e de planos.ts porque junta os dois.

/** Contrato: os escopos e as demandas abertos ligados a ele. */
export async function impedimentosDoContrato(contratoId: string): Promise<ItemQueImpede[]> {
  const [escopos, demandas] = await Promise.all([escoposQueImpedemFechar(contratoId), demandasQueImpedem({ contratoId })])
  return [...escopos, ...demandas]
}

/** Escopo: as etapas Em andamento, os planos abertos e as demandas abertas ligadas a ele. */
export async function impedimentosDoEscopo(escopoId: string): Promise<ItemQueImpede[]> {
  const [etapas, planos, demandas] = await Promise.all([
    etapasQueImpedemFechar(escopoId),
    planosQueImpedemFechar(escopoId),
    demandasQueImpedem({ escopoId }),
  ])
  return [...etapas, ...planos, ...demandas]
}
