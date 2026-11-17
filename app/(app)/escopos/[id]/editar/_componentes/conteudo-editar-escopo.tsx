import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { listarEscoposDoCliente, obterEscopo } from '@/lib/dados/escopos'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarEspecialistasAtivos } from '@/lib/dados/especialistas'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { opcoesDeVinculo } from '@/lib/especialistas/regras'
import { ciclosAnterioresPossiveis } from '@/lib/escopos/regras'
import { FormularioEscopo } from '../../../_componentes/formulario-escopo'

/**
 * Edição do escopo (parte 3, 5.8), só do Administrador. Fora do vínculo ou com id que não existe, "não encontrado",
 * sem revelar que o escopo existe. A Equipe vinculada vê o acesso negado.
 */
export async function ConteudoEditarEscopo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [usuario, escopo] = await Promise.all([obterUsuarioAtual(), obterEscopo(id)])
  if (!escopo) notFound()

  const cabecalho = (
    <>
      <div className="mb-3">
        <LinkVoltar href={`/escopos/${escopo.id}`} rotulo={escopo.nome} />
      </div>
      <CabecalhoPagina titulo="Editar escopo" />
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

  const [responsaveis, escopos] = await Promise.all([
    listarResponsaveis(escopo.clienteId),
    listarEscoposDoCliente(escopo.clienteId),
  ])
  // Nem o próprio escopo nem os ciclos que vêm depois dele (CA-05.10).
  const possiveis = ciclosAnterioresPossiveis(escopos, escopo.id)
  return (
    <>
      {cabecalho}
      <FormularioEscopo
        especialistas={opcoesDeVinculo(await listarEspecialistasAtivos(), escopo.especialistas)}
        escopo={escopo}
        contrato={{ id: escopo.contratoId, codigo: escopo.codigoContrato, nomeCliente: escopo.nomeCliente }}
        responsaveis={responsaveis.map((u) => ({ valor: u.id, rotulo: u.nome }))}
        ciclos={escopos.filter((e) => possiveis.includes(e.id)).map((e) => ({ valor: e.id, rotulo: e.nome }))}
      />
    </>
  )
}
