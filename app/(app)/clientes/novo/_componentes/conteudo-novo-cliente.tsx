import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { listarSegmentos } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { FormularioCliente } from '../../_componentes/formulario-cliente'

/** Novo cliente: só o Administrador cadastra. A Equipe que abre o endereço vê o acesso negado (padrão 7). */
export async function ConteudoNovoCliente() {
  const usuario = await obterUsuarioAtual()
  return (
    <>
      <div className="mb-3">
        <LinkVoltar href="/clientes" rotulo="Clientes" />
      </div>
      <CabecalhoPagina titulo="Novo cliente" />
      {ehAdmin(usuario) ? <FormularioCliente cliente={null} segmentos={await listarSegmentos()} /> : <AcessoNegado />}
    </>
  )
}
