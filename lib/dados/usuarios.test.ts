import { describe, expect, it } from 'vitest'
import { encontrarUsuarioPorEmail, obterExemplosDoPrototipo } from './usuarios'

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
