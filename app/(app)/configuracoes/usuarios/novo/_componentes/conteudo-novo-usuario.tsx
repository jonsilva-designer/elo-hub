import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { nomeDoCliente } from '@/lib/clientes/filtros'
import { listarClientes } from '@/lib/dados/clientes'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { FormularioUsuario } from '../../_componentes/formulario-usuario'

/** Novo usuário (parte 8, 4.1; DF-04): só o Administrador. Os clientes possíveis são todos os da carteira. */
export async function ConteudoNovoUsuario() {
  const usuario = await obterUsuarioAtual()
  const cabecalho = (
    <>
      <div className="mb-3">
        <LinkVoltar href="/configuracoes/usuarios" rotulo="Usuários" />
      </div>
      <CabecalhoPagina titulo="Novo usuário" />
    </>
  )
  if (!ehAdmin(usuario)) {
    return (
      <>
        {cabecalho}
        <AcessoNegado />
      </>
    )
  }
  const clientes = (await listarClientes()).filter((c) => !c.ehCadastroElo)
  return (
    <>
      {cabecalho}
      <FormularioUsuario usuario={null} clientes={clientes.map((c) => ({ valor: c.id, rotulo: nomeDoCliente(c) }))} />
    </>
  )
}
