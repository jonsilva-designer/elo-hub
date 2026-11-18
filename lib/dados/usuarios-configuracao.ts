import { atividadeFechada } from '@/lib/atividades/regras'
import { nomeDoCliente } from '@/lib/clientes/filtros'
import { contratoFechado } from '@/lib/contratos/regras'
import { demandaFechada } from '@/lib/demandas/regras'
import { escopoFechado } from '@/lib/escopos/regras'
import { formatarData } from '@/lib/formato'
import { planoFechado } from '@/lib/planos/regras'
import { listarAtividades } from './atividades'
import { listarClientes } from './clientes'
import { listarContratos } from './contratos'
import { listarDemandas } from './demandas'
import { listarEscopos } from './escopos'
import { listarAvaliacoesDoCliente } from './maturidade'
import { USUARIOS, VINCULOS } from './mock/usuarios'
import { listarPlanosDoEscopo } from './planos'
import { ehAdmin, temVinculo } from './regras'
import { obterUsuarioAtual } from './sessao'
import type { ItemQueImpede, Usuario } from './tipos'

// Leituras da configuração de usuários (F01; parte 8, 4.1). Só o Administrador gerencia usuários e vínculos
// (CA-01.2, CA-01.4): para a Equipe, tudo vem vazio. Fica fora de usuarios.ts, que a maturidade importa.

export type UsuarioDetalhado = Usuario & { clientes: { id: string; nome: string }[] }

/** Um item aberto sob a responsabilidade do usuário (RN-18, DF-36), com o cliente, para o bloqueio e a redistribuição. */
export type ItemAberto = ItemQueImpede & { chave: string; clienteId: string; cliente: string }

const porNome = (a: { nome: string }, b: { nome: string }) => a.nome.localeCompare(b.nome, 'pt-BR')

async function administrador(): Promise<boolean> {
  return ehAdmin(await obterUsuarioAtual())
}

/** Os usuários, pelo nome, com os clientes vinculados. Vazia para a Equipe. */
export async function listarUsuarios(): Promise<UsuarioDetalhado[]> {
  if (!(await administrador())) return []
  const clientes = await listarClientes()
  return USUARIOS.map((u) => ({
    ...u,
    clientes: clientes
      .filter((c) => temVinculo(u, c.id, VINCULOS))
      .map((c) => ({ id: c.id, nome: nomeDoCliente(c) }))
      .sort(porNome),
  })).sort(porNome)
}

/** O usuário, ou null para a Equipe e para o id que não existe. */
export async function obterUsuario(id: string): Promise<UsuarioDetalhado | null> {
  return (await listarUsuarios()).find((u) => u.id === id) ?? null
}

/**
 * Os itens abertos em que o usuário é o responsável (parte 8, 4.1): contratos, escopos, etapas Em andamento, planos,
 * atividades, demandas (triagem ou atendimento) e avaliações Em elaboração. Com `clienteId`, só os desse cliente
 * (DF-36: o vínculo). Vazia para a Equipe.
 */
export async function itensAbertosDoUsuario(id: string, clienteId?: string): Promise<ItemAberto[]> {
  if (!(await administrador())) return []
  const [clientes, contratos, escopos, atividades, demandas] = await Promise.all([
    listarClientes(),
    listarContratos(),
    listarEscopos(),
    listarAtividades(),
    listarDemandas(),
  ])
  const [planos, avaliacoes] = await Promise.all([
    Promise.all(escopos.map((e) => listarPlanosDoEscopo(e.id))).then((l) => l.flat()),
    Promise.all(clientes.map((c) => listarAvaliacoesDoCliente(c.id))).then((l) => l.flat()),
  ])
  const nomeCliente = (cid: string) => {
    const c = clientes.find((x) => x.id === cid)
    return c ? nomeDoCliente(c) : ''
  }
  const responsavel = USUARIOS.find((u) => u.id === id)?.nome ?? ''
  const itens: ItemAberto[] = []
  const incluir = (chave: string, cid: string, tipo: string, descricao: string, status: string, href: string) =>
    itens.push({ chave, clienteId: cid, cliente: nomeCliente(cid), tipo, descricao, status, responsavel, href })

  for (const c of contratos) {
    if (c.responsavelId === id && !contratoFechado(c.status)) {
      incluir(`contrato:${c.id}`, c.clienteId, 'Contrato', `${c.codigo} · ${c.contratante}`, c.status, `/contratos/${c.id}`)
    }
  }
  for (const e of escopos) {
    if (escopoFechado(e.status)) continue
    if (e.responsavelId === id) incluir(`escopo:${e.id}`, e.clienteId, 'Escopo', e.nome, e.status, `/escopos/${e.id}`)
    for (const l of e.etapas) {
      if (l.status === 'Em andamento' && l.responsavelId === id) {
        incluir(`etapa:${e.id}:${l.etapa}`, e.clienteId, 'Etapa', `${e.nome} · ${l.etapa}`, l.status, `/escopos/${e.id}`)
      }
    }
  }
  for (const p of planos) {
    if (p.responsavelId === id && !planoFechado(p.status)) incluir(`plano:${p.id}`, p.clienteId, 'Plano', p.nome, p.status, `/planos/${p.id}`)
  }
  for (const a of atividades) {
    if (a.responsavelId === id && !atividadeFechada(a.status)) {
      incluir(`atividade:${a.id}`, a.clienteId, 'Atividade', a.nome, a.status, `/atividades/${a.id}/editar`)
    }
  }
  for (const d of demandas) {
    if (!demandaFechada(d.status) && (d.responsavelTriagemId === id || d.responsavelAtendimentoId === id)) {
      incluir(`demanda:${d.numero}`, d.clienteId, 'Demanda', `${d.numero} · ${d.assunto}`, d.status, `/central/${d.numero}`)
    }
  }
  for (const a of avaliacoes) {
    if (a.avaliadorId === id && a.status === 'Em elaboração') {
      incluir(`avaliacao:${a.id}`, a.clienteId, 'Avaliação', `Avaliação de ${formatarData(a.data)}`, a.status, `/avaliacoes/${a.id}`)
    }
  }
  return clienteId ? itens.filter((i) => i.clienteId === clienteId) : itens
}

/**
 * Quem pode receber os itens redistribuídos (RN-19, CA-01.9): os Administradores ativos e a Equipe ativa vinculada a
 * todos os clientes dos itens, menos a pessoa de quem os itens saem. Administradores primeiro, por nome.
 */
export async function responsaveisParaRedistribuir(deUsuarioId: string, clienteIds: readonly string[]): Promise<Usuario[]> {
  if (!(await administrador())) return []
  const ativos = USUARIOS.filter((u) => u.status === 'Ativo' && u.id !== deUsuarioId)
  const administradores = ativos.filter(ehAdmin).sort(porNome)
  const equipe = ativos.filter((u) => !ehAdmin(u) && clienteIds.every((c) => temVinculo(u, c, VINCULOS))).sort(porNome)
  return [...administradores, ...equipe].map((u) => ({ ...u }))
}
