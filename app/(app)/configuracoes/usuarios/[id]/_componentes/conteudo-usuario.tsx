import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { nomeDoCliente } from '@/lib/clientes/filtros'
import { listarClientes } from '@/lib/dados/clientes'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { itensAbertosDoUsuario, obterUsuario, responsaveisParaRedistribuir } from '@/lib/dados/usuarios-configuracao'
import { Painel } from '@/components/elo/painel'
import { Num } from '@/components/elo/num'
import { FormularioUsuario } from '../../_componentes/formulario-usuario'
import { AcoesUsuario } from './acoes-usuario'
import { ItensAbertos } from './itens-abertos'

/**
 * O usuário (parte 8, 4.1; F01): os dados e os vínculos, editáveis pelo Administrador. A Equipe vê o acesso negado
 * (CA-01.2); o id que não existe dá "não encontrado".
 */
export async function ConteudoUsuario({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const atual = await obterUsuarioAtual()
  if (!ehAdmin(atual)) {
    return (
      <>
        <CabecalhoPagina titulo="Usuário" />
        <AcessoNegado />
      </>
    )
  }
  const usuario = await obterUsuario(id)
  if (!usuario) notFound()
  const [todos, itens] = await Promise.all([listarClientes(), itensAbertosDoUsuario(usuario.id)])
  const clientes = todos.filter((c) => !c.ehCadastroElo)
  // Quem pode receber os itens de cada cliente (RN-19): a tela cruza os clientes dos itens escolhidos.
  const idsDosClientes = [...new Set(itens.map((i) => i.clienteId))]
  const candidatos = Object.fromEntries(
    await Promise.all(
      idsDosClientes.map(async (c) => [c, (await responsaveisParaRedistribuir(usuario.id, [c])).map((u) => ({ id: u.id, nome: u.nome }))]),
    ),
  )

  return (
    <>
      <div className="mb-3">
        <LinkVoltar href="/configuracoes/usuarios" rotulo="Usuários" />
      </div>
      <CabecalhoPagina
        titulo={usuario.nome}
        contexto={
          <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span>{usuario.perfil}</span>
            <span aria-hidden="true">·</span>
            <EtiquetaStatus status={usuario.status} />
          </span>
        }
        acoes={<AcoesUsuario usuarioId={usuario.id} status={usuario.status} />}
      />
      <div className="space-y-5">
        <FormularioUsuario usuario={usuario} clientes={clientes.map((c) => ({ valor: c.id, rotulo: nomeDoCliente(c) }))} />
        {itens.length > 0 ? (
          <Painel titulo="Itens abertos" contagem={<Num>{itens.length}</Num>}>
            <ItensAbertos usuarioId={usuario.id} itens={itens} candidatos={candidatos} />
          </Painel>
        ) : null}
      </div>
    </>
  )
}
