import { cnpjValido } from '@/lib/cnpj'
import { dataValida } from '@/lib/escopos/validacao'
import { UFS } from '@/lib/ufs'
import { emailValido } from '@/lib/usuarios/regras'

// Validação dos formulários do site (parte 9, 4.1 e 4.2; F19, DF-76, DF-27), no servidor. As mensagens são provisórias
// (DT-03).

export const MENSAGENS_SITE = {
  nome: 'Informe o seu nome.',
  empresa: 'Informe a empresa.',
  cnpj: 'Informe um CNPJ válido.',
  email: 'Informe um e-mail válido.',
  telefoneDiagnostico: 'Informe o telefone ou WhatsApp.',
  telefone: 'Informe o telefone.',
  uf: 'Escolha uma UF da lista.',
  segmento: 'Escolha um segmento da lista.',
  especialidade: 'Escolha a especialidade.',
  data: 'Informe uma data válida.',
  curriculo: 'Informe um link que comece com http:// ou https://.',
  aviso: 'Para enviar, marque o aviso.',
  consentimento: 'Para enviar, aceite o uso dos dados.',
}

const CAMPOS_DIAGNOSTICO = [
  'nome',
  'empresa',
  'cnpj',
  'cargo',
  'email',
  'telefone',
  'cidade',
  'uf',
  'segmento',
  'contratantes',
  'mensagem',
  'consentimento',
] as const

const CAMPOS_CANDIDATURA = [
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
  'aviso',
  'consentimento',
] as const

export type DadosDiagnostico = Record<(typeof CAMPOS_DIAGNOSTICO)[number], string>
export type DadosCandidatura = Record<(typeof CAMPOS_CANDIDATURA)[number], string>
export type ErrosSite = Partial<Record<string, string>>

function ler<C extends string>(formData: FormData, campos: readonly C[]): Record<C, string> {
  const dados = {} as Record<C, string>
  for (const campo of campos) {
    const valor = formData.get(campo)
    dados[campo] = typeof valor === 'string' ? valor.trim() : ''
  }
  return dados
}

export const lerDiagnostico = (formData: FormData): DadosDiagnostico => ler(formData, CAMPOS_DIAGNOSTICO)
export const lerCandidatura = (formData: FormData): DadosCandidatura => ler(formData, CAMPOS_CANDIDATURA)

const marcado = (valor: string) => valor === 'sim'

/** O diagnóstico (DF-76): obrigatórios nome, empresa, CNPJ válido, e-mail e telefone, e o consentimento (CA-19.2). */
export function validarDiagnostico(d: DadosDiagnostico, segmentos: readonly string[]): ErrosSite {
  const erros: ErrosSite = {}
  if (!d.nome) erros.nome = MENSAGENS_SITE.nome
  if (!d.empresa) erros.empresa = MENSAGENS_SITE.empresa
  if (!cnpjValido(d.cnpj)) erros.cnpj = MENSAGENS_SITE.cnpj
  if (!emailValido(d.email)) erros.email = MENSAGENS_SITE.email
  if (!d.telefone) erros.telefone = MENSAGENS_SITE.telefoneDiagnostico
  if (d.uf && !UFS.includes(d.uf)) erros.uf = MENSAGENS_SITE.uf
  if (d.segmento && !segmentos.includes(d.segmento)) erros.segmento = MENSAGENS_SITE.segmento
  if (!marcado(d.consentimento)) erros.consentimento = MENSAGENS_SITE.consentimento
  return erros
}

/**
 * A candidatura (F11, DF-27): obrigatórios nome, especialidade, e-mail e telefone; a data e o link, quando informados,
 * precisam ser válidos; o aviso e o consentimento, marcados (CA-19.2).
 */
export function validarCandidatura(d: DadosCandidatura, especialidades: readonly string[]): ErrosSite {
  const erros: ErrosSite = {}
  if (!d.nome) erros.nome = MENSAGENS_SITE.nome
  if (d.dataNascimento && !dataValida(d.dataNascimento)) erros.dataNascimento = MENSAGENS_SITE.data
  if (!especialidades.includes(d.especialidade)) erros.especialidade = MENSAGENS_SITE.especialidade
  if (!emailValido(d.email)) erros.email = MENSAGENS_SITE.email
  if (!d.telefone) erros.telefone = MENSAGENS_SITE.telefone
  if (d.uf && !UFS.includes(d.uf)) erros.uf = MENSAGENS_SITE.uf
  if (d.curriculo && !/^https?:\/\/\S+$/i.test(d.curriculo)) erros.curriculo = MENSAGENS_SITE.curriculo
  if (!marcado(d.aviso)) erros.aviso = MENSAGENS_SITE.aviso
  if (!marcado(d.consentimento)) erros.consentimento = MENSAGENS_SITE.consentimento
  return erros
}
