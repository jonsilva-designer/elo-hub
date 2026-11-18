import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarUsuarios } from '@/lib/dados/usuarios-configuracao'
import { AbasConfiguracoes } from '../../_componentes/abas-configuracoes'
import { ListaUsuarios } from './lista-usuarios'

/** Usuários (parte 8, 4.1; F01): só o Administrador. A Equipe vê o acesso negado (CA-01.2). */
export async function ConteudoUsuarios() {
  const usuario = await obterUsuarioAtual()
  if (!ehAdmin(usuario)) {
    return (
      <>
        <CabecalhoPagina titulo="Configurações" />
        <AcessoNegado />
      </>
    )
  }
  return (
    <>
      <CabecalhoPagina titulo="Configurações" />
      <AbasConfiguracoes />
      <ListaUsuarios usuarios={await listarUsuarios()} />
    </>
  )
}
