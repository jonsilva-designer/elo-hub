import { describe, expect, it } from 'vitest'
import type { Cliente } from '@/lib/dados/tipos'
import { abasDoCliente, abaValida, ROTULOS_DAS_ABAS } from './abas'

const vertice: Cliente = { id: 'cli-vertice', razaoSocial: 'Vértice', cnpj: '21.473.509/0001-21', status: 'Ativo', ehCadastroElo: false }
const elo: Cliente = { ...vertice, id: 'cli-elo', ehCadastroElo: true }

describe('abas da página do cliente (parte 2, 5.6)', () => {
  it('um cliente tem as 7 abas, na ordem', () => {
    expect(abasDoCliente(vertice).map((a) => ROTULOS_DAS_ABAS[a])).toEqual([
      'Resumo',
      'Maturidade',
      'Contratos',
      'Escopos',
      'Demandas',
      'Documentos',
      'Histórico',
    ])
  })

  it('o cadastro da ELO só tem Resumo, Demandas, Documentos e Histórico (DF-40)', () => {
    expect(abasDoCliente(elo)).toEqual(['resumo', 'demandas', 'documentos', 'historico'])
  })

  it('a aba do endereço vale se o cliente a tem; senão, Resumo', () => {
    expect(abaValida('maturidade', vertice)).toBe('maturidade')
    expect(abaValida('xyz', vertice)).toBe('resumo')
    expect(abaValida(undefined, vertice)).toBe('resumo')
    expect(abaValida('maturidade', elo)).toBe('resumo')
    expect(abaValida('demandas', elo)).toBe('demandas')
  })
})
