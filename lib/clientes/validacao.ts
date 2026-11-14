import { cnpjValido } from '@/lib/cnpj'
import type { Cliente } from '@/lib/dados/tipos'
import { nomeDoCliente } from './filtros'

// Validação do cadastro do cliente (parte 2, 5.5), no servidor. As mensagens são provisórias (DT-03).

export const MENSAGENS_CLIENTE = {
  razaoSocial: 'Informe a razão social.',
  cnpjVazio: 'Informe o CNPJ.',
  cnpjInvalido: 'CNPJ inválido. Confira os números.',
  cnpjRepetido: (nome: string) => `Já existe um cliente com este CNPJ: ${nome}.`,
  email: 'Informe um e-mail válido.',
  status: 'Escolha o status.',
  justificativa: 'Escreva a justificativa da mudança.',
  statusInativo: 'Para reativar, use Reativar na página do cliente.',
}

export type DadosCliente = {
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  segmento: string
  cidade: string
  uf: string
  status: string
  justificativa: string
  contatoPrincipal: string
  cargo: string
  telefone: string
  email: string
  observacoes: string
}

export type ErrosCliente = Partial<Record<'razaoSocial' | 'cnpj' | 'email' | 'status' | 'justificativa', string>>

const CAMPOS: (keyof DadosCliente)[] = [
  'razaoSocial',
  'nomeFantasia',
  'cnpj',
  'segmento',
  'cidade',
  'uf',
  'status',
  'justificativa',
  'contatoPrincipal',
  'cargo',
  'telefone',
  'email',
  'observacoes',
]

/** Os campos do formulário, sem espaços nas pontas. O que falta vira texto vazio. */
export function lerDadosCliente(formData: FormData): DadosCliente {
  const dados = {} as DadosCliente
  for (const campo of CAMPOS) {
    const valor = formData.get(campo)
    dados[campo] = typeof valor === 'string' ? valor.trim() : ''
  }
  return dados
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Os erros por campo; vazio quando está tudo certo.
 * - `atual`: o cliente em edição, ou null no cadastro.
 * - `comMesmoCnpj`: o cliente que já tem o CNPJ digitado, se houver. Na edição, o próprio não conta.
 */
export function validarCliente(
  dados: DadosCliente,
  contexto: { atual: Cliente | null; comMesmoCnpj: Cliente | null },
): ErrosCliente {
  const { atual, comMesmoCnpj } = contexto
  const erros: ErrosCliente = {}

  if (!dados.razaoSocial.trim()) erros.razaoSocial = MENSAGENS_CLIENTE.razaoSocial

  if (!dados.cnpj.trim()) erros.cnpj = MENSAGENS_CLIENTE.cnpjVazio
  else if (!cnpjValido(dados.cnpj)) erros.cnpj = MENSAGENS_CLIENTE.cnpjInvalido
  else if (comMesmoCnpj && comMesmoCnpj.id !== atual?.id) {
    erros.cnpj = MENSAGENS_CLIENTE.cnpjRepetido(nomeDoCliente(comMesmoCnpj))
  }

  if (dados.email.trim() && !EMAIL.test(dados.email.trim())) erros.email = MENSAGENS_CLIENTE.email

  // O cliente nasce Prospect ou Ativo (6.1). Inativar e reativar ficam fora do formulário.
  if (atual?.status === 'Inativo') {
    if (dados.status !== 'Inativo') erros.status = MENSAGENS_CLIENTE.statusInativo
  } else if (dados.status !== 'Prospect' && dados.status !== 'Ativo') {
    erros.status = MENSAGENS_CLIENTE.status
  } else if (atual?.status === 'Ativo' && dados.status === 'Prospect' && !dados.justificativa.trim()) {
    // Ativo para Prospect é uma correção fora das transições da 6.1 (RN-22).
    erros.justificativa = MENSAGENS_CLIENTE.justificativa
  }

  return erros
}
