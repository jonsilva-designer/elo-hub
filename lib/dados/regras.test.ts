import { describe, expect, it } from 'vitest'
import { CLIENTES } from './mock/clientes'
import { USUARIOS, VINCULOS } from './mock/usuarios'
import { ehAdmin, podeVerCliente, temVinculo } from './regras'

const usuario = (id: string) => USUARIOS.find((u) => u.id === id)!
const helena = usuario('usr-helena')
const rafael = usuario('usr-rafael')
const DO_RAFAEL = ['cli-vertice', 'cli-atlantica', 'cli-rede-norte']

describe('ehAdmin', () => {
  it('é verdadeiro para o Administrador e falso para a Equipe', () => {
    expect(ehAdmin(helena)).toBe(true)
    expect(ehAdmin(rafael)).toBe(false)
  })
})

describe('temVinculo', () => {
  it('olha só a lista de vínculos', () => {
    expect(temVinculo(rafael, 'cli-vertice', VINCULOS)).toBe(true)
    expect(temVinculo(rafael, 'cli-montareal', VINCULOS)).toBe(false)
    expect(temVinculo(rafael, 'cli-elo', VINCULOS)).toBe(false)
  })

  it('é falso para o Administrador, que não tem vínculos', () => {
    for (const c of CLIENTES) expect(temVinculo(helena, c.id, VINCULOS)).toBe(false)
  })
})

describe('podeVerCliente', () => {
  it('o Administrador vê os 8 clientes', () => {
    expect(CLIENTES).toHaveLength(8)
    for (const c of CLIENTES) expect(podeVerCliente(helena, c.id, VINCULOS), c.id).toBe(true)
  })

  it('a Equipe vê só os clientes vinculados', () => {
    for (const c of CLIENTES) {
      expect(podeVerCliente(rafael, c.id, VINCULOS), c.id).toBe(DO_RAFAEL.includes(c.id))
    }
  })
})
