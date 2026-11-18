import { podeVerCliente } from '@/lib/dados/regras'
import type { Documento, StatusDocumento, Usuario, Vinculo } from '@/lib/dados/tipos'

// Regras do documento (F12; PRD 6.1). Nenhum status é final; só o Administrador muda, com a exceção da nova versão
// (DF-44). O acesso segue o cliente (RN-16); sem cliente, só o Documento do Especialista, que todos os logados veem
// e só o Administrador altera (DF-65).

export const STATUS_DOCUMENTO: StatusDocumento[] = ['Vigente', 'Superado', 'Encerrado']

/** A categoria que aceita documento sem cliente e exige o especialista (DF-65). Código fixo (arquitetura 4.3). */
export const DOCUMENTO_DO_ESPECIALISTA = 'Documento do Especialista'

/** As categorias que podem ser o documento principal do contrato (F03). */
export const CATEGORIAS_DO_PRINCIPAL = ['Contrato', 'Proposta Comercial']

/** Os formatos aceitos (DF-72): PDF, Word, Excel, PowerPoint, imagens e e-mails salvos. */
export const EXTENSOES_ACEITAS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.msg', '.eml']

/** O `accept` do campo de arquivo. */
export const ACEITAR_ARQUIVO = EXTENSOES_ACEITAS.join(',')

/** 10 MB por arquivo (DF-72). */
export const TAMANHO_MAXIMO = 10 * 1024 * 1024

export const MENSAGENS_ARQUIVO = {
  falta: 'Escolha o arquivo.',
  vazio: 'O arquivo está vazio.',
  formato:
    'Formato não aceito. Envie PDF, Word, Excel, PowerPoint, imagem (.jpg ou .png) ou e-mail salvo (.msg ou .eml).',
  tamanho: 'O arquivo passa de 10 MB.',
}

/** A extensão do nome, com o ponto e em minúsculas; '' sem extensão. */
function extensao(nome: string): string {
  const i = nome.lastIndexOf('.')
  return i < 0 ? '' : nome.slice(i).toLocaleLowerCase('en')
}

/**
 * O erro do arquivo, ou null (CA-12.2, DF-72). Confere pela extensão, que é o que o usuário vê: o tipo informado
 * pelo navegador varia para .msg e .eml. A tela confere antes de enviar e o servidor confere de novo.
 */
export function erroDoArquivo(arquivo: { nome: string; tamanho: number } | null): string | null {
  if (!arquivo) return MENSAGENS_ARQUIVO.falta
  if (!EXTENSOES_ACEITAS.includes(extensao(arquivo.nome))) return MENSAGENS_ARQUIVO.formato
  if (arquivo.tamanho <= 0) return MENSAGENS_ARQUIVO.vazio
  if (arquivo.tamanho > TAMANHO_MAXIMO) return MENSAGENS_ARQUIVO.tamanho
  return null
}

/**
 * O nome do arquivo higienizado (arquitetura 6): sem a pasta, sem caracteres de controle nem os proibidos em nomes de
 * arquivo, sem pontos e espaços nas pontas. Vazio vira "arquivo".
 */
export function nomeDeArquivoSeguro(nome: string): string {
  const semPasta = nome.split(/[\\/]/).pop() ?? ''
  const limpo = semPasta.replace(/[\u0000-\u001f\u007f<>:"|?*]/g, '').replace(/^[\s.]+|[\s.]+$/g, '')
  return limpo || 'arquivo'
}

/** O Documento do Especialista sem cliente (DF-65). */
export function semCliente(d: Pick<Documento, 'clienteId'>): boolean {
  return d.clienteId === null
}

/** Ver e baixar: com cliente, pelo vínculo (RN-01, RN-16); sem cliente, todos os logados, como os especialistas (DF-65). */
export function podeVerDocumento(d: Pick<Documento, 'clienteId'>, usuario: Usuario, vinculos: readonly Vinculo[]): boolean {
  return d.clienteId === null || podeVerCliente(usuario, d.clienteId, vinculos)
}

/**
 * Incluir, alterar os dados e enviar nova versão (matriz 4.3): o Administrador sempre; a Equipe só no documento de
 * cliente vinculado. Sem cliente, só o Administrador (DF-65).
 */
export function podeAlterarDocumento(d: Pick<Documento, 'clienteId'>, usuario: Usuario, vinculos: readonly Vinculo[]): boolean {
  if (usuario.perfil === 'Administrador') return true
  return d.clienteId !== null && podeVerCliente(usuario, d.clienteId, vinculos)
}

export type AcaoStatusDocumento = 'encerrar' | 'marcar-superado' | 'voltar-a-vigente'

/** As mudanças de status da 6.1, só do Administrador (CA-12.6). */
export function acoesDeStatus(status: StatusDocumento): AcaoStatusDocumento[] {
  return status === 'Vigente' ? ['encerrar', 'marcar-superado'] : ['voltar-a-vigente']
}
