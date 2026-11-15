'use server'

import { obterCliente } from '@/lib/dados/clientes'
import { listarAvaliadores, listarDimensoes, obterAvaliacao } from '@/lib/dados/maturidade'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import type { AvaliacaoDetalhada } from '@/lib/dados/tipos'
import { mensagemDeSucesso, SEM_PERMISSAO, type ResultadoAcao } from '@/lib/resultado-acao'
import type { EstadoSalvarAvaliacao } from './estados'
import { NIVEIS_DIMENSAO, NIVEIS_GERAIS, oQueFaltaParaConcluir, PRONTIDOES } from './regras'
import { lerDadosAvaliacao, MENSAGENS_AVALIACAO, validarAvaliacao } from './validacao'

// Ações da avaliação de maturidade (parte 2, 5.3). Conferem o perfil e o vínculo no servidor, mesmo quando a
// tela esconde o botão. No protótipo, salvar só simula: nada é gravado, e a resposta diz isso.

const texto = (valor: FormDataEntryValue | null) => (typeof valor === 'string' ? valor.trim() : '')

const recusa = (erroGeral: string): EstadoSalvarAvaliacao => ({ erros: {}, valores: null, erroGeral })

/**
 * Nova avaliação (com `clienteId`) ou edição (com `avaliacaoId`), pelo Administrador ou pela Equipe vinculada.
 * O cliente e as dimensões vêm do servidor, e não do navegador. Fora do alcance, a recusa não diz se o registro
 * existe. A avaliação Concluída não muda (RN-23).
 */
export async function salvarAvaliacao(
  _estado: EstadoSalvarAvaliacao,
  formData: FormData,
): Promise<EstadoSalvarAvaliacao> {
  const avaliacaoId = texto(formData.get('avaliacaoId'))
  let clienteId: string
  let dimensoes: string[]

  if (avaliacaoId) {
    const avaliacao = await obterAvaliacao(avaliacaoId)
    if (!avaliacao) return recusa(SEM_PERMISSAO)
    if (avaliacao.status === 'Concluída') return recusa(MENSAGENS_AVALIACAO.concluida)
    clienteId = avaliacao.clienteId
    dimensoes = avaliacao.dimensoes.map((d) => d.dimensao)
  } else {
    const id = texto(formData.get('clienteId'))
    const cliente = id ? await obterCliente(id) : null
    // Não se avalia cliente Inativo nem o cadastro da ELO.
    if (!cliente || cliente.status === 'Inativo' || cliente.ehCadastroElo) return recusa(SEM_PERMISSAO)
    clienteId = cliente.id
    dimensoes = await listarDimensoes()
  }

  const dados = lerDadosAvaliacao(formData, dimensoes.length)
  // Valor fora das listas, só possível enviando à mão, conta como em branco, como o segmento do cliente.
  const daLista = (lista: readonly string[], valor: string) => (lista.includes(valor) ? valor : '')
  dados.niveis = dados.niveis.map((n) => daLista(NIVEIS_DIMENSAO, n))
  dados.maturidadeGeral = daLista(NIVEIS_GERAIS, dados.maturidadeGeral)
  dados.prontidao = daLista(PRONTIDOES, dados.prontidao)
  // Os contratos entram na parte 3: até lá, nenhum contrato de referência é aceito (CA-20.3).
  dados.contratoId = ''
  const permitidos = (await listarAvaliadores(clienteId)).map((u) => u.id)
  const erros = validarAvaliacao(dados, permitidos)
  if (Object.keys(erros).length > 0) return { erros, valores: dados }

  return {
    erros: {},
    valores: dados,
    sucesso: {
      mensagem: mensagemDeSucesso('Avaliação salva.'),
      destino: avaliacaoId ? `/avaliacoes/${avaliacaoId}` : `/clientes/${clienteId}?aba=maturidade`,
    },
  }
}

const negar = (mensagem: string): ResultadoAcao => ({ ok: false, mensagem })

/**
 * A avaliação ao alcance do Administrador, ou a recusa. O id vem do navegador e pode ser forjado: quem não é
 * Administrador, ou um id que não existe, recebe a mesma recusa, sem saber se a avaliação existe.
 */
async function avaliacaoDoAdministrador(id: unknown): Promise<AvaliacaoDetalhada | ResultadoAcao> {
  const usuario = await obterUsuarioAtual()
  if (!ehAdmin(usuario) || typeof id !== 'string') return negar(SEM_PERMISSAO)
  return (await obterAvaliacao(id)) ?? negar(SEM_PERMISSAO)
}

const ehRecusa = (x: AvaliacaoDetalhada | ResultadoAcao): x is ResultadoAcao => 'ok' in x

/** Concluir a avaliação (CA-20.2), só pelo Administrador: recusado enquanto faltar nível, maturidade geral ou prontidão. */
export async function concluirAvaliacao(id: string): Promise<ResultadoAcao> {
  const avaliacao = await avaliacaoDoAdministrador(id)
  if (ehRecusa(avaliacao)) return avaliacao
  if (avaliacao.status === 'Concluída') return negar('Esta avaliação já está concluída.')
  const faltando = oQueFaltaParaConcluir(avaliacao)
  if (faltando.length > 0) return negar(`Para concluir, preencha: ${faltando.join(', ')}.`)
  return { ok: true, mensagem: mensagemDeSucesso('Avaliação concluída.') }
}

/** Reabrir a avaliação Concluída (RN-17, RN-22), só pelo Administrador e com justificativa. */
export async function reabrirAvaliacao(id: string, justificativa: string): Promise<ResultadoAcao> {
  const avaliacao = await avaliacaoDoAdministrador(id)
  if (ehRecusa(avaliacao)) return avaliacao
  if (avaliacao.status !== 'Concluída') return negar('Só uma avaliação concluída pode ser reaberta.')
  if (typeof justificativa !== 'string' || !justificativa.trim()) return negar('Escreva a justificativa da reabertura.')
  return { ok: true, mensagem: mensagemDeSucesso('Avaliação reaberta.') }
}
