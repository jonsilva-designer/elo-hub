import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { encontrarUsuarioPorEmail, listarResponsaveis, obterExemplosDoPrototipo } from './usuarios'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

describe('encontrarUsuarioPorEmail', () => {
  it('ignora espaços nas pontas e maiúsculas', async () => {
    expect(await encontrarUsuarioPorEmail('  HELENA.PRADO@ELOGOVERNANCE.COM.BR ')).toMatchObject({ id: 'usr-helena' })
  })

  it('também devolve o usuário inativo, para o login dar o aviso certo', async () => {
    expect(await encontrarUsuarioPorEmail('marcos.lima@elogovernance.com.br')).toMatchObject({
      id: 'usr-marcos',
      status: 'Inativo',
    })
  })

  it('devolve null para um e-mail sem cadastro', async () => {
    expect(await encontrarUsuarioPorEmail('ninguem@elogovernance.com.br')).toBeNull()
  })
})

describe('obterExemplosDoPrototipo', () => {
  it('traz os perfis de exemplo do bloco Protótipo do login', async () => {
    const exemplos = await obterExemplosDoPrototipo()
    expect(exemplos.administrador).toMatchObject({ nome: 'Helena Prado', perfil: 'Administrador' })
    expect(exemplos.equipe).toMatchObject({ nome: 'Rafael Souza', perfil: 'Equipe' })
    expect(exemplos.clientesDaEquipe).toBe(3)
    expect(exemplos.emailInativo).toBe('marcos.lima@elogovernance.com.br')
  })
})

describe('listarResponsaveis (RN-19, CA-01.6)', () => {
  it('traz os Administradores ativos e a Equipe ativa vinculada, sem o inativo', async () => {
    entrarComo('usr-helena')
    expect((await listarResponsaveis('cli-vertice')).map((u) => u.nome)).toEqual(['Helena Prado', 'Rafael Souza'])
    expect((await listarResponsaveis('cli-montareal')).map((u) => u.nome)).toEqual(['Helena Prado'])
  })

  it('fora do vínculo, lista vazia', async () => {
    entrarComo('usr-rafael')
    expect(await listarResponsaveis('cli-montareal')).toEqual([])
  })
})
