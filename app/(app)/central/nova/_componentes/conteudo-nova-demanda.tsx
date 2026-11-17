import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { listarContratos } from '@/lib/dados/contratos'
import { clientesParaNovaDemanda, responsaveisParaTriagem } from '@/lib/dados/demandas'
import { listarEscopos } from '@/lib/dados/escopos'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { VoltarParaCentral } from '../../_componentes/voltar-para-central'
import { FormularioNovaDemanda, type ClienteDaNovaDemanda } from './formulario-nova-demanda'

/**
 * Nova demanda (parte 5, 5.9), para os dois perfis. Os clientes vêm só com o nome (DF-39); os contratos e escopos, só
 * dos clientes que o usuário vê (RN-01); os responsáveis pela triagem de cada cliente vêm da leitura privilegiada,
 * só com o nome (arquitetura 3.1).
 */
export async function ConteudoNovaDemanda() {
  const usuario = await obterUsuarioAtual()
  const [clientes, contratos, escopos] = await Promise.all([clientesParaNovaDemanda(), listarContratos(), listarEscopos()])
  const comDetalhes: ClienteDaNovaDemanda[] = await Promise.all(
    clientes.map(async (c) => ({
      ...c,
      responsaveis: (await responsaveisParaTriagem(c.id)).map((r) => ({ valor: r.id, rotulo: r.nome })),
      contratos: c.visivel
        ? contratos.filter((k) => k.clienteId === c.id).map((k) => ({ valor: k.id, rotulo: `${k.codigo} · ${k.contratante}` }))
        : [],
      escopos: c.visivel
        ? escopos.filter((e) => e.clienteId === c.id).map((e) => ({ valor: e.id, rotulo: e.nome, contratoId: e.contratoId }))
        : [],
    })),
  )
  return (
    <>
      <div className="mb-3">
        <VoltarParaCentral />
      </div>
      <CabecalhoPagina titulo="Nova demanda" />
      <FormularioNovaDemanda clientes={comDetalhes} usuarioId={usuario.id} />
    </>
  )
}
