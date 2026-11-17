import { situacaoDoPrazo } from '@/lib/atividades/regras'
import { nomeDoCliente } from '@/lib/clientes/filtros'
import { somarDias } from '@/lib/formato'
import { hojeDaRequisicao } from './hoje'
import { ATIVIDADES, type AtividadeFicticia } from './mock/atividades'
import { CLIENTES } from './mock/clientes'
import { ESCOPOS } from './mock/escopos'
import { PLANOS } from './mock/planos'
import { USUARIOS, VINCULOS } from './mock/usuarios'
import { obterDiasProximoDoPrazo } from './parametros'
import { podeVerCliente } from './regras'
import { obterUsuarioAtual } from './sessao'
import type { Atividade, AtividadeDetalhada } from './tipos'

// Leitura das atividades (F08), com a regra de vínculo (RN-01) pelo cliente da atividade. A situação do prazo é
// calculada a cada leitura, com a data de hoje em Brasília (RN-09, RN-10, RN-20).

/** A atividade como a plataforma a guarda: o prazo relativo do exemplo vira data. Uma cópia. */
export function resolverAtividade(a: AtividadeFicticia, hoje: string): Atividade {
  const { prazoEmDias, ...atividade } = a
  return { ...atividade, prazo: prazoEmDias === undefined ? a.prazo : somarDias(hoje, prazoEmDias) }
}

/** As atividades do exemplo, já com o prazo resolvido, para quem só precisa contar (o resumo do plano). */
export function atividadesDoPlanoSemSessao(planoId: string, hoje: string): Atividade[] {
  return ATIVIDADES.filter((a) => a.planoId === planoId).map((a) => resolverAtividade(a, hoje))
}

const nomeDoUsuario = (id: string) => USUARIOS.find((u) => u.id === id)?.nome ?? ''

function detalhar(a: AtividadeFicticia, hoje: string, dias: number): AtividadeDetalhada {
  const atividade = resolverAtividade(a, hoje)
  const plano = PLANOS.find((p) => p.id === a.planoId)
  const escopo = ESCOPOS.find((e) => e.id === plano?.escopoId)
  const cliente = CLIENTES.find((c) => c.id === a.clienteId)
  return {
    ...atividade,
    nomeResponsavel: nomeDoUsuario(a.responsavelId),
    nomePlano: plano?.nome ?? '',
    statusPlano: plano?.status ?? 'Aberto',
    escopoId: escopo?.id ?? '',
    nomeEscopo: escopo?.nome ?? '',
    nomeCliente: cliente ? nomeDoCliente(cliente) : '',
    situacao: situacaoDoPrazo(atividade, hoje, dias),
  }
}

async function lerAtividades(filtro: (a: AtividadeFicticia) => boolean): Promise<AtividadeDetalhada[]> {
  const usuario = await obterUsuarioAtual()
  const [hoje, dias] = await Promise.all([hojeDaRequisicao(), obterDiasProximoDoPrazo()])
  return ATIVIDADES.filter((a) => filtro(a) && podeVerCliente(usuario, a.clienteId, VINCULOS)).map((a) =>
    detalhar(a, hoje, dias),
  )
}

/** As atividades que o usuário vê, na ordem do cadastro (RN-01). A ordem da tela é das telas. */
export async function listarAtividades(): Promise<AtividadeDetalhada[]> {
  return lerAtividades(() => true)
}

/** As atividades do plano, na ordem do cadastro. Vazia se o usuário não pode ver o cliente. */
export async function listarAtividadesDoPlano(planoId: string): Promise<AtividadeDetalhada[]> {
  return lerAtividades((a) => a.planoId === planoId)
}

/** A atividade, ou null se não existe ou está fora do vínculo (sem dizer qual dos dois). */
export async function obterAtividade(id: string): Promise<AtividadeDetalhada | null> {
  const [atividade] = await lerAtividades((a) => a.id === id)
  return atividade ?? null
}
