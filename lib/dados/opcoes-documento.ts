import { nomeDoCliente } from '@/lib/clientes/filtros'
import { formatarData } from '@/lib/formato'
import { listarAtividades } from './atividades'
import { listarClientes } from './clientes'
import { listarContratos } from './contratos'
import { listarDemandas } from './demandas'
import { listarEscopos } from './escopos'
import { listarEspecialistas } from './especialistas'
import { listarAvaliacoesDoCliente } from './maturidade'
import { listarPlanosDoEscopo } from './planos'

// As opções de vínculo do documento (parte 6, 4.2): os registros que o usuário vê, de cada cliente que ele vê
// (RN-01). A tela desce as opções a partir do cliente escolhido; a ação confere o que chegou contra as mesmas opções,
// então o vínculo de fora, enviado à mão, não passa (RN-02). Fica fora de documentos.ts, que as leituras de
// clientes, contratos, escopos e especialistas importam.

export type OpcoesDeVinculo = {
  clientes: { id: string; rotulo: string }[]
  contratos: { id: string; rotulo: string; clienteId: string }[]
  escopos: { id: string; rotulo: string; clienteId: string; contratoId: string }[]
  planos: { id: string; rotulo: string; escopoId: string }[]
  atividades: { id: string; rotulo: string; planoId: string }[]
  /** O id é o número da demanda. */
  demandas: { id: string; rotulo: string; clienteId: string }[]
  avaliacoes: { id: string; rotulo: string; clienteId: string }[]
  /** Todos os especialistas: todos os usuários os leem (DF-02). */
  especialistas: { id: string; rotulo: string }[]
}

export async function opcoesDeVinculoDoDocumento(): Promise<OpcoesDeVinculo> {
  const [clientes, contratos, escopos, atividades, demandas, especialistas] = await Promise.all([
    listarClientes(),
    listarContratos(),
    listarEscopos(),
    listarAtividades(),
    listarDemandas(),
    listarEspecialistas(),
  ])
  const [planos, avaliacoes] = await Promise.all([
    Promise.all(escopos.map((e) => listarPlanosDoEscopo(e.id))).then((listas) => listas.flat()),
    Promise.all(clientes.map((c) => listarAvaliacoesDoCliente(c.id))).then((listas) => listas.flat()),
  ])
  const porRotulo = (a: { rotulo: string }, b: { rotulo: string }) => a.rotulo.localeCompare(b.rotulo, 'pt-BR')
  return {
    clientes: clientes.map((c) => ({ id: c.id, rotulo: nomeDoCliente(c) })).sort(porRotulo),
    contratos: contratos.map((c) => ({ id: c.id, rotulo: `${c.codigo} · ${c.contratante}`, clienteId: c.clienteId })).sort(porRotulo),
    escopos: escopos.map((e) => ({ id: e.id, rotulo: e.nome, clienteId: e.clienteId, contratoId: e.contratoId })).sort(porRotulo),
    planos: planos.map((p) => ({ id: p.id, rotulo: p.nome, escopoId: p.escopoId })).sort(porRotulo),
    atividades: atividades.map((a) => ({ id: a.id, rotulo: a.nome, planoId: a.planoId })).sort(porRotulo),
    demandas: demandas.map((d) => ({ id: d.numero, rotulo: `${d.numero} · ${d.assunto}`, clienteId: d.clienteId })),
    avaliacoes: avaliacoes
      .sort((a, b) => b.data.localeCompare(a.data))
      .map((a) => ({ id: a.id, rotulo: `Avaliação de ${formatarData(a.data)}`, clienteId: a.clienteId })),
    especialistas: especialistas
      .map((e) => ({ id: e.id, rotulo: `${e.nome} · ${e.especialidade}${e.status === 'Ativo' ? '' : ` (${e.status})`}` }))
      .sort(porRotulo),
  }
}
