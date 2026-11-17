import type { EspecialistaDetalhado, StatusEspecialista } from '@/lib/dados/tipos'
import { dataValida } from '@/lib/escopos/validacao'
import { UFS } from '@/lib/ufs'
import { STATUS_ESPECIALISTA } from './regras'

// Validação do cadastro e da edição do especialista (parte 5, 5.5; F11, DF-27), no servidor. As mensagens são
// provisórias (DT-03).

export const MENSAGENS_ESPECIALISTA = {
  nome: 'Informe o nome.',
  especialidade: 'Escolha a especialidade.',
  email: 'Informe o e-mail.',
  emailInvalido: 'Informe um e-mail válido.',
  telefone: 'Informe o telefone.',
  curriculo: 'Informe um link válido, começando com http:// ou https://.',
  data: 'Informe uma data válida.',
  uf: 'Escolha a UF.',
  status: 'Escolha o status.',
}

export type DadosEspecialista = {
  nome: string
  /** AAAA-MM-DD, como o campo de data manda; vazio quando não informado. */
  dataNascimento: string
  especialidade: string
  subespecialidade: string
  email: string
  telefone: string
  cidade: string
  uf: string
  empresa: string
  curriculo: string
  status: string
  observacoes: string
}

export type ErrosEspecialista = Partial<
  Record<'nome' | 'especialidade' | 'email' | 'telefone' | 'curriculo' | 'dataNascimento' | 'uf' | 'status', string>
>

const CAMPOS = [
  'nome',
  'dataNascimento',
  'especialidade',
  'subespecialidade',
  'email',
  'telefone',
  'cidade',
  'uf',
  'empresa',
  'curriculo',
  'status',
  'observacoes',
] as const

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LINK = /^https?:\/\/\S+\.\S+$/

/** Os campos do formulário, sem espaços nas pontas. */
export function lerDadosEspecialista(formData: FormData): DadosEspecialista {
  const dados = {} as DadosEspecialista
  for (const campo of CAMPOS) {
    const valor = formData.get(campo)
    dados[campo] = typeof valor === 'string' ? valor.trim() : ''
  }
  return dados
}

/**
 * Os erros por campo; vazio quando está tudo certo.
 * - `atual`: o especialista em edição, ou null no cadastro interno, que nasce Em análise ou Ativo (6.1).
 * - `especialidades`: a lista oficial (DF-70).
 */
export function validarEspecialista(
  dados: DadosEspecialista,
  contexto: { atual: EspecialistaDetalhado | null; especialidades: string[] },
): ErrosEspecialista {
  const erros: ErrosEspecialista = {}
  if (!dados.nome.trim()) erros.nome = MENSAGENS_ESPECIALISTA.nome
  if (!contexto.especialidades.includes(dados.especialidade)) erros.especialidade = MENSAGENS_ESPECIALISTA.especialidade
  if (!dados.email) erros.email = MENSAGENS_ESPECIALISTA.email
  else if (!EMAIL.test(dados.email)) erros.email = MENSAGENS_ESPECIALISTA.emailInvalido
  if (!dados.telefone) erros.telefone = MENSAGENS_ESPECIALISTA.telefone
  if (dados.curriculo && !LINK.test(dados.curriculo)) erros.curriculo = MENSAGENS_ESPECIALISTA.curriculo
  if (dados.dataNascimento && !dataValida(dados.dataNascimento)) erros.dataNascimento = MENSAGENS_ESPECIALISTA.data
  if (dados.uf && !UFS.includes(dados.uf)) erros.uf = MENSAGENS_ESPECIALISTA.uf

  const permitidos: StatusEspecialista[] = contexto.atual ? STATUS_ESPECIALISTA : ['Em análise', 'Ativo']
  if (!(permitidos as string[]).includes(dados.status)) erros.status = MENSAGENS_ESPECIALISTA.status
  return erros
}
