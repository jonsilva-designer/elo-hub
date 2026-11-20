import type { EspecialistaLigado, OrigemEspecialista, StatusEspecialista } from '@/lib/dados/tipos'

// Regras do especialista (F11; PRD 6.1). Nenhum status é final, e só o Administrador muda.

export const STATUS_ESPECIALISTA: StatusEspecialista[] = ['Em análise', 'Ativo', 'Inativo']

export const ORIGENS_ESPECIALISTA: OrigemEspecialista[] = ['Site', 'Cadastro interno']

/** O mesmo e-mail, sem diferenciar maiúsculas nem espaços nas pontas (DF-50). E-mail vazio não casa com nada. */
export function mesmoEmail(a: string, b: string): boolean {
  const x = a.trim().toLocaleLowerCase('pt-BR')
  return x !== '' && x === b.trim().toLocaleLowerCase('pt-BR')
}

/**
 * As opções da seleção de especialistas de um escopo ou demanda: os Ativos e os já ligados, mesmo que não estejam
 * mais Ativos, que continuam até a troca (CA-11.2, DF-51). O rótulo traz a especialidade e, fora dos Ativos, o status.
 */
export function opcoesDeVinculo(
  ativos: readonly EspecialistaLigado[],
  ligados: readonly EspecialistaLigado[],
): { valor: string; rotulo: string }[] {
  const todos = [...ativos, ...ligados.filter((l) => !ativos.some((a) => a.id === l.id))]
  return todos
    .map((e) => ({
      valor: e.id,
      rotulo: `${e.nome} · ${e.especialidade}${e.status === 'Ativo' ? '' : ` (${e.status})`}`,
    }))
    .sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'))
}

/** O link do currículo: começa com http:// ou https://, sem espaço. A mesma regra no site e no cadastro (revisão do código). */
export function linkValido(link: string): boolean {
  return /^https?:\/\/\S+$/i.test(link)
}

/** A cidade e a UF como foram preenchidas: a UF aparece mesmo sem a cidade (revisão do código). */
export function cidadeUf(cidade: string | null | undefined, uf: string | null | undefined): string {
  return [cidade, uf].filter((x) => x && x.trim()).join('/')
}
