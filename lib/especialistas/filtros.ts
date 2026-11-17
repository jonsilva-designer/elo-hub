import type { EspecialistaDetalhado, OrigemEspecialista, StatusEspecialista } from '@/lib/dados/tipos'
import { normalizarBusca } from '@/lib/texto'
import { ORIGENS_ESPECIALISTA, STATUS_ESPECIALISTA } from './regras'

// Busca e filtros da lista de especialistas (parte 5, 5.4; CA-11.3). Os filtros vão para o endereço, para a volta da
// página do especialista encontrar a lista igual (CA-16.2).

export type FiltrosEspecialistas = {
  busca: string
  status: StatusEspecialista[]
  especialidade: string | null
  origem: OrigemEspecialista | null
}

/** Onde a lista guarda os filtros na aba do navegador (sessionStorage), para o caminho de volta. */
export const CHAVE_FILTROS_DOS_ESPECIALISTAS = 'elo:filtros-especialistas'

/** Os itens da lista com vírgula que estão entre os permitidos, sem repetir. */
function lista<T extends string>(texto: string | null, permitidos: readonly T[]): T[] {
  const itens = (texto ?? '').split(',').filter((s): s is T => (permitidos as readonly string[]).includes(s))
  return [...new Set(itens)]
}

function umDe<T extends string>(texto: string | null, permitidos: readonly T[]): T | null {
  return texto && (permitidos as readonly string[]).includes(texto) ? (texto as T) : null
}

/** Os filtros do endereço. O que não está nas opções é ignorado. */
export function lerFiltrosEspecialistas(params: URLSearchParams, opcoes: { especialidades: string[] }): FiltrosEspecialistas {
  return {
    busca: params.get('busca') ?? '',
    status: lista(params.get('status'), STATUS_ESPECIALISTA),
    especialidade: umDe(params.get('especialidade'), opcoes.especialidades),
    origem: umDe(params.get('origem'), ORIGENS_ESPECIALISTA),
  }
}

/** O texto do endereço, sem `?`. Só o que foi escolhido; vazio quando não há filtro. */
export function escreverFiltrosEspecialistas(filtros: FiltrosEspecialistas): string {
  const params = new URLSearchParams()
  if (filtros.busca.trim()) params.set('busca', filtros.busca)
  if (filtros.status.length > 0) params.set('status', filtros.status.join(','))
  if (filtros.especialidade) params.set('especialidade', filtros.especialidade)
  if (filtros.origem) params.set('origem', filtros.origem)
  return params.toString().replace(/%2C/g, ',')
}

/** Uma busca sem letra nem dígito conta como vazia. Acha pelo nome e pelo e-mail, sem acento nem maiúsculas. */
function casaComBusca(e: EspecialistaDetalhado, busca: string): boolean {
  const termo = normalizarBusca(busca.trim())
  if (!/[\p{L}\p{N}]/u.test(termo)) return true
  return [e.nome, e.email].some((texto) => normalizarBusca(texto).includes(termo))
}

/**
 * Os especialistas que passam na busca e nos filtros. Sem filtro de status, o Inativo fica de fora (CA-18.2). Ordem:
 * as candidaturas Em análise primeiro, depois os Ativos e os Inativos; em cada grupo, pelo nome.
 */
export function filtrarEspecialistas(
  especialistas: readonly EspecialistaDetalhado[],
  filtros: FiltrosEspecialistas,
): EspecialistaDetalhado[] {
  return especialistas
    .filter(
      (e) =>
        casaComBusca(e, filtros.busca) &&
        (filtros.status.length === 0 ? e.status !== 'Inativo' : filtros.status.includes(e.status)) &&
        (!filtros.especialidade || e.especialidade === filtros.especialidade) &&
        (!filtros.origem || e.origem === filtros.origem),
    )
    .sort(
      (a, b) =>
        STATUS_ESPECIALISTA.indexOf(a.status) - STATUS_ESPECIALISTA.indexOf(b.status) ||
        a.nome.localeCompare(b.nome, 'pt-BR') ||
        a.cadastradoEm.localeCompare(b.cadastradoEm),
    )
}
