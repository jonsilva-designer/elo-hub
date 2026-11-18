import type { Perfil } from '@/lib/dados/tipos'
import { emailValido } from './regras'

// Validação do cadastro e da edição do usuário (parte 8, 4.1; F01), no servidor. As mensagens são provisórias (DT-03).

export const MENSAGENS_USUARIO = {
  nome: 'Informe o nome.',
  email: 'Informe um e-mail válido.',
  emailRepetido: 'Já existe um usuário com este e-mail.',
  perfil: 'Escolha o perfil.',
  clientes: 'Escolha pelo menos um cliente.',
  ultimoAdministrador: 'O último Administrador ativo não passa para Equipe.',
  ultimoInativado: 'O último Administrador ativo não pode ser inativado.',
  comItens: 'Há itens abertos sob a responsabilidade desta pessoa. Redistribua os itens antes de inativar.',
  itens: 'Escolha pelo menos um item.',
  novoResponsavel: 'Escolha o novo responsável.',
  semVinculo: 'O novo responsável precisa ter vínculo com o cliente de cada item.',
  vinculoComItens: (cliente: string) =>
    `Não é possível tirar o vínculo com ${cliente}: há itens abertos sob a responsabilidade desta pessoa.`,
}

export const PERFIS: Perfil[] = ['Administrador', 'Equipe']

export type DadosUsuario = { id: string; nome: string; email: string; perfil: string; clienteIds: string[] }

export type ErrosUsuario = Partial<Record<'nome' | 'email' | 'perfil' | 'clienteIds', string>>

/** Os campos do formulário, sem espaços nas pontas. Os clientes vêm de vários campos `clienteIds`, sem repetir. */
export function lerDadosUsuario(formData: FormData): DadosUsuario {
  const texto = (nome: string) => {
    const valor = formData.get(nome)
    return typeof valor === 'string' ? valor.trim() : ''
  }
  const clienteIds = formData.getAll('clienteIds').filter((v): v is string => typeof v === 'string' && v !== '')
  return { id: texto('id'), nome: texto('nome'), email: texto('email'), perfil: texto('perfil'), clienteIds: [...new Set(clienteIds)] }
}

/**
 * Os erros por campo. O contexto vem do servidor: os e-mails dos outros usuários (sem o próprio, na edição), os
 * clientes que podem ser vinculados e se a pessoa é o último Administrador ativo (DF-37).
 */
export function validarUsuario(
  dados: DadosUsuario,
  contexto: { emailsDosOutros: string[]; clientes: string[]; ultimoAdministrador: boolean },
): ErrosUsuario {
  const erros: ErrosUsuario = {}
  if (!dados.nome) erros.nome = MENSAGENS_USUARIO.nome
  if (!emailValido(dados.email)) erros.email = MENSAGENS_USUARIO.email
  else if (contexto.emailsDosOutros.some((e) => e.toLowerCase() === dados.email.toLowerCase())) {
    erros.email = MENSAGENS_USUARIO.emailRepetido
  }
  if (!(PERFIS as string[]).includes(dados.perfil)) erros.perfil = MENSAGENS_USUARIO.perfil
  else if (dados.perfil === 'Equipe' && contexto.ultimoAdministrador) erros.perfil = MENSAGENS_USUARIO.ultimoAdministrador
  // A Equipe acompanha os clientes vinculados (DF-23); o Administrador vê todos e não tem vínculo (RN-01).
  if (
    dados.perfil === 'Equipe' &&
    !erros.perfil &&
    (dados.clienteIds.length === 0 || !dados.clienteIds.every((c) => contexto.clientes.includes(c)))
  ) {
    erros.clienteIds = MENSAGENS_USUARIO.clientes
  }
  return erros
}
