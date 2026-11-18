import type { DocumentoDetalhado, StatusDocumento } from '@/lib/dados/tipos'
import { normalizarBusca } from '@/lib/texto'
import { STATUS_DOCUMENTO } from './regras'

// Busca e filtros da lista de documentos (parte 6, 4.4; F16, CA-16.2). Os filtros vão para o endereço, para a volta
// da página do documento encontrar a lista igual. O inativo é um sinal à parte do status (RN-24): fica fora da
// lista padrão e volta com o filtro "Inativo" (CA-18.2).

/** O que o filtro de status oferece: os três status e o sinal Inativo. */
export type SituacaoDocumento = StatusDocumento | 'Inativo'

export const SITUACOES_DO_FILTRO: SituacaoDocumento[] = [...STATUS_DOCUMENTO, 'Inativo']

/** O valor do filtro de cliente para o Documento do Especialista sem cliente (DF-65). */
export const SEM_CLIENTE = 'sem-cliente'

export type FiltrosDocumentos = { busca: string; cliente: string | null; categoria: string | null; status: SituacaoDocumento[] }

/** Onde a lista guarda os filtros na aba do navegador (sessionStorage), para o caminho de volta. */
export const CHAVE_FILTROS_DOS_DOCUMENTOS = 'elo:filtros-documentos'

type Opcao = { valor: string; rotulo: string }

/** Os clientes dos documentos que o usuário vê, pelo nome, e "Sem cliente" por último, quando há. */
export function opcoesDosDocumentos(documentos: readonly DocumentoDetalhado[]): { clientes: Opcao[] } {
  const clientes = [
    ...new Map(
      documentos.filter((d) => d.clienteId && d.nomeCliente).map((d) => [d.clienteId!, { valor: d.clienteId!, rotulo: d.nomeCliente! }]),
    ).values(),
  ].sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'))
  const semCliente = documentos.some((d) => d.clienteId === null) ? [{ valor: SEM_CLIENTE, rotulo: 'Sem cliente' }] : []
  return { clientes: [...clientes, ...semCliente] }
}

const umDe = (texto: string | null, permitidos: readonly string[]) => (texto && permitidos.includes(texto) ? texto : null)

/** Os filtros do endereço. O que não está nas opções é ignorado. */
export function lerFiltrosDocumentos(
  params: URLSearchParams,
  opcoes: { clientes: string[]; categorias: string[] },
): FiltrosDocumentos {
  const status = (params.get('status') ?? '')
    .split(',')
    .filter((s): s is SituacaoDocumento => (SITUACOES_DO_FILTRO as string[]).includes(s))
  return {
    busca: params.get('busca') ?? '',
    cliente: umDe(params.get('cliente'), opcoes.clientes),
    categoria: umDe(params.get('categoria'), opcoes.categorias),
    status: [...new Set(status)],
  }
}

/** O texto do endereço, sem `?`. Só o que foi escolhido; vazio quando não há filtro. */
export function escreverFiltrosDocumentos(filtros: FiltrosDocumentos): string {
  const params = new URLSearchParams()
  if (filtros.busca.trim()) params.set('busca', filtros.busca)
  if (filtros.cliente) params.set('cliente', filtros.cliente)
  if (filtros.categoria) params.set('categoria', filtros.categoria)
  if (filtros.status.length > 0) params.set('status', filtros.status.join(','))
  return params.toString().replace(/%2C/g, ',')
}

/** Uma busca sem letra nem dígito conta como vazia. Acha pelo nome do documento e do arquivo. */
function casaComBusca(d: DocumentoDetalhado, busca: string): boolean {
  const termo = normalizarBusca(busca.trim())
  if (!/[\p{L}\p{N}]/u.test(termo)) return true
  return [d.nome, d.arquivo.nome].some((texto) => normalizarBusca(texto).includes(termo))
}

/** Sem escolha, os não inativos; com escolha, os ativos dos status escolhidos e, com Inativo, os inativos. */
function casaComStatus(d: DocumentoDetalhado, escolhidos: SituacaoDocumento[]): boolean {
  if (escolhidos.length === 0) return !d.inativo
  return d.inativo ? escolhidos.includes('Inativo') : escolhidos.includes(d.status)
}

/** Os documentos que passam na busca e nos filtros, na ordem em que chegam (do mais recente para o mais antigo). */
export function filtrarDocumentos(documentos: readonly DocumentoDetalhado[], f: FiltrosDocumentos): DocumentoDetalhado[] {
  return documentos.filter(
    (d) =>
      casaComBusca(d, f.busca) &&
      (!f.cliente || (f.cliente === SEM_CLIENTE ? d.clienteId === null : d.clienteId === f.cliente)) &&
      (!f.categoria || d.categoria === f.categoria) &&
      casaComStatus(d, f.status),
  )
}
