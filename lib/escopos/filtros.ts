import type { EscopoDetalhado, StatusEscopo } from '@/lib/dados/tipos'
import type { Criticidade, Prioridade } from '@/lib/design/status'
import { normalizarBusca } from '@/lib/texto'
import { CRITICIDADES, PRIORIDADES, STATUS_ESCOPO, escopoFechado } from './regras'

// Busca e filtros da lista de escopos (parte 3, 5.7; CA-05.5). Os filtros vão para o endereço, para a volta da
// página do escopo encontrar a lista igual, como na lista de contratos (CA-16.2).

export type FiltrosEscopos = {
  busca: string
  cliente: string | null
  contrato: string | null
  responsavel: string | null
  status: StatusEscopo[]
  criticidade: Criticidade[]
  prioridade: Prioridade[]
}

/** Onde a lista guarda os filtros na aba do navegador (sessionStorage), para o caminho de volta. */
export const CHAVE_FILTROS_DOS_ESCOPOS = 'elo:filtros-escopos'

/** Os itens da lista com vírgula que estão entre os permitidos, sem repetir. */
function lista<T extends string>(texto: string | null, permitidos: readonly T[]): T[] {
  const itens = (texto ?? '').split(',').filter((s): s is T => (permitidos as readonly string[]).includes(s))
  return [...new Set(itens)]
}

const umDe = (texto: string | null, permitidos: readonly string[]) => (texto && permitidos.includes(texto) ? texto : null)

/** Os filtros do endereço. O que não está nas opções é ignorado. */
export function lerFiltrosEscopos(
  params: URLSearchParams,
  opcoes: { clientes: string[]; contratos: string[]; responsaveis: string[] },
): FiltrosEscopos {
  return {
    busca: params.get('busca') ?? '',
    cliente: umDe(params.get('cliente'), opcoes.clientes),
    contrato: umDe(params.get('contrato'), opcoes.contratos),
    responsavel: umDe(params.get('responsavel'), opcoes.responsaveis),
    status: lista(params.get('status'), STATUS_ESCOPO),
    criticidade: lista(params.get('criticidade'), CRITICIDADES),
    prioridade: lista(params.get('prioridade'), PRIORIDADES),
  }
}

/** O texto do endereço, sem `?`. Só o que foi escolhido; vazio quando não há filtro. */
export function escreverFiltrosEscopos(filtros: FiltrosEscopos): string {
  const params = new URLSearchParams()
  if (filtros.busca.trim()) params.set('busca', filtros.busca)
  if (filtros.cliente) params.set('cliente', filtros.cliente)
  if (filtros.contrato) params.set('contrato', filtros.contrato)
  if (filtros.responsavel) params.set('responsavel', filtros.responsavel)
  if (filtros.status.length > 0) params.set('status', filtros.status.join(','))
  if (filtros.criticidade.length > 0) params.set('criticidade', filtros.criticidade.join(','))
  if (filtros.prioridade.length > 0) params.set('prioridade', filtros.prioridade.join(','))
  return params.toString().replace(/%2C/g, ',')
}

/** Uma busca sem letra nem dígito ("   ", ".") conta como vazia. Acha pelo nome do escopo e pelo código do contrato. */
function casaComBusca(e: EscopoDetalhado, busca: string): boolean {
  const termo = normalizarBusca(busca.trim())
  if (!/[\p{L}\p{N}]/u.test(termo)) return true
  return [e.nome, e.codigoContrato].some((texto) => normalizarBusca(texto).includes(termo))
}

/** Abertos primeiro e fechados no fim; em cada grupo, da Crítica para a Baixa; depois pelo nome. */
function pelaOrdemInicial(a: EscopoDetalhado, b: EscopoDetalhado): number {
  return (
    Number(escopoFechado(a.status)) - Number(escopoFechado(b.status)) ||
    CRITICIDADES.indexOf(b.criticidade) - CRITICIDADES.indexOf(a.criticidade) ||
    a.nome.localeCompare(b.nome, 'pt-BR')
  )
}

/** Os escopos que passam na busca e nos filtros, na ordem inicial da lista. */
export function filtrarEscopos(escopos: readonly EscopoDetalhado[], filtros: FiltrosEscopos): EscopoDetalhado[] {
  return escopos
    .filter(
      (e) =>
        casaComBusca(e, filtros.busca) &&
        (!filtros.cliente || e.clienteId === filtros.cliente) &&
        (!filtros.contrato || e.contratoId === filtros.contrato) &&
        (!filtros.responsavel || e.responsavelId === filtros.responsavel) &&
        (filtros.status.length === 0 || filtros.status.includes(e.status)) &&
        (filtros.criticidade.length === 0 || filtros.criticidade.includes(e.criticidade)) &&
        (filtros.prioridade.length === 0 || filtros.prioridade.includes(e.prioridade)),
    )
    .sort(pelaOrdemInicial)
}

/** Os escopos na ordem inicial da lista, sem filtro: a aba Escopos do cliente usa a mesma ordem. */
export function ordenarEscopos(escopos: readonly EscopoDetalhado[]): EscopoDetalhado[] {
  return [...escopos].sort(pelaOrdemInicial)
}

/** As opções do filtro Contrato: os contratos dos escopos que o usuário vê, pelo código e depois pelo cliente. */
export function contratosDosEscopos(
  escopos: readonly EscopoDetalhado[],
): { valor: string; codigo: string; clienteId: string; nomeCliente: string }[] {
  const unicos = new Map(
    escopos.map((e) => [e.contratoId, { valor: e.contratoId, codigo: e.codigoContrato, clienteId: e.clienteId, nomeCliente: e.nomeCliente }]),
  )
  return [...unicos.values()].sort(
    (a, b) => a.codigo.localeCompare(b.codigo, 'pt-BR') || a.nomeCliente.localeCompare(b.nomeCliente, 'pt-BR'),
  )
}

/** As opções do filtro Responsável: os responsáveis dos escopos que o usuário vê, pelo nome. */
export function responsaveisDosEscopos(escopos: readonly EscopoDetalhado[]): { valor: string; rotulo: string }[] {
  const unicos = new Map(escopos.map((e) => [e.responsavelId, { valor: e.responsavelId, rotulo: e.nomeResponsavel }]))
  return [...unicos.values()].sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'))
}
