import { paramsDaBusca } from '@/lib/clientes/filtros'
import { escoposDasAtividades, lerFiltrosAtividades, responsaveisDasAtividades } from '@/lib/atividades/filtros'
import { listarAtividades } from '@/lib/dados/atividades'
import { listarClientes } from '@/lib/dados/clientes'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { ListaAtividades } from './lista-atividades'

type Busca = Record<string, string | string[] | undefined>

/**
 * A parte de Minhas atividades que lê a sessão e o endereço. O servidor manda as atividades já recortadas pelo
 * vínculo (RN-01), com a situação do prazo calculada com hoje; a busca e os filtros respondem no navegador.
 */
export async function ConteudoMinhasAtividades({ searchParams }: { searchParams: Promise<Busca> }) {
  const usuario = await obterUsuarioAtual()
  const [atividades, clientes, busca] = await Promise.all([listarAtividades(), listarClientes(), searchParams])
  // A pessoa que entrou fica nas opções mesmo sem atividade: é o filtro com que a lista abre (CA-08.4).
  const doUsuario = { valor: usuario.id, rotulo: usuario.nome }
  const outros = responsaveisDasAtividades(atividades).filter((r) => r.valor !== usuario.id)
  const responsaveis = [doUsuario, ...outros].sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'))
  const escopos = escoposDasAtividades(atividades)
  return (
    <ListaAtividades
      atividades={atividades}
      responsaveis={responsaveis}
      escopos={escopos}
      filtrosIniciais={lerFiltrosAtividades(paramsDaBusca(busca), {
        usuarioId: usuario.id,
        responsaveis: responsaveis.map((r) => r.valor),
        escopos: escopos.map((e) => e.valor),
      })}
      usuarioId={usuario.id}
      perfil={usuario.perfil}
      semVinculo={!ehAdmin(usuario) && clientes.filter((c) => !c.ehCadastroElo).length === 0}
    />
  )
}
