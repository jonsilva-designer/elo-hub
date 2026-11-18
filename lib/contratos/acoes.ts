'use server'

import { listarClientes, obterCliente } from '@/lib/dados/clientes'
import { contratoTemItensLigados, listarContratosDoCliente, obterContrato } from '@/lib/dados/contratos'
import { documentosPrincipaisPossiveis } from '@/lib/dados/documentos'
import { impedimentosDoContrato } from '@/lib/dados/impedimentos'
import { listarContratantes, listarServicos } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import type { ContratoDetalhado } from '@/lib/dados/tipos'
import { mensagemDeSucesso, SEM_PERMISSAO, type ResultadoAcao } from '@/lib/resultado-acao'
import type { EstadoSalvarContrato } from './estados'
import { STATUS_ABERTOS, TIPOS_VIGENCIA } from './regras'
import { lerDadosContrato, MENSAGENS_CONTRATO, validarContrato } from './validacao'

// Ações do contrato (parte 3, 5.3). Só o Administrador cadastra, edita e muda o status (matriz 4.3). Conferem tudo
// no servidor, mesmo quando a tela esconde o botão. No protótipo, salvar só simula: nada é gravado.

const texto = (valor: FormDataEntryValue | null) => (typeof valor === 'string' ? valor.trim() : '')

/** Cadastro e edição do contrato. Com `id`, é edição; o cliente é o do contrato, e o do formulário é ignorado. */
export async function salvarContrato(_estado: EstadoSalvarContrato, formData: FormData): Promise<EstadoSalvarContrato> {
  const usuario = await obterUsuarioAtual()
  const dados = lerDadosContrato(formData)
  if (!ehAdmin(usuario)) return { erros: {}, valores: dados, erroGeral: SEM_PERMISSAO }

  const id = texto(formData.get('id'))
  const atual = id ? await obterContrato(id) : null
  // Não diz se o contrato existe.
  if (id && !atual) return { erros: {}, valores: dados, erroGeral: SEM_PERMISSAO }

  // O cliente do cadastro precisa poder ter contrato: nem Inativo (RN-18), nem o cadastro da ELO (DF-40).
  if (atual) dados.clienteId = atual.clienteId
  else {
    const clientes = await listarClientes()
    const cliente = clientes.find((c) => c.id === dados.clienteId)
    if (!cliente || cliente.status === 'Inativo' || cliente.ehCadastroElo) dados.clienteId = ''
  }

  // Valor fora das listas, só possível enviando à mão, conta como vazio.
  const [contratantes, servicos] = await Promise.all([listarContratantes(), listarServicos()])
  if (!contratantes.includes(dados.contratante)) dados.contratante = ''
  dados.servicos = dados.servicos.filter((s) => servicos.includes(s))
  if (!(TIPOS_VIGENCIA as string[]).includes(dados.tipoVigencia)) dados.tipoVigencia = ''
  // Prazo indeterminado não tem término (DF-68, arquitetura 4.3).
  if (dados.tipoVigencia === 'Prazo indeterminado') dados.termino = ''

  const [outros, responsaveis] = dados.clienteId
    ? await Promise.all([listarContratosDoCliente(dados.clienteId), listarResponsaveis(dados.clienteId)])
    : [[], []]
  const erros = validarContrato(dados, {
    atual,
    codigosDoCliente: outros.filter((c) => c.id !== atual?.id).map((c) => c.codigo),
    responsaveisPermitidos: responsaveis.map((u) => u.id),
  })
  // O documento principal (F03): um Contrato ou Proposta Comercial já ligado a este contrato. No cadastro, o contrato
  // ainda não tem documento: o principal é escolhido depois, na edição.
  const principal = texto(formData.get('documentoPrincipalId'))
  if (principal && !(atual ? await documentosPrincipaisPossiveis(atual.id) : []).some((d) => d.id === principal)) {
    erros.documentoPrincipalId = MENSAGENS_CONTRATO.documentoPrincipal
  }
  if (Object.keys(erros).length > 0) return { erros, valores: dados }

  return {
    erros: {},
    valores: dados,
    sucesso: {
      mensagem: mensagemDeSucesso('Contrato salvo.'),
      destino: atual ? `/contratos/${atual.id}` : `/clientes/${dados.clienteId}?aba=contratos`,
    },
  }
}

const recusa = (mensagem: string): ResultadoAcao => ({ ok: false, mensagem })

/**
 * O contrato ao alcance do Administrador, ou a recusa. Os argumentos vêm do navegador e podem ser forjados:
 * quem não é Administrador, ou um id que não existe, recebe a mesma recusa, sem saber se o contrato existe.
 */
async function contratoDoAdministrador(id: unknown): Promise<ContratoDetalhado | ResultadoAcao> {
  const usuario = await obterUsuarioAtual()
  if (!ehAdmin(usuario) || typeof id !== 'string') return recusa(SEM_PERMISSAO)
  return (await obterContrato(id)) ?? recusa(SEM_PERMISSAO)
}

const ehRecusa = (x: ContratoDetalhado | ResultadoAcao): x is ResultadoAcao => 'ok' in x

/** Encerrar ou cancelar: recusado enquanto houver escopos abertos, com a lista deles (RN-18, CA-18.3). */
async function fechar(contrato: ContratoDetalhado, verbo: 'encerrar' | 'cancelar', sucesso: string): Promise<ResultadoAcao> {
  const impedimentos = await impedimentosDoContrato(contrato.id)
  if (impedimentos.length > 0) {
    return {
      ok: false,
      mensagem: `Não é possível ${verbo} este contrato enquanto houver escopos ou demandas abertos.`,
      impedimentos,
    }
  }
  return { ok: true, mensagem: mensagemDeSucesso(sucesso) }
}

/** Encerrar o contrato Ativo ou Suspenso: ele vigorou e terminou (F03, seção 6.1). */
export async function encerrarContrato(id: string): Promise<ResultadoAcao> {
  const contrato = await contratoDoAdministrador(id)
  if (ehRecusa(contrato)) return contrato
  if (contrato.status !== 'Ativo' && contrato.status !== 'Suspenso') {
    return recusa('Só um contrato Ativo ou Suspenso pode ser encerrado.')
  }
  return fechar(contrato, 'encerrar', 'Contrato encerrado.')
}

/** Cancelar o contrato em Proposta ou Em contratação: ele não chegou a vigorar (F03, seção 6.1). */
export async function cancelarContrato(id: string): Promise<ResultadoAcao> {
  const contrato = await contratoDoAdministrador(id)
  if (ehRecusa(contrato)) return contrato
  if (contrato.status !== 'Proposta' && contrato.status !== 'Em contratação') {
    return recusa('Só um contrato em Proposta ou Em contratação pode ser cancelado.')
  }
  return fechar(contrato, 'cancelar', 'Contrato cancelado.')
}

/**
 * Reabrir o contrato Encerrado ou Cancelado para um status aberto, com justificativa (RN-17, RN-22). Ativo e
 * Suspenso exigem as datas da vigência (CA-03.2): sem elas, a recusa pede para editar o contrato antes.
 */
export async function reabrirContrato(id: string, status: string, justificativa: string): Promise<ResultadoAcao> {
  const contrato = await contratoDoAdministrador(id)
  if (ehRecusa(contrato)) return contrato
  if (contrato.status !== 'Encerrado' && contrato.status !== 'Cancelado') {
    return recusa('Só um contrato Encerrado ou Cancelado pode ser reaberto.')
  }
  // Todo status de volta é aberto, e cliente Inativo não tem contrato aberto (RN-18, parte 3, 5.11).
  if ((await obterCliente(contrato.clienteId))?.status === 'Inativo') {
    return recusa('Cliente inativo: reative o cliente para reabrir o contrato.')
  }
  if (!(STATUS_ABERTOS as string[]).includes(status)) return recusa('Escolha o status de volta.')
  if (typeof justificativa !== 'string' || !justificativa.trim()) return recusa('Escreva a justificativa da reabertura.')
  const semDatas = !contrato.inicio || (contrato.tipoVigencia !== 'Prazo indeterminado' && !contrato.termino)
  if ((status === 'Ativo' || status === 'Suspenso') && semDatas) {
    return recusa('Para voltar como Ativo ou Suspenso, o contrato precisa das datas da vigência. Edite o contrato antes.')
  }
  return { ok: true, mensagem: mensagemDeSucesso('Contrato reaberto.') }
}

/** Excluir o contrato (DF-33, CA-18.4): só sem nada ligado a ele, e com justificativa. */
export async function excluirContrato(id: string, justificativa: string): Promise<ResultadoAcao> {
  const contrato = await contratoDoAdministrador(id)
  if (ehRecusa(contrato)) return contrato
  if (await contratoTemItensLigados(contrato.id)) return recusa('Este contrato tem registros ligados e não pode ser excluído.')
  if (typeof justificativa !== 'string' || !justificativa.trim()) return recusa('Escreva a justificativa da exclusão.')
  return { ok: true, mensagem: mensagemDeSucesso('Contrato excluído.') }
}
