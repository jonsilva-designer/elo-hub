import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { listarSegmentos } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { FormularioCliente } from '../../_componentes/formulario-cliente'
import { VoltarParaClientes } from '../../_componentes/voltar-para-clientes'

/** Novo cliente: só o Administrador cadastra. A Equipe que abre o endereço vê o acesso negado (padrão 7). */
export async function ConteudoNovoCliente() {
  const usuario = await obterUsuarioAtual()
  return (
    <>
      <div className="mb-3">
        <VoltarParaClientes />
      </div>
      <CabecalhoPagina titulo="Novo cliente" />
      {ehAdmin(usuario) ? <FormularioCliente cliente={null} segmentos={await listarSegmentos()} /> : <AcessoNegado />}
    </>
  )
}
