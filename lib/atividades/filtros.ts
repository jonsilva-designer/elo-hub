import type { AtividadeDetalhada, StatusAtividade } from '@/lib/dados/tipos'
import { normalizarBusca } from '@/lib/texto'
import { atividadeFechada, compararAtividades, STATUS_ATIVIDADE } from './regras'

// Busca e filtros de Minhas atividades (parte 4, 5.8; CA-08.5). Os filtros vão para o endereço, para a volta da
// edição da atividade encontrar a lista igual (CA-16.2). A tela e a exportação usam a mesma função.

/** O filtro de prazo: a situação calculada (RN-09, RN-10). "No prazo" é a aberta sem as outras duas. */
export type PrazoFiltro = 'Atrasada' | 'Próxima do prazo' | 'No prazo'

export const PRAZOS_FILTRO: PrazoFiltro[] = ['Atrasada', 'Próxima do prazo', 'No prazo']

export type FiltrosAtividades = {
  busca: string
  /** null: todos os responsáveis. */
  responsavel: string | null
  status: StatusAtividade[]
  prazo: PrazoFiltro[]
  escopo: string | null
}

/** Onde a lista guarda os filtros na aba do navegador (sessionStorage), para o caminho de volta. */
export const CHAVE_FILTROS_DAS_ATIVIDADES = 'elo:filtros-atividades'

/** O responsável "todos" no endereço. Sem o parâmetro, a lista abre com a pessoa que entrou. */
const TODOS = 'todos'

/** Os itens da lista com vírgula que estão entre os permitidos, sem repetir. */
function lista<T extends string>(texto: string | null, permitidos: readonly T[]): T[] {
  const itens = (texto ?? '').split(',').filter((s): s is T => (permitidos as readonly string[]).includes(s))
  return [...new Set(itens)]
}

/**
 * Os filtros do endereço. Sem responsável, ou com um que não está nas opções, a pessoa que entrou (CA-08.4); com
 * `todos`, nenhum filtro de responsável. O resto que não está nas opções é ignorado.
 */
export function lerFiltrosAtividades(
  params: URLSearchParams,
  opcoes: { usuarioId: string; responsaveis: string[]; escopos: string[] },
): FiltrosAtividades {
  const responsavel = params.get('responsavel')
  const escopo = params.get('escopo')
  return {
    busca: params.get('busca') ?? '',
    responsavel:
      responsavel === TODOS ? null : responsavel && opcoes.responsaveis.includes(responsavel) ? responsavel : opcoes.usuarioId,
    status: lista(params.get('status'), STATUS_ATIVIDADE),
    prazo: lista(params.get('prazo'), PRAZOS_FILTRO),
    escopo: escopo && opcoes.escopos.includes(escopo) ? escopo : null,
  }
}

/** O texto do endereço, sem `?`. O responsável que é a pessoa que entrou não vai; "todos" vai como `todos`. */
export function escreverFiltrosAtividades(filtros: FiltrosAtividades, usuarioId: string): string {
  const params = new URLSearchParams()
  if (filtros.busca.trim()) params.set('busca', filtros.busca)
  if (filtros.responsavel === null) params.set('responsavel', TODOS)
  else if (filtros.responsavel !== usuarioId) params.set('responsavel', filtros.responsavel)
  if (filtros.status.length > 0) params.set('status', filtros.status.join(','))
  if (filtros.prazo.length > 0) params.set('prazo', filtros.prazo.join(','))
  if (filtros.escopo) params.set('escopo', filtros.escopo)
  return params.toString().replace(/%2C/g, ',')
}

/** A situação da atividade no filtro de prazo; a fechada não entra em nenhuma. */
function prazoDa(a: AtividadeDetalhada): PrazoFiltro | null {
  if (atividadeFechada(a.status)) return null
  return a.situacao ?? 'No prazo'
}

/** Uma busca sem letra nem dígito ("   ", ".") conta como vazia. Acha pela atividade, pelo plano e pelo cliente. */
function casaComBusca(a: AtividadeDetalhada, busca: string): boolean {
  const termo = normalizarBusca(busca.trim())
  if (!/[\p{L}\p{N}]/u.test(termo)) return true
  return [a.nome, a.nomePlano, a.nomeCliente].some((texto) => normalizarBusca(texto).includes(termo))
}

/** A ordem inicial (CA-08.4): as abertas pelo prazo, as fechadas no fim; depois pelo nome. */
export function ordenarAtividades(atividades: readonly AtividadeDetalhada[]): AtividadeDetalhada[] {
  return [...atividades].sort((a, b) => compararAtividades(a, b) || a.nome.localeCompare(b.nome, 'pt-BR'))
}

/** As atividades que passam na busca e nos filtros, na ordem inicial da lista. */
export function filtrarAtividades(atividades: readonly AtividadeDetalhada[], filtros: FiltrosAtividades): AtividadeDetalhada[] {
  return ordenarAtividades(
    atividades.filter((a) => {
      const prazo = prazoDa(a)
      return (
        casaComBusca(a, filtros.busca) &&
        (!filtros.responsavel || a.responsavelId === filtros.responsavel) &&
        (filtros.status.length === 0 || filtros.status.includes(a.status)) &&
        (filtros.prazo.length === 0 || (prazo !== null && filtros.prazo.includes(prazo))) &&
        (!filtros.escopo || a.escopoId === filtros.escopo)
      )
    }),
  )
}

/** As opções do filtro Responsável: os responsáveis das atividades que o usuário vê, pelo nome. */
export function responsaveisDasAtividades(atividades: readonly AtividadeDetalhada[]): { valor: string; rotulo: string }[] {
  const unicos = new Map(atividades.map((a) => [a.responsavelId, { valor: a.responsavelId, rotulo: a.nomeResponsavel }]))
  return [...unicos.values()].sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'))
}

/** As opções do filtro Escopo: os escopos das atividades, pelo nome, com o cliente para separar os iguais. */
export function escoposDasAtividades(
  atividades: readonly AtividadeDetalhada[],
): { valor: string; rotulo: string; cliente: string }[] {
  const unicos = new Map(atividades.map((a) => [a.escopoId, { valor: a.escopoId, rotulo: a.nomeEscopo, cliente: a.nomeCliente }]))
  return [...unicos.values()].sort(
    (a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR') || a.cliente.localeCompare(b.cliente, 'pt-BR'),
  )
}
