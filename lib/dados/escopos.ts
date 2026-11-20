import { nomeDoCliente } from '@/lib/clientes/filtros'
import { ehPlanejamento } from '@/lib/contratos/regras'
import { escopoFechado, jornadaMexida } from '@/lib/escopos/regras'
import { somarDias } from '@/lib/formato'
import { etapaAtual, progressoDaJornada } from '@/lib/jornada/regras'
import { CLIENTES } from './mock/clientes'
import { CONTRATOS } from './mock/contratos'
import { ESCOPOS, type EscopoFicticio } from './mock/escopos'
import { ESPECIALISTAS } from './mock/especialistas'
import { PLANOS } from './mock/planos'
import { USUARIOS, VINCULOS } from './mock/usuarios'
import { podeVerCliente } from './regras'
import { temDemandaLigada } from './demandas'
import { temDocumentoLigado } from './documentos'
import { hojeDaRequisicao } from './hoje'
import { obterUsuarioAtual } from './sessao'
import type { EscopoDetalhado, ItemQueImpede } from './tipos'

// Leitura dos Escopos Contratados e das etapas da Jornada (F05, F06), com a regra de vínculo (RN-01) pelo
// cliente do escopo. A etapa atual e o progresso são calculados a cada leitura (RN-08, DF-28).

const nomeDoUsuario = (id: string | null) => (id ? (USUARIOS.find((u) => u.id === id)?.nome ?? '') : '')

/** O id e o nome do escopo, para ligar os ciclos do contrato recorrente (DF-46). */
const ciclo = (e: EscopoFicticio | undefined) => (e ? { id: e.id, nome: e.nome } : null)

function detalhar(e: EscopoFicticio, hoje: string): EscopoDetalhado {
  const { conclusaoPrevistaEmDias, ...escopo } = e
  const contrato = CONTRATOS.find((c) => c.id === e.contratoId)
  const cliente = CLIENTES.find((c) => c.id === e.clienteId)
  return {
    ...escopo,
    especialistaIds: [...e.especialistaIds],
    conclusaoPrevista: conclusaoPrevistaEmDias === undefined ? e.conclusaoPrevista : somarDias(hoje, conclusaoPrevistaEmDias),
    etapas: e.etapas.map((l) => ({ ...l, nomeResponsavel: nomeDoUsuario(l.responsavelId) })),
    nomeResponsavel: nomeDoUsuario(e.responsavelId),
    codigoContrato: contrato?.codigo ?? '',
    statusContrato: contrato?.status ?? 'Proposta',
    nomeCliente: cliente ? nomeDoCliente(cliente) : '',
    nomeClassificadoPor: nomeDoUsuario(e.classificadoPorId),
    etapaAtual: etapaAtual(e.etapas),
    progresso: progressoDaJornada(e.etapas),
    planejamento: contrato ? ehPlanejamento(contrato.status) : false,
    cicloAnterior: ciclo(ESCOPOS.find((outro) => outro.id === e.cicloAnteriorId)),
    cicloSeguinte: ciclo(ESCOPOS.find((outro) => outro.cicloAnteriorId === e.id)),
    especialistas: e.especialistaIds.flatMap((id) => {
      const x = ESPECIALISTAS.find((esp) => esp.id === id)
      return x ? [{ id: x.id, nome: x.nome, especialidade: x.especialidade, status: x.status }] : []
    }),
  }
}

async function lerEscopos(filtro: (e: EscopoFicticio) => boolean): Promise<EscopoDetalhado[]> {
  const usuario = await obterUsuarioAtual()
  const hoje = await hojeDaRequisicao()
  return ESCOPOS.filter((e) => filtro(e) && podeVerCliente(usuario, e.clienteId, VINCULOS)).map((e) => detalhar(e, hoje))
}

/** Os escopos que o usuário vê, na ordem do cadastro (RN-01). */
export async function listarEscopos(): Promise<EscopoDetalhado[]> {
  return lerEscopos(() => true)
}

/** Os escopos do cliente, na ordem do cadastro. Vazia se o usuário não pode ver o cliente. */
export async function listarEscoposDoCliente(clienteId: string): Promise<EscopoDetalhado[]> {
  return lerEscopos((e) => e.clienteId === clienteId)
}

/** Os escopos do contrato, na ordem do cadastro. Vazia se o usuário não pode ver o cliente. */
export async function listarEscoposDoContrato(contratoId: string): Promise<EscopoDetalhado[]> {
  return lerEscopos((e) => e.contratoId === contratoId)
}

/** O escopo, ou null se não existe ou o usuário não pode ver o cliente (sem dizer qual dos dois). */
export async function obterEscopo(id: string): Promise<EscopoDetalhado | null> {
  const [escopo] = await lerEscopos((e) => e.id === id)
  return escopo ?? null
}

/** Os escopos abertos do contrato, que impedem encerrá-lo ou cancelá-lo (RN-18, CA-18.3). */
export async function escoposQueImpedemFechar(contratoId: string): Promise<ItemQueImpede[]> {
  const escopos = await listarEscoposDoContrato(contratoId)
  return escopos
    .filter((e) => !escopoFechado(e.status))
    .map((e) => ({ tipo: 'Escopo', descricao: e.nome, status: e.status, responsavel: e.nomeResponsavel, href: `/escopos/${e.id}` }))
}

/** As etapas Em andamento do escopo, que impedem concluí-lo ou cancelá-lo (DF-59). */
export async function etapasQueImpedemFechar(escopoId: string): Promise<ItemQueImpede[]> {
  const escopo = await obterEscopo(escopoId)
  if (!escopo) return []
  return escopo.etapas
    .filter((l) => l.status === 'Em andamento')
    .map((l) => ({
      tipo: 'Etapa da Jornada',
      descricao: l.etapa,
      status: l.status,
      responsavel: l.nomeResponsavel,
      href: `/escopos/${escopo.id}`,
    }))
}

/**
 * O escopo tem itens ligados e não pode ser excluído (RN-13, DF-33): a Jornada mexida ou um plano de ação (parte 4).
 * As 5 etapas criadas com o escopo não contam enquanto ninguém mexeu nelas. Fora do vínculo, falso.
 */
export async function escopoTemItensLigados(id: string): Promise<boolean> {
  const escopo = await obterEscopo(id)
  if (!escopo) return false
  return (
    jornadaMexida(escopo.etapas) ||
    ESCOPOS.some((e) => e.cicloAnteriorId === id) ||
    PLANOS.some((p) => p.escopoId === id) ||
    (await temDemandaLigada({ escopoId: id })) ||
    (await temDocumentoLigado({ escopoId: id }))
  )
}
