import { paramsDaBusca } from '@/lib/clientes/filtros'
import { listarEspecialistas } from '@/lib/dados/especialistas'
import { listarEspecialidades } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { lerFiltrosEspecialistas } from '@/lib/especialistas/filtros'
import { ListaEspecialistas } from './lista-especialistas'

type Busca = Record<string, string | string[] | undefined>

/**
 * A parte da lista de especialistas que lê a sessão e o endereço. Todos os usuários logados leem os especialistas
 * (DF-02); a busca e os filtros respondem no navegador.
 */
export async function ConteudoEspecialistas({ searchParams }: { searchParams: Promise<Busca> }) {
  const usuario = await obterUsuarioAtual()
  const [especialistas, especialidades, busca] = await Promise.all([
    listarEspecialistas(),
    listarEspecialidades(),
    searchParams,
  ])
  return (
    <ListaEspecialistas
      especialistas={especialistas}
      especialidades={especialidades}
      filtrosIniciais={lerFiltrosEspecialistas(paramsDaBusca(busca), { especialidades })}
      ehAdmin={ehAdmin(usuario)}
    />
  )
}
