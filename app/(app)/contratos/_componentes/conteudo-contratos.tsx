import { nomeDoCliente, paramsDaBusca } from '@/lib/clientes/filtros'
import { lerFiltrosContratos } from '@/lib/contratos/filtros'
import { listarClientes } from '@/lib/dados/clientes'
import { listarContratos } from '@/lib/dados/contratos'
import { listarContratantes, listarServicos } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { ListaContratos } from './lista-contratos'

type Busca = Record<string, string | string[] | undefined>

/**
 * A parte da lista de contratos que lê a sessão e o endereço. O servidor manda os contratos já recortados pelo
 * vínculo (RN-01), com a vigência calculada; a busca e os filtros respondem no navegador, como na lista de clientes.
 */
export async function ConteudoContratos({ searchParams }: { searchParams: Promise<Busca> }) {
  const usuario = await obterUsuarioAtual()
  const [contratos, clientes, contratantes, servicos, busca] = await Promise.all([
    listarContratos(),
    listarClientes(),
    listarContratantes(),
    listarServicos(),
    searchParams,
  ])
  // O filtro de cliente oferece os clientes que o usuário vê, menos o cadastro da ELO, que não tem contratos (DF-40).
  const opcoesDeCliente = clientes
    .filter((c) => !c.ehCadastroElo)
    .map((c) => ({ valor: c.id, rotulo: nomeDoCliente(c) }))
    .sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'))
  return (
    <ListaContratos
      contratos={contratos}
      clientes={opcoesDeCliente}
      contratantes={contratantes}
      servicos={servicos}
      filtrosIniciais={lerFiltrosContratos(paramsDaBusca(busca), {
        clientes: opcoesDeCliente.map((c) => c.valor),
        contratantes,
        servicos,
      })}
      ehAdmin={ehAdmin(usuario)}
    />
  )
}
