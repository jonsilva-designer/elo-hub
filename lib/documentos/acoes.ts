'use server'

import { obterDocumento, usuarioAlteraDocumento } from '@/lib/dados/documentos'
import { listarCategoriasDeDocumento } from '@/lib/dados/listas'
import { opcoesDeVinculoDoDocumento } from '@/lib/dados/opcoes-documento'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import type { DocumentoDetalhado } from '@/lib/dados/tipos'
import { mensagemDeSucesso, SEM_PERMISSAO } from '@/lib/resultado-acao'
import type { EstadoDocumento } from './estados'
import { erroDoArquivo } from './regras'
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
