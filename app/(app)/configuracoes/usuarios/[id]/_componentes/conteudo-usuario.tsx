import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { nomeDoCliente } from '@/lib/clientes/filtros'
import { listarClientes } from '@/lib/dados/clientes'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { obterUsuario } from '@/lib/dados/usuarios-configuracao'
import { FormularioUsuario } from '../../_componentes/formulario-usuario'

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
  const clientes = (await listarClientes()).filter((c) => !c.ehCadastroElo)

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
      />
      <FormularioUsuario usuario={usuario} clientes={clientes.map((c) => ({ valor: c.id, rotulo: nomeDoCliente(c) }))} />
    </>
  )
}
