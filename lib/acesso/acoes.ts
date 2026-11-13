'use server'

import { redirect } from 'next/navigation'
import { apagarSessao, gravarSessao } from '@/lib/dados/sessao'
import type { Perfil } from '@/lib/dados/tipos'
import { encontrarUsuarioPorEmail, obterExemplosDoPrototipo } from '@/lib/dados/usuarios'
import type { EstadoDefinirSenha, EstadoEntrar, EstadoRecuperacao } from './estados'
import { destinoSeguro } from './rotas'
import { MENSAGENS, validarEmail, validarEntrada, validarNovaSenha } from './validacao'

// Ações das telas de acesso (parte 1, 5.4). Na Etapa 3, entrar passa a usar o Supabase Auth.
// O redirect fica fora de qualquer try: ele interrompe a execução lançando um erro.

const texto = (valor: FormDataEntryValue | null) => (typeof valor === 'string' ? valor : '')

/** Entrar com e-mail e senha. No protótipo, qualquer senha não vazia serve para um e-mail cadastrado. */
export async function entrar(_estado: EstadoEntrar, formData: FormData): Promise<EstadoEntrar> {
  const email = texto(formData.get('email'))
  const senha = texto(formData.get('senha'))

  const erros = validarEntrada(email, senha)
  if (erros.email || erros.senha) return { email, erros }

  const usuario = await encontrarUsuarioPorEmail(email)
  // Não revela se o e-mail existe.
  if (!usuario) return { email, erros: {}, erroGeral: MENSAGENS.credenciaisIncorretas }
  if (usuario.status !== 'Ativo') return { email, erros: {}, erroGeral: MENSAGENS.usuarioInativo }

  await gravarSessao(usuario.id)
  redirect(destinoSeguro(formData.get('destino')))
}

/**
 * Botões do protótipo: entra direto com o perfil de exemplo. Sai inteiro na Etapa 3.
 * Os argumentos ligados (`.bind`) chegam do navegador e podem ser forjados: perfil desconhecido volta ao login.
 */
export async function entrarComoPerfil(perfil: Perfil, destino: string): Promise<void> {
  const exemplos = await obterExemplosDoPrototipo()
  const usuario =
    perfil === 'Administrador' ? exemplos.administrador : perfil === 'Equipe' ? exemplos.equipe : null
  if (!usuario) redirect('/login')

  await gravarSessao(usuario.id)
  redirect(destinoSeguro(destino))
}

/**
 * Pedir o link de nova senha. Com e-mail válido, a resposta é a mesma para quem tem cadastro e para
 * quem não tem, para não revelar quem é usuário (CA-01.5). Nenhum e-mail é enviado no protótipo.
 */
export async function pedirRecuperacao(_estado: EstadoRecuperacao, formData: FormData): Promise<EstadoRecuperacao> {
  const email = texto(formData.get('email'))
  const erro = validarEmail(email)
  if (erro) return { email, erro, enviado: false }
  return { email, enviado: true }
}

/**
 * Definir a senha, no convite de um usuário novo e na redefinição (DF-04). No protótipo, nada é gravado:
 * com a senha válida, vai ao login com o aviso. O link expirado ou já usado fica para a Etapa 3.
 */
export async function definirSenha(_estado: EstadoDefinirSenha, formData: FormData): Promise<EstadoDefinirSenha> {
  const erros = validarNovaSenha(texto(formData.get('senha')), texto(formData.get('confirmacao')))
  if (erros.senha || erros.confirmacao) return { erros }
  redirect('/login?aviso=senha-definida')
}

/** Botão Sair, no rodapé da lateral e da gaveta. */
export async function sair(): Promise<void> {
  await apagarSessao()
  redirect('/login')
}
