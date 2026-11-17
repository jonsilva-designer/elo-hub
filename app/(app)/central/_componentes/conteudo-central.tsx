import { paramsDaBusca } from '@/lib/clientes/filtros'
import { listarClientes } from '@/lib/dados/clientes'
import { listarDemandas } from '@/lib/dados/demandas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { lerFiltrosDemandas, opcoesDasDemandas } from '@/lib/demandas/filtros'
import { FilaDemandas } from './fila-demandas'

type Busca = Record<string, string | string[] | undefined>

/**
 * A parte da fila que lê a sessão e o endereço. O servidor manda as demandas já recortadas pelo vínculo (RN-01),
 * com a vencida calculada com hoje; a busca e os filtros respondem no navegador.
 */
export async function ConteudoCentral({ searchParams }: { searchParams: Promise<Busca> }) {
  const usuario = await obterUsuarioAtual()
  const [demandas, clientes, busca] = await Promise.all([listarDemandas(), listarClientes(), searchParams])
  const opcoes = opcoesDasDemandas(demandas)
  return (
    <FilaDemandas
      demandas={demandas}
      opcoes={opcoes}
      filtrosIniciais={lerFiltrosDemandas(paramsDaBusca(busca), {
        clientes: opcoes.clientes.map((o) => o.valor),
        contratos: opcoes.contratos.map((o) => o.valor),
        escopos: opcoes.escopos.map((o) => o.valor),
        responsaveis: opcoes.responsaveis.map((o) => o.valor),
      })}
      ehAdmin={ehAdmin(usuario)}
      semVinculo={!ehAdmin(usuario) && clientes.length === 0}
    />
  )
}
