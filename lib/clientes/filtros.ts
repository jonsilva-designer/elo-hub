import type { Cliente, StatusCliente } from '@/lib/dados/tipos'
import { normalizarBusca } from '@/lib/texto'

// Busca e filtros da lista de clientes (F16, CA-16.1, CA-16.2). A tela e a exportação usam as mesmas
// funções, e os filtros vão para o endereço, para a volta da página do cliente encontrar a lista igual.

export type FiltrosClientes = { busca: string; status: StatusCliente[]; segmento: string | null }

/** Onde a lista guarda os filtros na aba do navegador (sessionStorage), para o caminho de volta. */
export const CHAVE_FILTROS_DA_LISTA = 'elo:filtros-clientes'

const STATUS_DO_FILTRO: readonly StatusCliente[] = ['Prospect', 'Ativo', 'Inativo']

/** Sem escolha, a lista mostra Prospect e Ativo: o inativo só aparece com o filtro (CA-18.2). */
const STATUS_PADRAO: readonly StatusCliente[] = ['Prospect', 'Ativo']

/** O nome mostrado: o nome fantasia ou, sem ele, a razão social. */
export function nomeDoCliente(cliente: Cliente): string {
  return cliente.nomeFantasia?.trim() || cliente.razaoSocial
}

/** Os parâmetros da busca de uma página do Next. De um parâmetro repetido, vale o primeiro valor. */
export function paramsDaBusca(busca: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams()
  for (const [chave, valor] of Object.entries(busca)) {
    const primeiro = Array.isArray(valor) ? valor[0] : valor
    if (primeiro !== undefined) params.set(chave, primeiro)
  }
  return params
}

/** Os filtros do endereço. Status e segmento desconhecidos são ignorados. */
export function lerFiltros(params: URLSearchParams, segmentos: readonly string[]): FiltrosClientes {
  const status = (params.get('status') ?? '')
    .split(',')
    .filter((s): s is StatusCliente => (STATUS_DO_FILTRO as readonly string[]).includes(s))
  const segmento = params.get('segmento')
  return {
    busca: params.get('busca') ?? '',
    status: [...new Set(status)],
    segmento: segmento && segmentos.includes(segmento) ? segmento : null,
  }
}

/** O texto do endereço, sem `?`. Só o que difere do padrão; vazio quando não há filtro. */
export function escreverFiltros(filtros: FiltrosClientes): string {
  const params = new URLSearchParams()
  if (filtros.busca.trim()) params.set('busca', filtros.busca)
  if (filtros.status.length > 0) params.set('status', filtros.status.join(','))
  if (filtros.segmento) params.set('segmento', filtros.segmento)
  return params.toString().replace(/%2C/g, ',')
}

const digitos = (texto: string) => texto.replace(/\D/g, '')

/** Uma busca sem letra nem dígito ("   ", ".") conta como vazia. */
function casaComBusca(cliente: Cliente, busca: string): boolean {
  const termo = normalizarBusca(busca.trim())
  if (!/[\p{L}\p{N}]/u.test(termo)) return true
  const nomes = [cliente.nomeFantasia ?? '', cliente.razaoSocial].map(normalizarBusca)
  if (nomes.some((n) => n.includes(termo))) return true
  const numeros = digitos(termo)
  return numeros.length > 0 && digitos(cliente.cnpj).includes(numeros)
}

/** Os clientes que passam na busca e nos filtros, ordenados pelo nome mostrado. */
export function filtrarClientes(clientes: readonly Cliente[], filtros: FiltrosClientes): Cliente[] {
  const status = filtros.status.length > 0 ? filtros.status : STATUS_PADRAO
  return clientes
    .filter(
      (c) =>
        status.includes(c.status) &&
        (!filtros.segmento || c.segmento === filtros.segmento) &&
        casaComBusca(c, filtros.busca),
    )
    .sort((a, b) => nomeDoCliente(a).localeCompare(nomeDoCliente(b), 'pt-BR'))
}
