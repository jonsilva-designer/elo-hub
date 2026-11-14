import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { nomeDoCliente } from '@/lib/clientes/filtros'
import { obterCliente } from '@/lib/dados/clientes'
import { listarSegmentos } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { FormularioCliente } from '../../../_componentes/formulario-cliente'

/**
 * Edição do cliente, só do Administrador. Fora do vínculo ou com id que não existe, "não encontrado",
 * sem revelar que o cliente existe. A Equipe vinculada vê o acesso negado (parte 2, 5.1).
 */
export async function ConteudoEditarCliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [usuario, cliente] = await Promise.all([obterUsuarioAtual(), obterCliente(id)])
  if (!cliente) notFound()
  return (
    <>
      <div className="mb-3">
        <LinkVoltar href={`/clientes/${cliente.id}`} rotulo={nomeDoCliente(cliente)} />
      </div>
      <CabecalhoPagina titulo="Editar cliente" />
      {ehAdmin(usuario) ? <FormularioCliente cliente={cliente} segmentos={await listarSegmentos()} /> : <AcessoNegado />}
    </>
  )
}
