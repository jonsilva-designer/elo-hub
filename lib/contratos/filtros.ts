import type { ContratoDetalhado, StatusContrato, StatusVigencia } from '@/lib/dados/tipos'
import { normalizarBusca } from '@/lib/texto'
import { contratoFechado, STATUS_CONTRATO } from './regras'

// Busca e filtros da lista de contratos (F16, CA-03.5, CA-03.7, CA-16.1). A tela e a exportação usam as mesmas
// funções, e os filtros vão para o endereço, para a volta da página do contrato encontrar a lista igual (CA-16.2).

export type FiltrosContratos = {
  busca: string
  cliente: string | null
  contratante: string | null
  servico: string | null
  status: StatusContrato[]
  vigencia: StatusVigencia[]
}

/** Onde a lista guarda os filtros na aba do navegador (sessionStorage), para o caminho de volta. */
export const CHAVE_FILTROS_DOS_CONTRATOS = 'elo:filtros-contratos'

const STATUS_DA_VIGENCIA: readonly StatusVigencia[] = ['Vigente', 'Próximo do vencimento', 'Vencido', 'Encerrado']

/** Os itens da lista com vírgula que estão entre os permitidos, sem repetir. */
function lista<T extends string>(texto: string | null, permitidos: readonly T[]): T[] {
  const itens = (texto ?? '').split(',').filter((s): s is T => (permitidos as readonly string[]).includes(s))
  return [...new Set(itens)]
}

const umDe = (texto: string | null, permitidos: readonly string[]) => (texto && permitidos.includes(texto) ? texto : null)

/** Os filtros do endereço. O que não está nas opções é ignorado. */
export function lerFiltrosContratos(
  params: URLSearchParams,
  opcoes: { clientes: string[]; contratantes: string[]; servicos: string[] },
): FiltrosContratos {
  return {
    busca: params.get('busca') ?? '',
    cliente: umDe(params.get('cliente'), opcoes.clientes),
    contratante: umDe(params.get('contratante'), opcoes.contratantes),
    servico: umDe(params.get('servico'), opcoes.servicos),
    status: lista(params.get('status'), STATUS_CONTRATO),
    vigencia: lista(params.get('vigencia'), STATUS_DA_VIGENCIA),
  }
}

/** O texto do endereço, sem `?`. Só o que foi escolhido; vazio quando não há filtro. */
export function escreverFiltrosContratos(filtros: FiltrosContratos): string {
  const params = new URLSearchParams()
  if (filtros.busca.trim()) params.set('busca', filtros.busca)
  if (filtros.cliente) params.set('cliente', filtros.cliente)
  if (filtros.contratante) params.set('contratante', filtros.contratante)
  if (filtros.servico) params.set('servico', filtros.servico)
  if (filtros.status.length > 0) params.set('status', filtros.status.join(','))
  if (filtros.vigencia.length > 0) params.set('vigencia', filtros.vigencia.join(','))
  return params.toString().replace(/%2C/g, ',')
}

/** Uma busca sem letra nem dígito ("   ", ".") conta como vazia. Acha pelo código e pelo objeto. */
function casaComBusca(c: ContratoDetalhado, busca: string): boolean {
  const termo = normalizarBusca(busca.trim())
  if (!/[\p{L}\p{N}]/u.test(termo)) return true
  return [c.codigo, c.objeto].some((texto) => normalizarBusca(texto).includes(termo))
}

/**
 * Grupo da ordem inicial: os com término primeiro (os Vencidos ficam no começo, pelo término mais antigo);
 * depois o Prazo indeterminado; depois Proposta e Em contratação; Encerrados e Cancelados no fim.
 */
function grupo(c: ContratoDetalhado): number {
  if (contratoFechado(c.status)) return 3
  if (c.vigencia === null) return 2
  return c.termino ? 0 : 1
}

function pelaOrdemInicial(a: ContratoDetalhado, b: ContratoDetalhado): number {
  return (
    grupo(a) - grupo(b) ||
    (grupo(a) === 0 ? a.termino!.localeCompare(b.termino!) : 0) ||
    a.codigo.localeCompare(b.codigo, 'pt-BR')
  )
}

/** Os contratos que passam na busca e nos filtros, na ordem inicial da lista. */
export function filtrarContratos(contratos: readonly ContratoDetalhado[], filtros: FiltrosContratos): ContratoDetalhado[] {
  return contratos
    .filter(
      (c) =>
        casaComBusca(c, filtros.busca) &&
        (!filtros.cliente || c.clienteId === filtros.cliente) &&
        (!filtros.contratante || c.contratante === filtros.contratante) &&
        (!filtros.servico || c.servicos.includes(filtros.servico)) &&
        (filtros.status.length === 0 || filtros.status.includes(c.status)) &&
        (filtros.vigencia.length === 0 || (c.vigencia !== null && filtros.vigencia.includes(c.vigencia.status))),
    )
    .sort(pelaOrdemInicial)
}

/** Os contratos na ordem inicial da lista, sem filtro: a aba Contratos do cliente usa a mesma ordem. */
export function ordenarContratos(contratos: readonly ContratoDetalhado[]): ContratoDetalhado[] {
  return [...contratos].sort(pelaOrdemInicial)
}

/** As opções do contrato de referência da avaliação (CA-20.3): os contratos do cliente, na ordem da lista. */
export function opcoesDeContrato(
  contratos: readonly ContratoDetalhado[],
): { valor: string; codigo: string; contratante: string }[] {
  return ordenarContratos(contratos).map((c) => ({ valor: c.id, codigo: c.codigo, contratante: c.contratante }))
}
