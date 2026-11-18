import { nomeDoCliente } from '@/lib/clientes/filtros'
import { STATUS_DEMANDA } from '@/lib/demandas/regras'
import { maturidadeDoCliente } from '@/lib/maturidade/regras'
import { nosProximosDias, nosUltimosDias, TEXTOS } from '@/lib/visao-executiva/regras'
import { listarAtividadesDoPlano } from './atividades'
import { obterCliente } from './clientes'
import { listarContratosDoCliente } from './contratos'
import { listarDemandasDoCliente } from './demandas'
import { listarEscoposDoCliente } from './escopos'
import { hojeDaRequisicao } from './hoje'
import { listarAvaliacoesDoCliente } from './maturidade'
import { TEXTOS_EXECUTIVOS } from './mock/textos-executivos'
import { USUARIOS } from './mock/usuarios'
import { listarPlanosDoEscopo } from './planos'
import type { AvaliacaoMaturidade, AvaliacaoDaVisao, ItemDaVisao, TextoExecutivo, VisaoExecutiva } from './tipos'

// A leitura da Visão Executiva (F14; arquitetura 3.5): a tela e o PDF usam a mesma. Parte das leituras das áreas, que
// aplicam a regra de vínculo (RN-01, CA-14.4), e monta só o que pode ir para o cliente: os tipos da visão não têm o
// valor do contrato, observações internas, comentários, justificativa da criticidade nem dados de especialistas
// (DF-52, CA-14.5). O filtro por contrato vale para todos os blocos, inclusive a maturidade (CA-14.6, RN-25).

const nomeDoUsuario = (id: string) => USUARIOS.find((u) => u.id === id)?.nome ?? ''

const resumoDaAvaliacao = (a: AvaliacaoMaturidade): AvaliacaoDaVisao => ({
  data: a.data,
  maturidadeGeral: a.maturidadeGeral,
  prontidao: a.prontidao,
  dimensoes: a.dimensoes.map((d) => ({ dimensao: d.dimensao, nivel: d.nivel ?? 'Não avaliada' })),
})

/** Pela data e, na mesma data, pela descrição. */
const porData = (a: ItemDaVisao, b: ItemDaVisao) => a.data.localeCompare(b.data) || a.descricao.localeCompare(b.descricao, 'pt-BR')

/**
 * A Visão Executiva do cliente, com o filtro opcional por um contrato dele. Null fora do vínculo ou no cadastro da ELO,
 * que não tem carteira (DF-40). Contrato que não é do cliente é ignorado: a visão abre sem filtro.
 */
export async function obterVisaoExecutiva(clienteId: string, contratoId?: string | null): Promise<VisaoExecutiva | null> {
  const cliente = await obterCliente(clienteId)
  if (!cliente || cliente.ehCadastroElo) return null

  const [hoje, contratos, todosOsEscopos, todasAsDemandas, avaliacoes] = await Promise.all([
    hojeDaRequisicao(),
    listarContratosDoCliente(cliente.id),
    listarEscoposDoCliente(cliente.id),
    listarDemandasDoCliente(cliente.id),
    listarAvaliacoesDoCliente(cliente.id),
  ])
  const contrato = contratos.find((c) => c.id === contratoId) ?? null
  const doFiltro = <T extends { contratoId: string | null }>(itens: T[]) =>
    contrato ? itens.filter((i) => i.contratoId === contrato.id) : itens

  const escopos = doFiltro(todosOsEscopos).filter((e) => e.status !== 'Cancelado')
  const demandas = doFiltro(todasAsDemandas)
  const planosDosEscopos = (await Promise.all(escopos.map((e) => listarPlanosDoEscopo(e.id)))).flat()
  const atividadesDosPlanos = (await Promise.all(planosDosEscopos.map((p) => listarAtividadesDoPlano(p.id)))).flat()

  const planos = planosDosEscopos
    .filter((p) => p.status === 'Aberto' || p.status === 'Em andamento')
    .map((p) => ({
      id: p.id,
      nome: p.nome,
      escopo: p.nomeEscopo,
      status: p.status,
      total: p.resumo.total,
      concluidas: p.resumo.concluidas,
      atrasadas: p.resumo.atrasadas,
      pendentes: atividadesDosPlanos
        .filter((a) => a.planoId === p.id && (a.status === 'Não iniciada' || a.status === 'Em andamento'))
        .map((a) => ({
          id: a.id,
          nome: a.nome,
          prazo: a.prazo,
          responsavel: a.nomeResponsavel,
          executor: a.executor,
          status: a.status,
          situacao: a.situacao,
        })),
    }))

  const aberta = (status: string) => status !== 'Resolvida' && status !== 'Encerrada'
  const entregas: ItemDaVisao[] = [
    ...atividadesDosPlanos
      .filter((a) => a.status === 'Concluída' && nosUltimosDias(a.conclusao, hoje))
      .map((a) => ({ tipo: 'Atividade' as const, descricao: a.nome, data: a.conclusao! })),
    ...escopos.flatMap((e) =>
      e.etapas
        .filter((l) => l.status === 'Concluída' && nosUltimosDias(l.conclusao, hoje))
        .map((l) => ({ tipo: 'Etapa' as const, descricao: `${e.nome} · ${l.etapa}`, data: l.conclusao! })),
    ),
  ].sort(porData)

  const proximosPrazos: ItemDaVisao[] = [
    ...atividadesDosPlanos
      .filter((a) => (a.status === 'Não iniciada' || a.status === 'Em andamento') && nosProximosDias(a.prazo, hoje))
      .map((a) => ({ tipo: 'Atividade' as const, descricao: a.nome, data: a.prazo })),
    ...demandas
      .filter((d) => aberta(d.status) && nosProximosDias(d.prazo, hoje))
      .map((d) => ({ tipo: 'Demanda' as const, descricao: `${d.numero} · ${d.assunto}`, data: d.prazo! })),
    ...(contrato ? [contrato] : contratos)
      .filter((c) => (c.status === 'Ativo' || c.status === 'Suspenso') && nosProximosDias(c.termino, hoje))
      .map((c) => ({ tipo: 'Contrato' as const, descricao: c.codigo, data: c.termino! })),
  ].sort(porData)

  const pendencias: ItemDaVisao[] = [
    ...atividadesDosPlanos
      .filter((a) => a.situacao === 'Atrasada')
      .map((a) => ({ tipo: 'Atividade' as const, descricao: a.nome, data: a.prazo })),
    ...demandas
      .filter((d) => d.vencida)
      .map((d) => ({ tipo: 'Demanda' as const, descricao: `${d.numero} · ${d.assunto}`, data: d.prazo! })),
  ].sort(porData)

  // A maturidade do filtro: as avaliações com o contrato de referência escolhido (RN-25).
  const comparacao = maturidadeDoCliente(contrato ? avaliacoes.filter((a) => a.contratoId === contrato.id) : avaliacoes)

  const textos: TextoExecutivo[] = TEXTOS.map(({ campo, titulo }) => {
    const salvo = TEXTOS_EXECUTIVOS.find((t) => t.clienteId === cliente.id && t.campo === campo)
    return {
      campo,
      titulo,
      texto: salvo?.texto ?? '',
      atualizadoEm: salvo?.atualizadoEm ?? null,
      atualizadoPor: salvo ? nomeDoUsuario(salvo.atualizadoPorId) : '',
    }
  })
  const datas = textos.flatMap((t) => (t.atualizadoEm ? [t.atualizadoEm] : [])).sort()

  return {
    cliente: { id: cliente.id, nome: nomeDoCliente(cliente) },
    contrato: contrato ? { id: contrato.id, codigo: contrato.codigo } : null,
    contratos: contratos.map((c) => ({ id: c.id, codigo: c.codigo, contratante: c.contratante })),
    hoje,
    textosAtualizadosEm: datas.at(-1) ?? null,
    escopos: escopos.map((e) => ({
      id: e.id,
      nome: e.nome,
      codigoContrato: e.codigoContrato,
      contratante: contratos.find((c) => c.id === e.contratoId)?.contratante ?? '',
      status: e.status,
      prioridade: e.prioridade,
      criticidade: e.criticidade,
      planejamento: e.planejamento,
      etapaAtual: e.etapaAtual,
      etapas: e.etapas.map((l) => ({ etapa: l.etapa, status: l.status })),
    })),
    planos,
    demandas: {
      porStatus: STATUS_DEMANDA.map((status) => ({ status, total: demandas.filter((d) => d.status === status).length })),
      abertas: demandas
        .filter((d) => aberta(d.status))
        .map((d) => ({
          numero: d.numero,
          assunto: d.assunto,
          criticidade: d.criticidade,
          prazo: d.prazo,
          status: d.status,
          vencida: d.vencida,
        })),
    },
    entregas,
    proximosPrazos,
    pendencias,
    maturidade: comparacao ? { inicial: resumoDaAvaliacao(comparacao.inicial), atual: resumoDaAvaliacao(comparacao.atual) } : null,
    textos,
  }
}
