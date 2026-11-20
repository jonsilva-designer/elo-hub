import { describe, expect, it } from 'vitest'
import { clientesQueSaem } from './regras'

const A = { id: 'cli-a', nome: 'A' }
const B = { id: 'cli-b', nome: 'B' }
const C = { id: 'cli-c', nome: 'C' }

describe('clientesQueSaem (DF-36, CA-01.7)', () => {
  it('na Equipe que continua Equipe, saem os vínculos desmarcados', () => {
    expect(clientesQueSaem({ perfil: 'Equipe', clientes: [A, B] }, { perfil: 'Equipe', clienteIds: ['cli-a'] }, [A, B, C])).toEqual([B])
  })

  it('o Administrador que passa para Equipe deixa todos os clientes que não ficaram marcados (revisão do código)', () => {
    expect(clientesQueSaem({ perfil: 'Administrador', clientes: [] }, { perfil: 'Equipe', clienteIds: ['cli-b'] }, [A, B, C])).toEqual([A, C])
  })

  it('quem fica ou passa a Administrador não deixa cliente nenhum', () => {
    expect(clientesQueSaem({ perfil: 'Equipe', clientes: [A] }, { perfil: 'Administrador', clienteIds: [] }, [A, B])).toEqual([])
    expect(clientesQueSaem({ perfil: 'Administrador', clientes: [] }, { perfil: 'Administrador', clienteIds: [] }, [A, B])).toEqual([])
  })
})
