import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { NOME_DO_COOKIE, OPCOES_DO_COOKIE } from '@/lib/acesso/cookie'
import { USUARIOS } from './mock/usuarios'
import type { Usuario } from './tipos'

// Sessão simulada do protótipo (parte 1, 5.2 e 5.4). O proxy só confere se o cookie existe;
// a validação de verdade fica aqui: id desconhecido ou de usuário inativo conta como sem sessão.
// Ler cookies() exige que quem chama esteja dentro de um Suspense (cacheComponents).

export async function gravarSessao(usuarioId: string): Promise<void> {
  ;(await cookies()).set(NOME_DO_COOKIE, usuarioId, OPCOES_DO_COOKIE)
}

export async function apagarSessao(): Promise<void> {
  ;(await cookies()).delete(NOME_DO_COOKIE)
}

/** O usuário do cookie, se existir e estiver ativo. Caso contrário, null. Usada pela página de login. */
export async function obterSessao(): Promise<Usuario | null> {
  const id = (await cookies()).get(NOME_DO_COOKIE)?.value
  if (!id) return null
  return USUARIOS.find((u) => u.id === id && u.status === 'Ativo') ?? null
}

/**
 * O usuário logado, para as telas internas e as funções de leitura. Sem sessão, vai ao login.
 * Memorizada por requisição: o layout e a página leem a sessão uma vez só.
 */
export const obterUsuarioAtual = cache(async (): Promise<Usuario> => {
  const usuario = await obterSessao()
  if (!usuario) redirect('/login')
  return usuario
})
