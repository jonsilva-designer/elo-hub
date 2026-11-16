import { nomeDoCliente, paramsDaBusca } from '@/lib/clientes/filtros'
import { listarClientes } from '@/lib/dados/clientes'
import { listarEscopos } from '@/lib/dados/escopos'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { contratosDosEscopos, lerFiltrosEscopos, responsaveisDosEscopos } from '@/lib/escopos/filtros'
import { ListaEscopos } from './lista-escopos'

type Busca = Record<string, string | string[] | undefined>

/**
 * A parte da lista de escopos que lê a sessão e o endereço. O servidor manda os escopos já recortados pelo vínculo
 * (RN-01), com a etapa atual e o progresso calculados; a busca e os filtros respondem no navegador.
 */
export async function ConteudoEscopos({ searchParams }: { searchParams: Promise<Busca> }) {
  const usuario = await obterUsuarioAtual()
  const [escopos, clientes, busca] = await Promise.all([listarEscopos(), listarClientes(), searchParams])
  // O filtro de cliente oferece os clientes que o usuário vê, menos o cadastro da ELO, que não tem escopos (DF-40).
  const opcoesDeCliente = clientes
    .filter((c) => !c.ehCadastroElo)
    .map((c) => ({ valor: c.id, rotulo: nomeDoCliente(c) }))
    .sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'))
  return (
    <ListaEscopos
      escopos={escopos}
      clientes={opcoesDeCliente}
      filtrosIniciais={lerFiltrosEscopos(paramsDaBusca(busca), {
        clientes: opcoesDeCliente.map((c) => c.valor),
        contratos: contratosDosEscopos(escopos).map((c) => c.valor),
        responsaveis: responsaveisDosEscopos(escopos).map((r) => r.valor),
      })}
      semVinculo={!ehAdmin(usuario) && opcoesDeCliente.length === 0}
    />
  )
}
