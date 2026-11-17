import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { Num } from '@/components/elo/num'
import { obterCliente } from '@/lib/dados/clientes'
import { listarContratosDoCliente } from '@/lib/dados/contratos'
import { obterDemanda } from '@/lib/dados/demandas'
import { listarEscoposDoCliente } from '@/lib/dados/escopos'
import { listarEspecialistasAtivos } from '@/lib/dados/especialistas'
import { listarCategorias } from '@/lib/dados/listas'
import { obterReferenciasDePrazo } from '@/lib/dados/parametros'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { demandaFechada } from '@/lib/demandas/regras'
import { opcoesDeVinculo } from '@/lib/especialistas/regras'
import { FormularioDemanda } from './formulario-demanda'

/**
 * Editar a demanda (parte 5, 5.11). Fora do vínculo ou com número que não existe, "não encontrado". A Equipe
 * vinculada edita a demanda aberta; na Encerrada, vê o acesso negado (RN-17).
 */
export async function ConteudoEditarDemanda({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params
  const [usuario, demanda] = await Promise.all([obterUsuarioAtual(), obterDemanda(numero)])
  if (!demanda) notFound()

  const cabecalho = (
    <>
      <div className="mb-3">
        <LinkVoltar href={`/central/${demanda.numero}`} rotulo={<Num>{demanda.numero}</Num>} />
      </div>
      <CabecalhoPagina titulo="Editar demanda" />
    </>
  )
  if (!ehAdmin(usuario) && demandaFechada(demanda.status)) {
    return (
      <>
        {cabecalho}
        <AcessoNegado />
      </>
    )
  }

  const [cliente, contratos, escopos, categorias, responsaveis, ativos, referencias] = await Promise.all([
    obterCliente(demanda.clienteId),
    listarContratosDoCliente(demanda.clienteId),
    listarEscoposDoCliente(demanda.clienteId),
    listarCategorias(),
    listarResponsaveis(demanda.clienteId),
    listarEspecialistasAtivos(),
    obterReferenciasDePrazo(),
  ])
  return (
    <>
      {cabecalho}
      <FormularioDemanda
        demanda={demanda}
        ehCadastroElo={cliente?.ehCadastroElo === true}
        contratos={contratos.map((c) => ({ valor: c.id, rotulo: `${c.codigo} · ${c.contratante}` }))}
        escopos={escopos.map((e) => ({ valor: e.id, rotulo: e.nome, contratoId: e.contratoId }))}
        categorias={categorias}
        responsaveis={responsaveis.map((u) => ({ valor: u.id, rotulo: u.nome }))}
        especialistas={opcoesDeVinculo(ativos, demanda.especialistasLigados)}
        referencias={referencias}
      />
    </>
  )
}
