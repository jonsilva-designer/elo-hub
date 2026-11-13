import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cookiesFalsos, destinoDe, entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { apagarSessao, gravarSessao, obterSessao, obterUsuarioAtual } from './sessao'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

describe('sessão', () => {
  it('sem cookie, não há sessão e as telas internas vão ao login', async () => {
    expect(await obterSessao()).toBeNull()
    expect(await destinoDe(obterUsuarioAtual())).toBe('/login')
  })

  it.each([
    ['vazio', ''],
    ['de um id que não existe', 'usr-inexistente'],
    ['de um usuário inativo', 'usr-marcos'],
  ])('cookie %s conta como sem sessão (RNF-02)', async (_caso, valor) => {
    cookiesFalsos.set('elo_sessao', valor)
    expect(await obterSessao()).toBeNull()
    expect(await destinoDe(obterUsuarioAtual())).toBe('/login')
  })

  it('cookie de um usuário ativo devolve o usuário', async () => {
    entrarComo('usr-helena')
    expect(await obterSessao()).toMatchObject({ id: 'usr-helena', nome: 'Helena Prado', perfil: 'Administrador' })
    expect(await obterUsuarioAtual()).toMatchObject({ id: 'usr-helena' })
  })

  it('gravarSessao grava o id em elo_sessao, só para o servidor e sem data de validade', async () => {
    await gravarSessao('usr-rafael')
    expect(cookiesFalsos.get('elo_sessao')?.value).toBe('usr-rafael')
    expect(cookiesFalsos.ultimasOpcoes).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' })
    expect(cookiesFalsos.ultimasOpcoes).not.toHaveProperty('maxAge')
    expect(cookiesFalsos.ultimasOpcoes).not.toHaveProperty('expires')
  })

  it('apagarSessao remove o cookie', async () => {
    entrarComo('usr-helena')
    await apagarSessao()
    expect(cookiesFalsos.has('elo_sessao')).toBe(false)
  })
})
