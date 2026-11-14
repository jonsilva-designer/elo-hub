import { lerFiltros, paramsDaBusca } from '@/lib/clientes/filtros'
import { listarClientes } from '@/lib/dados/clientes'
import { listarSegmentos } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { ListaClientes } from './lista-clientes'

type Busca = Record<string, string | string[] | undefined>

/**
 * A parte da lista que lê a sessão e o endereço. O servidor manda os clientes já recortados pelo
 * vínculo (RN-01); a busca e os filtros respondem no navegador (decisão do Jonathan, 13/11/2026).
 */
export async function ConteudoClientes({ searchParams }: { searchParams: Promise<Busca> }) {
  const usuario = await obterUsuarioAtual()
  const [clientes, segmentos, busca] = await Promise.all([listarClientes(), listarSegmentos(), searchParams])
  return (
    <ListaClientes
      clientes={clientes}
      segmentos={segmentos}
      filtrosIniciais={lerFiltros(paramsDaBusca(busca), segmentos)}
      ehAdmin={ehAdmin(usuario)}
    />
  )
}
