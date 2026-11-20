import { nomeDoCliente } from '@/lib/clientes/filtros'
import { demandaFechada, demandaVencida, proximoNumero } from '@/lib/demandas/regras'
import { somarDias } from '@/lib/formato'
import { hojeDaRequisicao } from './hoje'
import { CLIENTES } from './mock/clientes'
import { CONTRATOS } from './mock/contratos'
import { COMENTARIOS, DEMANDAS, type DemandaFicticia } from './mock/demandas'
import { ESCOPOS } from './mock/escopos'
import { ESPECIALISTAS } from './mock/especialistas'
import { USUARIOS, VINCULOS } from './mock/usuarios'
import { ehAdmin, podeVerCliente, temVinculo } from './regras'
import { obterUsuarioAtual } from './sessao'
import type { ComentarioDetalhado, DemandaDetalhada, ItemQueImpede } from './tipos'

// Leitura das demandas da Central ELO (F09), com a regra de vínculo (RN-01) pelo cliente da demanda. A demanda que a
// Equipe registra para cliente fora dos vínculos some para ela depois de salvar (CA-09.9). As funções do registro
// (clientes e responsáveis pela triagem) são a operação privilegiada da arquitetura (3.1): devolvem só nomes.

const nomeDoUsuario = (id: string | null) => (id ? (USUARIOS.find((u) => u.id === id)?.nome ?? '') : '')

function detalhar(d: DemandaFicticia, hoje: string): DemandaDetalhada {
  const { prazoEmDias, ...demanda } = d
  const prazo = prazoEmDias === undefined ? d.prazo : somarDias(hoje, prazoEmDias)
  const cliente = CLIENTES.find((c) => c.id === d.clienteId)
  return {
    ...demanda,
    especialistas: d.especialistas.map((e) => ({ ...e })),
    prazo,
    nomeCliente: cliente ? nomeDoCliente(cliente) : '',
    codigoContrato: CONTRATOS.find((c) => c.id === d.contratoId)?.codigo ?? null,
    nomeEscopo: ESCOPOS.find((e) => e.id === d.escopoId)?.nome ?? null,
    nomeTriagem: nomeDoUsuario(d.responsavelTriagemId),
    nomeAtendimento: nomeDoUsuario(d.responsavelAtendimentoId),
    nomeRegistradaPor: nomeDoUsuario(d.registradaPorId),
    especialistasLigados: d.especialistas.flatMap((v) => {
      const e = ESPECIALISTAS.find((x) => x.id === v.id)
      return e ? [{ id: e.id, nome: e.nome, especialidade: e.especialidade, status: e.status, principal: v.principal }] : []
    }),
    vencida: demandaVencida({ prazo, status: d.status }, hoje),
  }
}

async function lerDemandas(filtro: (d: DemandaFicticia) => boolean): Promise<DemandaDetalhada[]> {
  const usuario = await obterUsuarioAtual()
  const hoje = await hojeDaRequisicao()
  return DEMANDAS.filter((d) => filtro(d) && podeVerCliente(usuario, d.clienteId, VINCULOS)).map((d) => detalhar(d, hoje))
}

/** As demandas que o usuário vê, na ordem do registro (RN-01). */
export async function listarDemandas(): Promise<DemandaDetalhada[]> {
  return lerDemandas(() => true)
}

/** As demandas do cliente. Vazia se o usuário não pode ver o cliente. */
export async function listarDemandasDoCliente(clienteId: string): Promise<DemandaDetalhada[]> {
  return lerDemandas((d) => d.clienteId === clienteId)
}

/** As demandas ligadas ao escopo. Vazia fora do vínculo. */
export async function listarDemandasDoEscopo(escopoId: string): Promise<DemandaDetalhada[]> {
  return lerDemandas((d) => d.escopoId === escopoId)
}

/** A demanda, ou null se não existe ou está fora do vínculo (sem dizer qual dos dois). */
export async function obterDemanda(numero: string): Promise<DemandaDetalhada | null> {
  const [demanda] = await lerDemandas((d) => d.numero === numero)
  return demanda ?? null
}

/** Os comentários da demanda, do mais antigo para o mais recente, com o autor e o especialista do contato (DF-30). */
export async function listarComentarios(numero: string): Promise<ComentarioDetalhado[]> {
  if (!(await obterDemanda(numero))) return []
  return COMENTARIOS.filter((c) => c.numero === numero)
    .sort((a, b) => Date.parse(a.dataHora) - Date.parse(b.dataHora))
    .map((c) => ({
      ...c,
      autor: nomeDoUsuario(c.autorId),
      nomeEspecialista: ESPECIALISTAS.find((e) => e.id === c.especialistaId)?.nome ?? '',
    }))
}

/**
 * Os clientes que o usuário pode escolher na nova demanda (DF-39): o Administrador, todos os não Inativos; a Equipe,
 * os vinculados não Inativos e qualquer cliente Ativo, só com o nome. `visivel` diz se o usuário vê o cliente.
 */
export async function clientesParaNovaDemanda(): Promise<{ id: string; nome: string; ehCadastroElo: boolean; visivel: boolean }[]> {
  const usuario = await obterUsuarioAtual()
  return CLIENTES.filter((c) => {
    if (c.status === 'Inativo') return false
    return ehAdmin(usuario) || c.status === 'Ativo' || temVinculo(usuario, c.id, VINCULOS)
  })
    .map((c) => ({
      id: c.id,
      nome: nomeDoCliente(c),
      ehCadastroElo: c.ehCadastroElo === true,
      visivel: podeVerCliente(usuario, c.id, VINCULOS),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

/**
 * Quem pode ficar com a triagem da demanda do cliente (RN-19, DF-39): os Administradores ativos e a Equipe ativa
 * vinculada ao cliente, os Administradores primeiro, por nome. Serve a qualquer cliente que o usuário pode escolher
 * na nova demanda e devolve só id e nome. Fora deles, vazia.
 */
export async function responsaveisParaTriagem(clienteId: string): Promise<{ id: string; nome: string }[]> {
  const escolhiveis = await clientesParaNovaDemanda()
  if (!escolhiveis.some((c) => c.id === clienteId)) return []
  const ativos = USUARIOS.filter((u) => u.status === 'Ativo')
  const porNome = (a: { nome: string }, b: { nome: string }) => a.nome.localeCompare(b.nome, 'pt-BR')
  const administradores = ativos.filter(ehAdmin).sort(porNome)
  const equipe = ativos.filter((u) => !ehAdmin(u) && temVinculo(u, clienteId, VINCULOS)).sort(porNome)
  return [...administradores, ...equipe].map((u) => ({ id: u.id, nome: u.nome }))
}

/** O número da próxima demanda, no ano de hoje (DF-11). Na Etapa 3, a tabela de numeração com trava. */
export async function numeroDaProximaDemanda(): Promise<string> {
  await obterUsuarioAtual()
  const hoje = await hojeDaRequisicao()
  return proximoNumero(
    DEMANDAS.map((d) => d.numero),
    Number(hoje.slice(0, 4)),
  )
}

type Filtro = { clienteId?: string; contratoId?: string; escopoId?: string; especialistaId?: string }

/** Os ids nunca são vazios: um filtro com "" não pode virar "qualquer um" e achar ligação em tudo. */
const temIdVazio = (f: object) => Object.values(f).some((v) => v === '')

const casa = (d: DemandaFicticia, f: Filtro) =>
  !temIdVazio(f) &&
  (!f.clienteId || d.clienteId === f.clienteId) &&
  (!f.contratoId || d.contratoId === f.contratoId) &&
  (!f.escopoId || d.escopoId === f.escopoId) &&
  (!f.especialistaId || d.especialistas.some((e) => e.id === f.especialistaId))

/** As demandas abertas ligadas ao cliente, ao contrato ou ao escopo, que impedem fechá-los ou inativá-los (RN-18). */
export async function demandasQueImpedem(filtro: Omit<Filtro, 'especialistaId'>): Promise<ItemQueImpede[]> {
  const demandas = await lerDemandas((d) => casa(d, filtro) && !demandaFechada(d.status))
  return demandas.map((d) => ({
    tipo: 'Demanda',
    descricao: `${d.numero} · ${d.assunto}`,
    status: d.status,
    responsavel: d.nomeAtendimento || d.nomeTriagem,
    href: `/central/${d.numero}`,
  }))
}

/**
 * Há demanda ligada, aberta ou não (RN-13, DF-33): impede excluir o cliente, o contrato, o escopo ou o especialista.
 * Conta também o que o usuário não vê, sem revelar qual é.
 */
export async function temDemandaLigada(filtro: Filtro): Promise<boolean> {
  await obterUsuarioAtual()
  return DEMANDAS.some((d) => casa(d, filtro))
}

/** As demandas ligadas ao especialista, só dos clientes que o usuário vê (CA-11.4). */
export async function demandasDoEspecialista(especialistaId: string): Promise<DemandaDetalhada[]> {
  return lerDemandas((d) => d.especialistas.some((e) => e.id === especialistaId))
}
