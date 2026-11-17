import { atividadeFechada, resumoDasAtividades } from '@/lib/atividades/regras'
import { planoFechado } from '@/lib/planos/regras'
import { somarDias } from '@/lib/formato'
import { atividadesDoPlanoSemSessao } from './atividades'
import { listarContratos } from './contratos'
import { listarEscopos } from './escopos'
import { hojeDaRequisicao } from './hoje'
import { AVALIACOES } from './mock/avaliacoes'
import { PLANOS, type PlanoFicticio } from './mock/planos'
import { USUARIOS } from './mock/usuarios'
import { obterDiasProximoDoPrazo } from './parametros'
import type { ContratoDetalhado, EscopoDetalhado, ItemQueImpede, PlanoDetalhado } from './tipos'

// Leitura dos planos de ação (F07). O plano é visto por quem vê o escopo dele: as leituras de escopos e contratos já
// aplicam a regra de vínculo (RN-01). O resumo das atividades é calculado com a data de hoje (CA-07.2).

const nomeDoUsuario = (id: string) => USUARIOS.find((u) => u.id === id)?.nome ?? ''

/** O término que conta para a RN-21: o contrato precisa ter vigência e não ser por prazo indeterminado. */
const terminoParaAviso = (c: ContratoDetalhado | undefined) =>
  c && c.vigencia !== null && c.tipoVigencia !== 'Prazo indeterminado' ? c.termino : null

function detalhar(
  p: PlanoFicticio,
  escopo: EscopoDetalhado,
  contrato: ContratoDetalhado | undefined,
  hoje: string,
  dias: number,
): PlanoDetalhado {
  const { prazoEmDias, ...plano } = p
  const avaliacao = AVALIACOES.find((a) => a.id === p.avaliacaoId)
  return {
    ...plano,
    prazo: prazoEmDias === undefined ? p.prazo : somarDias(hoje, prazoEmDias),
    nomeResponsavel: nomeDoUsuario(p.responsavelId),
    nomeEscopo: escopo.nome,
    statusEscopo: escopo.status,
    contratoId: escopo.contratoId,
    codigoContrato: escopo.codigoContrato,
    nomeCliente: escopo.nomeCliente,
    planejamento: escopo.planejamento,
    avaliacao: avaliacao ? { id: avaliacao.id, data: avaliacao.data, status: avaliacao.status } : null,
    terminoDoContrato: terminoParaAviso(contrato),
    resumo: resumoDasAtividades(atividadesDoPlanoSemSessao(p.id, hoje), hoje, dias),
  }
}

async function lerPlanos(filtro: (p: PlanoFicticio) => boolean): Promise<PlanoDetalhado[]> {
  const [escopos, contratos, hoje, dias] = await Promise.all([
    listarEscopos(),
    listarContratos(),
    hojeDaRequisicao(),
    obterDiasProximoDoPrazo(),
  ])
  return PLANOS.filter(filtro).flatMap((p) => {
    const escopo = escopos.find((e) => e.id === p.escopoId)
    if (!escopo) return []
    return [detalhar(p, escopo, contratos.find((c) => c.id === escopo.contratoId), hoje, dias)]
  })
}

/** Os planos do escopo, na ordem do cadastro. Vazia se o usuário não pode ver o cliente. */
export async function listarPlanosDoEscopo(escopoId: string): Promise<PlanoDetalhado[]> {
  return lerPlanos((p) => p.escopoId === escopoId)
}

/** Os planos ligados à avaliação de maturidade (DF-80, CA-20.7). Vazia fora do vínculo. */
export async function listarPlanosDaAvaliacao(avaliacaoId: string): Promise<PlanoDetalhado[]> {
  return lerPlanos((p) => p.avaliacaoId === avaliacaoId)
}

/** O plano, ou null se não existe ou está fora do vínculo (sem dizer qual dos dois). */
export async function obterPlano(id: string): Promise<PlanoDetalhado | null> {
  const [plano] = await lerPlanos((p) => p.id === id)
  return plano ?? null
}

/** As atividades abertas do plano, que impedem concluí-lo ou cancelá-lo (RN-18, CA-18.3). */
export async function atividadesQueImpedemFechar(planoId: string): Promise<ItemQueImpede[]> {
  const plano = await obterPlano(planoId)
  if (!plano) return []
  const hoje = await hojeDaRequisicao()
  return atividadesDoPlanoSemSessao(planoId, hoje)
    .filter((a) => !atividadeFechada(a.status))
    .map((a) => ({
      tipo: 'Atividade',
      descricao: a.nome,
      status: a.status,
      responsavel: nomeDoUsuario(a.responsavelId),
      href: `/planos/${planoId}`,
    }))
}

/** Os planos abertos do escopo, que impedem concluí-lo ou cancelá-lo (RN-18). */
export async function planosQueImpedemFechar(escopoId: string): Promise<ItemQueImpede[]> {
  const planos = await listarPlanosDoEscopo(escopoId)
  return planos
    .filter((p) => !planoFechado(p.status))
    .map((p) => ({ tipo: 'Plano de ação', descricao: p.nome, status: p.status, responsavel: p.nomeResponsavel, href: `/planos/${p.id}` }))
}
