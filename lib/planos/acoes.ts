'use server'

import { obterEscopo } from '@/lib/dados/escopos'
import { listarAvaliacoesDoCliente } from '@/lib/dados/maturidade'
import { atividadesQueImpedemFechar, obterPlano } from '@/lib/dados/planos'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { escopoFechado } from '@/lib/escopos/regras'
import type { PlanoDetalhado } from '@/lib/dados/tipos'
import { mensagemDeSucesso, SEM_PERMISSAO, type ResultadoAcao } from '@/lib/resultado-acao'
import type { EstadoSalvarPlano } from './estados'
import { planoFechado, STATUS_PLANO_ABERTOS } from './regras'
import { lerDadosPlano, MENSAGENS_PLANO, validarPlano } from './validacao'

// Ações do plano de ação (parte 4, 5.5 e 5.6). O Administrador e a Equipe vinculada criam e atualizam planos
// (matriz 4.3); a regra de vínculo vem das leituras, que não devolvem o que o usuário não vê. Conferem tudo no
// servidor, mesmo quando a tela esconde o botão. No protótipo, salvar só simula: nada é gravado.

const texto = (valor: FormDataEntryValue | null) => (typeof valor === 'string' ? valor.trim() : '')

/**
 * Cadastro e edição do plano. Com `id`, é edição: o escopo e o cliente são os do plano, e a Equipe não edita o plano
 * fechado (RN-17). No cadastro, o escopo vem do formulário e não pode estar fechado (RN-23).
 */
export async function salvarPlano(_estado: EstadoSalvarPlano, formData: FormData): Promise<EstadoSalvarPlano> {
  const usuario = await obterUsuarioAtual()
  const dados = lerDadosPlano(formData)
  const recusa = (erroGeral: string): EstadoSalvarPlano => ({ erros: {}, valores: dados, erroGeral })

  const id = texto(formData.get('id'))
  const atual = id ? await obterPlano(id) : null
  // Não diz se o plano ou o escopo existem.
  if (id && !atual) return recusa(SEM_PERMISSAO)
  if (atual && !ehAdmin(usuario) && planoFechado(atual.status)) return recusa(SEM_PERMISSAO)
  const escopo = await obterEscopo(atual ? atual.escopoId : dados.escopoId)
  if (!escopo) return recusa(SEM_PERMISSAO)
  dados.escopoId = escopo.id
  if (!atual && escopoFechado(escopo.status)) return recusa(MENSAGENS_PLANO.escopoFechado)

  const [responsaveis, avaliacoes] = await Promise.all([
    listarResponsaveis(escopo.clienteId),
    listarAvaliacoesDoCliente(escopo.clienteId),
  ])
  // A avaliação de origem é do mesmo cliente (RN-02, DF-80). Outra, só possível enviando à mão, conta como vazia.
  if (!avaliacoes.some((a) => a.id === dados.avaliacaoId)) dados.avaliacaoId = ''

  const erros = validarPlano(dados, { atual, responsaveisPermitidos: responsaveis.map((u) => u.id) })
  if (Object.keys(erros).length > 0) return { erros, valores: dados }

  return {
    erros: {},
    valores: dados,
    sucesso: {
      mensagem: mensagemDeSucesso('Plano salvo.'),
      destino: atual ? `/planos/${atual.id}` : `/escopos/${escopo.id}`,
    },
  }
}

const recusa = (mensagem: string): ResultadoAcao => ({ ok: false, mensagem })

const temTexto = (valor: unknown): valor is string => typeof valor === 'string' && valor.trim() !== ''

/**
 * O plano ao alcance do usuário, ou a recusa. Os argumentos vêm do navegador e podem ser forjados: fora do vínculo,
 * com um id que não existe ou, quando `soAdmin`, sem ser Administrador, a mesma recusa, sem saber se o plano existe.
 */
async function planoAoAlcance(id: unknown, soAdmin: boolean): Promise<PlanoDetalhado | ResultadoAcao> {
  const usuario = await obterUsuarioAtual()
  if ((soAdmin && !ehAdmin(usuario)) || typeof id !== 'string') return recusa(SEM_PERMISSAO)
  return (await obterPlano(id)) ?? recusa(SEM_PERMISSAO)
}

const ehRecusa = (x: PlanoDetalhado | ResultadoAcao): x is ResultadoAcao => 'ok' in x

/** Concluir ou cancelar: só o plano aberto, e recusado enquanto houver atividades abertas, com a lista (RN-18). */
async function fechar(id: string, verbo: 'concluir' | 'cancelar'): Promise<ResultadoAcao> {
  const plano = await planoAoAlcance(id, false)
  if (ehRecusa(plano)) return plano
  const participio = verbo === 'concluir' ? 'concluído' : 'cancelado'
  if (planoFechado(plano.status)) return recusa(`Só um plano aberto pode ser ${participio}.`)
  const impedimentos = await atividadesQueImpedemFechar(plano.id)
  if (impedimentos.length > 0) {
    return { ok: false, mensagem: `Não é possível ${verbo} este plano enquanto houver atividades abertas.`, impedimentos }
  }
  return { ok: true, mensagem: mensagemDeSucesso(verbo === 'concluir' ? 'Plano concluído.' : 'Plano cancelado.') }
}

/** Concluir o plano aberto, sem atividades abertas. O Administrador e a Equipe vinculada (6.1). */
export async function concluirPlano(id: string): Promise<ResultadoAcao> {
  return fechar(id, 'concluir')
}

/** Cancelar o plano aberto, sem atividades abertas. O Administrador e a Equipe vinculada (6.1). */
export async function cancelarPlano(id: string): Promise<ResultadoAcao> {
  return fechar(id, 'cancelar')
}

/**
 * Reabrir o plano Concluído ou Cancelado para um status aberto, com justificativa: só o Administrador (RN-17,
 * RN-22). Com o escopo fechado, não: o escopo é reaberto antes (RN-23).
 */
export async function reabrirPlano(id: string, status: string, justificativa: string): Promise<ResultadoAcao> {
  const plano = await planoAoAlcance(id, true)
  if (ehRecusa(plano)) return plano
  if (!planoFechado(plano.status)) return recusa('Só um plano Concluído ou Cancelado pode ser reaberto.')
  if (escopoFechado(plano.statusEscopo)) return recusa('O escopo está fechado. Reabra o escopo antes.')
  if (!(STATUS_PLANO_ABERTOS as unknown[]).includes(status)) return recusa('Escolha o status de volta.')
  if (!temTexto(justificativa)) return recusa('Escreva a justificativa da reabertura.')
  return { ok: true, mensagem: mensagemDeSucesso('Plano reaberto.') }
}

/** Excluir o plano (DF-33, RN-13): só o Administrador, só sem atividades, e com justificativa. */
export async function excluirPlano(id: string, justificativa: string): Promise<ResultadoAcao> {
  const plano = await planoAoAlcance(id, true)
  if (ehRecusa(plano)) return plano
  if (plano.resumo.total > 0) return recusa('Este plano tem atividades e não pode ser excluído.')
  if (!temTexto(justificativa)) return recusa('Escreva a justificativa da exclusão.')
  return { ok: true, mensagem: mensagemDeSucesso('Plano excluído.') }
}
