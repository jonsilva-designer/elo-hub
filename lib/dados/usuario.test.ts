import { describe, expect, it } from 'vitest'
import { obterUsuarioAtual } from './usuario'

describe('obterUsuarioAtual', () => {
  it('é assíncrona, como a leitura da sessão que vai substituí-la', async () => {
    const resultado = obterUsuarioAtual()
    expect(resultado).toBeInstanceOf(Promise)
    expect(await resultado).toEqual({ nome: 'Helena Prado', perfil: 'Administrador' })
  })
})
