import type { DemandaDetalhada, StatusDemanda } from '@/lib/dados/tipos'
import type { Criticidade } from '@/lib/design/status'
import { CRITICIDADES } from '@/lib/escopos/regras'
import { dataValida } from '@/lib/escopos/validacao'
import { normalizarBusca } from '@/lib/texto'
import { demandaFechada, STATUS_DEMANDA } from './regras'

// Ordem e filtros da fila de demandas (parte 5, 5.8; CA-09.7). A fila, a aba do cliente, o painel do escopo e a
// exportação usam a mesma ordem; a fila e a exportação, os mesmos filtros. Os filtros vão para o endereço (CA-16.2).

export type FiltrosDemandas = {
  busca: string
  cliente: string | null
  contrato: string | null
  escopo: string | null
  /** O responsável pela triagem ou pelo atendimento. */
  responsavel: string | null
  status: StatusDemanda[]
  criticidade: Criticidade[]
  /** O período da abertura, inclusive, em AAAA-MM-DD. */
  de: string | null
  ate: string | null
}

/** Onde a fila guarda os filtros na aba do navegador (sessionStorage), para o caminho de volta. */
export const CHAVE_FILTROS_DAS_DEMANDAS = 'elo:filtros-demandas'

/**
 * A ordem inicial: as abertas antes das Encerradas; em cada grupo, das mais críticas para as menos (sem criticidade
 * por último) e pela abertura, da mais antiga para a mais recente; por fim, o número.
 */
export function ordenarDemandas(demandas: readonly DemandaDetalhada[]): DemandaDetalhada[] {
  const peso = (d: DemandaDetalhada) => (d.criticidade ? CRITICIDADES.indexOf(d.criticidade) : -1)
  return [...demandas].sort(
    (a, b) =>
      Number(demandaFechada(a.status)) - Number(demandaFechada(b.status)) ||
      peso(b) - peso(a) ||
      a.abertaEm.localeCompare(b.abertaEm) ||
      a.numero.localeCompare(b.numero),
  )
}

type Opcao = { valor: string; rotulo: string }

const unicos = (opcoes: Opcao[]) =>
  [...new Map(opcoes.map((o) => [o.valor, o])).values()].sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'))

/** As opções dos filtros: os clientes, contratos, escopos e responsáveis das demandas que o usuário vê. */
export function opcoesDasDemandas(demandas: readonly DemandaDetalhada[]): {
  clientes: Opcao[]
  contratos: (Opcao & { clienteId: string })[]
  escopos: (Opcao & { contratoId: string | null; clienteId: string })[]
  responsaveis: Opcao[]
} {
  return {
    clientes: unicos(demandas.map((d) => ({ valor: d.clienteId, rotulo: d.nomeCliente }))),
    contratos: [
      ...new Map(
        demandas
          .filter((d) => d.contratoId && d.codigoContrato)
          .map((d) => [d.contratoId!, { valor: d.contratoId!, rotulo: `${d.codigoContrato} · ${d.nomeCliente}`, clienteId: d.clienteId }]),
      ).values(),
    ].sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR')),
    escopos: [
      ...new Map(
        demandas
          .filter((d) => d.escopoId && d.nomeEscopo)
          .map((d) => [
            d.escopoId!,
            { valor: d.escopoId!, rotulo: `${d.nomeEscopo} · ${d.nomeCliente}`, contratoId: d.contratoId, clienteId: d.clienteId },
          ]),
      ).values(),
    ].sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR')),
    responsaveis: unicos(
      demandas.flatMap((d) => [
        { valor: d.responsavelTriagemId, rotulo: d.nomeTriagem },
        ...(d.responsavelAtendimentoId ? [{ valor: d.responsavelAtendimentoId, rotulo: d.nomeAtendimento }] : []),
      ]),
    ),
  }
}

function lista<T extends string>(texto: string | null, permitidos: readonly T[]): T[] {
  const itens = (texto ?? '').split(',').filter((s): s is T => (permitidos as readonly string[]).includes(s))
  return [...new Set(itens)]
}

const umDe = (texto: string | null, permitidos: readonly string[]) => (texto && permitidos.includes(texto) ? texto : null)

const data = (texto: string | null) => (texto && dataValida(texto) ? texto : null)

/** Os filtros do endereço. O que não está nas opções, ou a data que não existe, é ignorado. */
export function lerFiltrosDemandas(
  params: URLSearchParams,
  opcoes: { clientes: string[]; contratos: string[]; escopos: string[]; responsaveis: string[] },
): FiltrosDemandas {
  return {
    busca: params.get('busca') ?? '',
    cliente: umDe(params.get('cliente'), opcoes.clientes),
    contrato: umDe(params.get('contrato'), opcoes.contratos),
    escopo: umDe(params.get('escopo'), opcoes.escopos),
    responsavel: umDe(params.get('responsavel'), opcoes.responsaveis),
    status: lista(params.get('status'), STATUS_DEMANDA),
    criticidade: lista(params.get('criticidade'), CRITICIDADES),
    de: data(params.get('de')),
    ate: data(params.get('ate')),
  }
}

/** O texto do endereço, sem `?`. Só o que foi escolhido; vazio quando não há filtro. */
export function escreverFiltrosDemandas(filtros: FiltrosDemandas): string {
  const params = new URLSearchParams()
  if (filtros.busca.trim()) params.set('busca', filtros.busca)
  for (const campo of ['cliente', 'contrato', 'escopo', 'responsavel'] as const) {
    if (filtros[campo]) params.set(campo, filtros[campo]!)
  }
  if (filtros.status.length > 0) params.set('status', filtros.status.join(','))
  if (filtros.criticidade.length > 0) params.set('criticidade', filtros.criticidade.join(','))
  if (filtros.de) params.set('de', filtros.de)
  if (filtros.ate) params.set('ate', filtros.ate)
  return params.toString().replace(/%2C/g, ',')
}

/** Uma busca sem letra nem dígito conta como vazia. Acha pelo número e pelo assunto, sem acento nem maiúsculas. */
function casaComBusca(d: DemandaDetalhada, busca: string): boolean {
  const termo = normalizarBusca(busca.trim())
  if (!/[\p{L}\p{N}]/u.test(termo)) return true
  return [d.numero, d.assunto].some((texto) => normalizarBusca(texto).includes(termo))
}

/** As demandas que passam na busca e nos filtros, na ordem inicial da fila. */
export function filtrarDemandas(demandas: readonly DemandaDetalhada[], f: FiltrosDemandas): DemandaDetalhada[] {
  return ordenarDemandas(
    demandas.filter(
      (d) =>
        casaComBusca(d, f.busca) &&
        (!f.cliente || d.clienteId === f.cliente) &&
        (!f.contrato || d.contratoId === f.contrato) &&
        (!f.escopo || d.escopoId === f.escopo) &&
        (!f.responsavel || d.responsavelTriagemId === f.responsavel || d.responsavelAtendimentoId === f.responsavel) &&
        (f.status.length === 0 || f.status.includes(d.status)) &&
        (f.criticidade.length === 0 || (d.criticidade !== null && f.criticidade.includes(d.criticidade))) &&
        (!f.de || d.abertaEm >= f.de) &&
        (!f.ate || d.abertaEm <= f.ate),
    ),
  )
}
