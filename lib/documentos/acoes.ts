'use server'

import {
  contratoDoPrincipal,
  documentoTemLigacao,
  obterDocumento,
  substitutosPossiveis,
  usuarioAlteraDocumento,
} from '@/lib/dados/documentos'
import { listarCategoriasDeDocumento } from '@/lib/dados/listas'
import { opcoesDeVinculoDoDocumento } from '@/lib/dados/opcoes-documento'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import type { DocumentoDetalhado } from '@/lib/dados/tipos'
import { mensagemDeSucesso, SEM_PERMISSAO, type ResultadoAcao } from '@/lib/resultado-acao'
import type { EstadoDocumento } from './estados'
import { acoesDeStatus, CATEGORIAS_DO_PRINCIPAL, erroDoArquivo, type AcaoStatusDocumento } from './regras'
import {
  completarVinculos,
  destinoDaInclusao,
  lerArquivo,
  lerDadosDocumento,
  MENSAGENS_DOCUMENTO,
  validarDocumento,
  type DadosDocumento,
} from './validacao'

// Ações do documento (parte 6, 4.2). O Administrador e a Equipe vinculada incluem e alteram os dados; o Documento do
// Especialista sem cliente, só o Administrador (matriz 4.3, DF-65). Conferem tudo no servidor. No protótipo, nada é
// gravado e o arquivo não é guardado: o servidor confere nome, tipo e tamanho e responde como se tivesse guardado.

/** O novo documento é do mesmo dono do anterior: o mesmo cliente ou, sem cliente, o mesmo especialista (DF-44). */
function mesmoDono(dados: DadosDocumento, anterior: DocumentoDetalhado): boolean {
  if (anterior.clienteId === null) return dados.clienteId === '' && dados.especialistaId === anterior.especialistaId
  return dados.clienteId === anterior.clienteId
}

/**
 * Inclui o documento (CA-12.1, CA-12.2). Com `substitui`, é a nova versão: o anterior, Vigente e ao alcance de quem
 * altera, passaria a Superado e ficaria ligado ao novo (DF-44, DF-63, CA-12.4) — o único caminho da Equipe para o
 * Superado. A volta é o registro de onde a inclusão foi aberta: como nada é gravado, o documento novo não existe.
 */
export async function incluirDocumento(_estado: EstadoDocumento, formData: FormData): Promise<EstadoDocumento> {
  const usuario = await obterUsuarioAtual()
  const lidos = lerDadosDocumento(formData)
  const arquivo = lerArquivo(formData)

  const [categorias, opcoes] = await Promise.all([listarCategoriasDeDocumento(), opcoesDeVinculoDoDocumento()])
  const dados = completarVinculos(lidos, opcoes)
  const recusa = (erroGeral: string): EstadoDocumento => ({ erros: {}, valores: dados, erroGeral })

  const anterior = dados.substitui ? await obterDocumento(dados.substitui) : null
  if (dados.substitui) {
    if (!anterior || !(await usuarioAlteraDocumento(anterior))) return recusa(SEM_PERMISSAO)
    if (anterior.status !== 'Vigente' || anterior.inativo) return recusa(MENSAGENS_DOCUMENTO.soVigente)
  }

  const erros = validarDocumento(dados, { categorias, opcoes, semClientePermitido: ehAdmin(usuario) })
  if (anterior && !erros.clienteId && !mesmoDono(dados, anterior)) erros.clienteId = MENSAGENS_DOCUMENTO.mesmoDono
  const erroArquivo = erroDoArquivo(arquivo)
  if (erroArquivo) erros.arquivo = erroArquivo
  if (Object.keys(erros).length > 0) return { erros, valores: dados }

  const frase = anterior ? 'Documento incluído. O anterior passou a Superado.' : 'Documento incluído.'
  return { erros: {}, valores: dados, sucesso: { mensagem: mensagemDeSucesso(frase), destino: destinoDaInclusao(dados) } }
}

/**
 * Salva os dados do documento (matriz 4.3, PRD v1.19): nome, categoria, data do documento, vínculos e observações. A
 * mudança iria para o histórico, com o valor anterior e o novo (DF-16). O arquivo não muda: muda por nova versão. A
 * Equipe só no documento de cliente vinculado; o Documento do Especialista sem cliente, só o Administrador (DF-65). O documento com versões ligadas não muda de cliente (CA-12.4), e o documento principal
 * de um contrato continua um contrato ou uma proposta dele (F03).
 */
export async function salvarDocumento(_estado: EstadoDocumento, formData: FormData): Promise<EstadoDocumento> {
  const usuario = await obterUsuarioAtual()
  const lidos = lerDadosDocumento(formData)
  const documento = lidos.id ? await obterDocumento(lidos.id) : null
  if (!documento || !(await usuarioAlteraDocumento(documento))) return { erros: {}, valores: lidos, erroGeral: SEM_PERMISSAO }

  const [categorias, opcoes, contratoPrincipal] = await Promise.all([
    listarCategoriasDeDocumento(),
    opcoesDeVinculoDoDocumento(),
    contratoDoPrincipal(documento.id),
  ])
  const dados = { ...completarVinculos(lidos, opcoes), substitui: '', origem: '' }
  const erros = validarDocumento(dados, { categorias, opcoes, semClientePermitido: ehAdmin(usuario) })

  const comVersoes = documento.substituidoPor !== null || documento.substitui.length > 0
  const mesmoDonoQueAntes =
    dados.clienteId === (documento.clienteId ?? '') &&
    (documento.clienteId !== null || dados.especialistaId === documento.especialistaId)
  if (comVersoes && !erros.clienteId && !mesmoDonoQueAntes) erros.clienteId = MENSAGENS_DOCUMENTO.clienteComVersoes
  if (contratoPrincipal) {
    if (!CATEGORIAS_DO_PRINCIPAL.includes(dados.categoria)) erros.categoria ??= MENSAGENS_DOCUMENTO.principal
    else if (dados.contratoId !== contratoPrincipal) erros.contratoId ??= MENSAGENS_DOCUMENTO.principal
  }
  if (Object.keys(erros).length > 0) return { erros, valores: dados }
  return {
    erros: {},
    valores: dados,
    sucesso: { mensagem: mensagemDeSucesso('Documento salvo.'), destino: `/documentos/${documento.id}` },
  }
}

const recusa = (mensagem: string): ResultadoAcao => ({ ok: false, mensagem })

const sucesso = (frase: string): ResultadoAcao => ({ ok: true, mensagem: mensagemDeSucesso(frase) })

/** O documento ao alcance do Administrador, ou null: a Equipe e o id que não existe recebem a mesma recusa (CA-12.6). */
async function documentoDoAdministrador(id: unknown): Promise<DocumentoDetalhado | null> {
  const usuario = await obterUsuarioAtual()
  return ehAdmin(usuario) && typeof id === 'string' ? await obterDocumento(id) : null
}

const SUCESSO_DO_STATUS: Record<AcaoStatusDocumento, string> = {
  encerrar: 'Documento encerrado.',
  'marcar-superado': 'Documento marcado como Superado.',
  'voltar-a-vigente': 'Documento de volta a Vigente.',
}

/**
 * Muda o status do documento (PRD 6.1), só o Administrador (CA-12.6): encerrar o Vigente, marcá-lo como Superado com o
 * substituto, e voltar o Superado ou o Encerrado a Vigente (correção). O Superado exige o substituto: outro documento
 * Vigente do mesmo cliente, ou do mesmo especialista sem cliente, e os dois ficariam ligados (RN-15, DF-63). Voltar a
 * Vigente desfaria a ligação.
 */
export async function mudarStatusDocumento(id: string, acao: string, substitutoId: string): Promise<ResultadoAcao> {
  const documento = await documentoDoAdministrador(id)
  if (!documento) return recusa(SEM_PERMISSAO)
  if (!(acoesDeStatus(documento.status) as string[]).includes(acao)) {
    return recusa('Esta mudança não vale para o documento neste status.')
  }
  if (acao === 'marcar-superado' && !(await substitutosPossiveis(documento.id)).some((d) => d.id === substitutoId)) {
    return recusa('Escolha o documento que substitui este.')
  }
  return sucesso(SUCESSO_DO_STATUS[acao as AcaoStatusDocumento])
}

/** Inativa o documento, só o Administrador (RN-24): sai das listas e dos painéis padrão e continua na página. */
export async function inativarDocumento(id: string): Promise<ResultadoAcao> {
  const documento = await documentoDoAdministrador(id)
  if (!documento) return recusa(SEM_PERMISSAO)
  if (documento.inativo) return recusa('O documento já está inativo.')
  return sucesso('Documento inativado.')
}

/** Reativa o documento inativo, com o status que tinha (6.1). */
export async function reativarDocumento(id: string): Promise<ResultadoAcao> {
  const documento = await documentoDoAdministrador(id)
  if (!documento) return recusa(SEM_PERMISSAO)
  if (!documento.inativo) return recusa('O documento não está inativo.')
  return sucesso('Documento reativado.')
}

/**
 * Exclui o documento de vez (DF-33, CA-18.4), só o Administrador, com justificativa, que iria para o log técnico. Não
 * exclui o que tem ligação: a substituição, nos dois sentidos, ou o documento principal de um contrato (RN-13). O
 * arquivo errado da Equipe passa por aqui, pedido ao Administrador (EC-80).
 */
export async function excluirDocumento(id: string, justificativa: string): Promise<ResultadoAcao> {
  const documento = await documentoDoAdministrador(id)
  if (!documento) return recusa(SEM_PERMISSAO)
  if (await documentoTemLigacao(documento.id)) return recusa('Este documento tem registros ligados e não pode ser excluído.')
  if (typeof justificativa !== 'string' || !justificativa.trim()) return recusa('Escreva a justificativa da exclusão.')
  return sucesso('Documento excluído.')
}
