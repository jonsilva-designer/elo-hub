import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { listarAvaliacoesDoCliente } from '@/lib/dados/maturidade'
import { obterPlano } from '@/lib/dados/planos'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { planoFechado } from '@/lib/planos/regras'
import { FormularioPlano } from '../../../_componentes/formulario-plano'

/**
 * Edição do plano de ação (parte 4, 5.6). Fora do vínculo ou com id que não existe, "não encontrado", sem revelar que
 * o plano existe. A Equipe vinculada edita o plano aberto; no fechado, vê o acesso negado (RN-17).
 */
export async function ConteudoEditarPlano({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [usuario, plano] = await Promise.all([obterUsuarioAtual(), obterPlano(id)])
  if (!plano) notFound()

  const cabecalho = (
    <>
      <div className="mb-3">
        <LinkVoltar href={`/planos/${plano.id}`} rotulo={plano.nome} />
      </div>
      <CabecalhoPagina titulo="Editar plano" />
    </>
  )
  if (!ehAdmin(usuario) && planoFechado(plano.status)) {
    return (
      <>
        {cabecalho}
        <AcessoNegado />
      </>
    )
  }

  const [responsaveis, avaliacoes] = await Promise.all([
    listarResponsaveis(plano.clienteId),
    listarAvaliacoesDoCliente(plano.clienteId),
  ])
  return (
    <>
      {cabecalho}
      <FormularioPlano
        plano={plano}
        escopo={{ id: plano.escopoId, nome: plano.nomeEscopo, nomeCliente: plano.nomeCliente }}
        responsaveis={responsaveis.map((u) => ({ valor: u.id, rotulo: u.nome }))}
        avaliacoes={avaliacoes.map((a) => ({ id: a.id, data: a.data, status: a.status }))}
      />
    </>
  )
}
