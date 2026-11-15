import { nomeDoCliente } from '@/lib/clientes/filtros'
import { ehPlanejamento } from '@/lib/contratos/regras'
import { hojeEmBrasilia, somarDias } from '@/lib/formato'
import { etapaAtual, progressoDaJornada } from '@/lib/jornada/regras'
import { CLIENTES } from './mock/clientes'
import { CONTRATOS } from './mock/contratos'
import { ESCOPOS, type EscopoFicticio } from './mock/escopos'
import { USUARIOS, VINCULOS } from './mock/usuarios'
import { podeVerCliente } from './regras'
import { obterUsuarioAtual } from './sessao'
import type { EscopoDetalhado, ItemQueImpede, StatusEscopo } from './tipos'

// Leitura dos Escopos Contratados e das etapas da Jornada (F05, F06), com a regra de vínculo (RN-01) pelo
// cliente do escopo. A etapa atual e o progresso são calculados a cada leitura (RN-08, DF-28).

const FECHADOS: StatusEscopo[] = ['Concluído', 'Cancelado']

const nomeDoUsuario = (id: string) => USUARIOS.find((u) => u.id === id)?.nome ?? ''

function detalhar(e: EscopoFicticio, hoje: string): EscopoDetalhado {
  const { conclusaoPrevistaEmDias, ...escopo } = e
  const contrato = CONTRATOS.find((c) => c.id === e.contratoId)
  const cliente = CLIENTES.find((c) => c.id === e.clienteId)
  return {
    ...escopo,
    conclusaoPrevista: conclusaoPrevistaEmDias === undefined ? e.conclusaoPrevista : somarDias(hoje, conclusaoPrevistaEmDias),
    etapas: e.etapas.map((l) => ({ ...l })),
    nomeResponsavel: nomeDoUsuario(e.responsavelId),
    codigoContrato: contrato?.codigo ?? '',
    nomeCliente: cliente ? nomeDoCliente(cliente) : '',
    etapaAtual: etapaAtual(e.etapas),
    progresso: progressoDaJornada(e.etapas),
    planejamento: contrato ? ehPlanejamento(contrato.status) : false,
  }
}

async function lerEscopos(filtro: (e: EscopoFicticio) => boolean): Promise<EscopoDetalhado[]> {
  const usuario = await obterUsuarioAtual()
  const hoje = hojeEmBrasilia(new Date())
  return ESCOPOS.filter((e) => filtro(e) && podeVerCliente(usuario, e.clienteId, VINCULOS)).map((e) => detalhar(e, hoje))
}

/** Os escopos do contrato, na ordem do cadastro. Vazia se o usuário não pode ver o cliente. */
export async function listarEscoposDoContrato(contratoId: string): Promise<EscopoDetalhado[]> {
  return lerEscopos((e) => e.contratoId === contratoId)
}

/** Os escopos abertos do contrato, que impedem encerrá-lo ou cancelá-lo (RN-18, CA-18.3). */
export async function escoposQueImpedemFechar(contratoId: string): Promise<ItemQueImpede[]> {
  const escopos = await listarEscoposDoContrato(contratoId)
  return escopos
    .filter((e) => !FECHADOS.includes(e.status))
    .map((e) => ({ tipo: 'Escopo', descricao: e.nome, status: e.status, responsavel: e.nomeResponsavel, href: `/escopos/${e.id}` }))
}
