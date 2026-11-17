'use server'

import { contratoFechado } from '@/lib/contratos/regras'
import { obterContrato } from '@/lib/dados/contratos'
import { escopoTemItensLigados, etapasQueImpedemFechar, listarEscoposDoCliente, obterEscopo } from '@/lib/dados/escopos'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import type { EscopoDetalhado } from '@/lib/dados/tipos'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { mensagemDeSucesso, SEM_PERMISSAO, type ResultadoAcao } from '@/lib/resultado-acao'
import type { EstadoSalvarEscopo } from './estados'
import { ciclosAnterioresPossiveis, CRITICIDADES, escopoFechado, PRIORIDADES, STATUS_ESCOPO_ABERTOS } from './regras'
import { avisoDaVigencia, dataValida, lerDadosEscopo, MENSAGENS_ESCOPO, validarEscopo } from './validacao'

// Ações do escopo (parte 3, 5.8 e 5.9). Só o Administrador cadastra, edita, reclassifica, conclui, cancela, reabre,
// move e exclui (matriz 4.3). Conferem tudo no servidor, mesmo quando a tela esconde o botão. No protótipo, salvar
// só simula: nada é gravado.

const texto = (valor: FormDataEntryValue | null) => (typeof valor === 'string' ? valor.trim() : '')

/**
 * Cadastro e edição do escopo. Com `id`, é edição: o contrato e o cliente são os do escopo, e a criticidade do
 * formulário é ignorada (muda só por Reclassificar). No cadastro, o contrato vem do formulário e não pode estar
 * fechado (RN-23). Com tudo certo, a conclusão prevista depois do término da vigência devolve o aviso da RN-21,
 * até vir a confirmação.
 */
export async function salvarEscopo(_estado: EstadoSalvarEscopo, formData: FormData): Promise<EstadoSalvarEscopo> {
  const usuario = await obterUsuarioAtual()
  const dados = lerDadosEscopo(formData)
  const recusa = (erroGeral: string): EstadoSalvarEscopo => ({ erros: {}, valores: dados, erroGeral })
  if (!ehAdmin(usuario)) return recusa(SEM_PERMISSAO)

  const id = texto(formData.get('id'))
  const atual = id ? await obterEscopo(id) : null
  // Não diz se o escopo ou o contrato existem.
  if (id && !atual) return recusa(SEM_PERMISSAO)
  const contrato = await obterContrato(atual ? atual.contratoId : dados.contratoId)
  if (!contrato) return recusa(SEM_PERMISSAO)
  dados.contratoId = contrato.id
  if (!atual && contratoFechado(contrato.status)) return recusa(MENSAGENS_ESCOPO.contratoFechado)

  if (atual) {
    dados.criticidade = atual.criticidade
    dados.justificativaCriticidade = atual.justificativaCriticidade
  }
  // Valor fora das listas, só possível enviando à mão, conta como vazio.
  if (!(CRITICIDADES as string[]).includes(dados.criticidade)) dados.criticidade = ''
  if (!(PRIORIDADES as string[]).includes(dados.prioridade)) dados.prioridade = ''

  const [responsaveis, escoposDoCliente] = await Promise.all([
    listarResponsaveis(contrato.clienteId),
    listarEscoposDoCliente(contrato.clienteId),
  ])
  // O ciclo anterior é outro escopo do mesmo cliente (DF-57, RN-02), que não venha depois deste na cadeia (CA-05.10).
  if (!ciclosAnterioresPossiveis(escoposDoCliente, atual?.id ?? null).includes(dados.cicloAnteriorId)) {
    dados.cicloAnteriorId = ''
  }

  const erros = validarEscopo(dados, { atual, responsaveisPermitidos: responsaveis.map((u) => u.id) })
  if (Object.keys(erros).length > 0) return { erros, valores: dados }

  // RN-21: só o contrato com vigência e término dá o aviso, e só depois do término (no próprio dia, não).
  const termino = contrato.vigencia !== null && contrato.tipoVigencia !== 'Prazo indeterminado' ? contrato.termino : null
  if (!dados.confirmarAviso && termino && dados.conclusaoPrevista && dados.conclusaoPrevista > termino) {
    return { erros: {}, valores: dados, aviso: avisoDaVigencia(termino) }
  }

  return {
    erros: {},
    valores: dados,
    sucesso: {
      mensagem: mensagemDeSucesso('Escopo salvo.'),
      destino: atual ? `/escopos/${atual.id}` : `/contratos/${contrato.id}`,
    },
  }
}

const recusa = (mensagem: string): ResultadoAcao => ({ ok: false, mensagem })

const temTexto = (valor: unknown): valor is string => typeof valor === 'string' && valor.trim() !== ''

/**
 * O escopo ao alcance do Administrador, ou a recusa. Os argumentos vêm do navegador e podem ser forjados: quem não
 * é Administrador, ou um id que não existe, recebe a mesma recusa, sem saber se o escopo existe.
 */
async function escopoDoAdministrador(id: unknown): Promise<EscopoDetalhado | ResultadoAcao> {
  const usuario = await obterUsuarioAtual()
  if (!ehAdmin(usuario) || typeof id !== 'string') return recusa(SEM_PERMISSAO)
  return (await obterEscopo(id)) ?? recusa(SEM_PERMISSAO)
}

const ehRecusa = (x: EscopoDetalhado | ResultadoAcao): x is ResultadoAcao => 'ok' in x

/** Reclassificar a criticidade do escopo aberto, com justificativa (F05, CA-05.2). Fica no histórico. */
export async function reclassificarCriticidade(id: string, criticidade: string, justificativa: string): Promise<ResultadoAcao> {
  const escopo = await escopoDoAdministrador(id)
  if (ehRecusa(escopo)) return escopo
  if (escopoFechado(escopo.status)) return recusa('A criticidade de um escopo fechado não muda.')
  if (!(CRITICIDADES as unknown[]).includes(criticidade)) return recusa(MENSAGENS_ESCOPO.criticidade)
  if (!temTexto(justificativa)) return recusa(MENSAGENS_ESCOPO.justificativaCriticidade)
  return { ok: true, mensagem: mensagemDeSucesso('Criticidade reclassificada.') }
}

/** Concluir ou cancelar: só o escopo aberto, e recusado enquanto houver etapas Em andamento, com a lista (DF-59). */
async function fechar(escopo: EscopoDetalhado, verbo: 'concluir' | 'cancelar'): Promise<ResultadoAcao | null> {
  const participio = verbo === 'concluir' ? 'concluído' : 'cancelado'
  if (escopoFechado(escopo.status)) return recusa(`Só um escopo aberto pode ser ${participio}.`)
  const impedimentos = await etapasQueImpedemFechar(escopo.id)
  if (impedimentos.length > 0) {
    return { ok: false, mensagem: `Não é possível ${verbo} este escopo enquanto houver etapas Em andamento.`, impedimentos }
  }
  return null
}

/** Concluir o escopo aberto, com a data efetiva de conclusão. As etapas Não iniciadas podem ficar (DF-59). */
export async function concluirEscopo(id: string, dataEfetiva: string): Promise<ResultadoAcao> {
  const escopo = await escopoDoAdministrador(id)
  if (ehRecusa(escopo)) return escopo
  const impedido = await fechar(escopo, 'concluir')
  if (impedido) return impedido
  if (typeof dataEfetiva !== 'string' || !dataValida(dataEfetiva)) return recusa('Informe a data efetiva de conclusão.')
  if (escopo.inicio && dataEfetiva < escopo.inicio) return recusa('A data efetiva não pode ser antes do início do escopo.')
  return { ok: true, mensagem: mensagemDeSucesso('Escopo concluído.') }
}

/** Cancelar o escopo aberto: ele sai do andamento sem ser concluído. */
export async function cancelarEscopo(id: string): Promise<ResultadoAcao> {
  const escopo = await escopoDoAdministrador(id)
  if (ehRecusa(escopo)) return escopo
  return (await fechar(escopo, 'cancelar')) ?? { ok: true, mensagem: mensagemDeSucesso('Escopo cancelado.') }
}

/**
 * Reabrir o escopo Concluído ou Cancelado para um status aberto, com justificativa (RN-17, RN-22). Com o contrato
 * fechado, não: o contrato é reaberto antes (RN-23).
 */
export async function reabrirEscopo(id: string, status: string, justificativa: string): Promise<ResultadoAcao> {
  const escopo = await escopoDoAdministrador(id)
  if (ehRecusa(escopo)) return escopo
  if (!escopoFechado(escopo.status)) return recusa('Só um escopo Concluído ou Cancelado pode ser reaberto.')
  if (contratoFechado(escopo.statusContrato)) return recusa('O contrato está fechado. Reabra o contrato antes.')
  if (!(STATUS_ESCOPO_ABERTOS as unknown[]).includes(status)) return recusa('Escolha o status de volta.')
  if (!temTexto(justificativa)) return recusa('Escreva a justificativa da reabertura.')
  return { ok: true, mensagem: mensagemDeSucesso('Escopo reaberto.') }
}

/**
 * Mover o escopo para outro contrato aberto do mesmo cliente (DF-45). Planos, atividades, Jornada, documentos e
 * demandas vão junto. O destino forjado (o próprio contrato, um fechado ou de outro cliente) é recusado.
 */
export async function moverEscopo(id: string, contratoId: string): Promise<ResultadoAcao> {
  const escopo = await escopoDoAdministrador(id)
  if (ehRecusa(escopo)) return escopo
  const destino = typeof contratoId === 'string' ? await obterContrato(contratoId) : null
  if (!destino || destino.id === escopo.contratoId || destino.clienteId !== escopo.clienteId || contratoFechado(destino.status)) {
    return recusa('Escolha outro contrato aberto do mesmo cliente.')
  }
  return { ok: true, mensagem: mensagemDeSucesso('Escopo movido.') }
}

/** Excluir o escopo (DF-33, RN-13): só sem nada ligado a ele, e com justificativa. */
export async function excluirEscopo(id: string, justificativa: string): Promise<ResultadoAcao> {
  const escopo = await escopoDoAdministrador(id)
  if (ehRecusa(escopo)) return escopo
  if (await escopoTemItensLigados(escopo.id)) return recusa('Este escopo tem registros ligados e não pode ser excluído.')
  if (!temTexto(justificativa)) return recusa('Escreva a justificativa da exclusão.')
  return { ok: true, mensagem: mensagemDeSucesso('Escopo excluído.') }
}
