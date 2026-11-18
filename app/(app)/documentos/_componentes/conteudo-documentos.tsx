import { paramsDaBusca } from '@/lib/clientes/filtros'
import { listarClientes } from '@/lib/dados/clientes'
import { listarDocumentos } from '@/lib/dados/documentos'
import { listarCategoriasDeDocumento } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { lerFiltrosDocumentos, opcoesDosDocumentos } from '@/lib/documentos/filtros'
import { ListaDocumentos } from './lista-documentos'

type Busca = Record<string, string | string[] | undefined>

/**
 * A parte da lista que lê a sessão e o endereço. O servidor manda os documentos já recortados pelo acesso (RN-16,
 * DF-65), com os inativos; a busca e os filtros respondem no navegador.
 */
export async function ConteudoDocumentos({ searchParams }: { searchParams: Promise<Busca> }) {
  const usuario = await obterUsuarioAtual()
  const [documentos, clientes, categorias, busca] = await Promise.all([
    listarDocumentos(),
    listarClientes(),
    listarCategoriasDeDocumento(),
    searchParams,
  ])
  const opcoes = opcoesDosDocumentos(documentos)
  return (
    <ListaDocumentos
      documentos={documentos}
      clientes={opcoes.clientes}
      categorias={categorias}
      filtrosIniciais={lerFiltrosDocumentos(paramsDaBusca(busca), {
        clientes: opcoes.clientes.map((o) => o.valor),
        categorias,
      })}
      semVinculo={!ehAdmin(usuario) && clientes.length === 0}
    />
  )
}
