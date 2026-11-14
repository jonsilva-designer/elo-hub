import { describe, expect, it } from 'vitest'
import { ITENS_MENU, itemAtivo, itensDoPerfil } from './navegacao'

describe('itemAtivo', () => {
  it('ativa o item para subrotas', () => {
    expect(itemAtivo('/clientes/12', '/clientes')).toBe(true)
  })
  it('não confunde rotas com o mesmo prefixo', () => {
    expect(itemAtivo('/clientes-x', '/clientes')).toBe(false)
  })
  it('ativa na rota exata', () => {
    expect(itemAtivo('/inicio', '/inicio')).toBe(true)
  })
  it('todo /configuracoes/* ativa Configurações', () => {
    expect(itemAtivo('/configuracoes/listas', '/configuracoes/usuarios')).toBe(true)
  })
  it('as avaliações ficam dentro de Clientes (parte 2, 5.1)', () => {
    expect(itemAtivo('/avaliacoes/ava-vertice-3', '/clientes')).toBe(true)
    expect(itemAtivo('/avaliacoes/nova', '/clientes')).toBe(true)
    expect(itemAtivo('/avaliacoes', '/contratos')).toBe(false)
    expect(itemAtivo('/avaliacoes-x', '/clientes')).toBe(false)
  })
})

describe('itensDoPerfil', () => {
  it('Equipe não vê Configurações', () => {
    expect(itensDoPerfil('Equipe').map((i) => i.rotulo)).not.toContain('Configurações')
  })
  it('Administrador vê Configurações', () => {
    expect(itensDoPerfil('Administrador').map((i) => i.rotulo)).toContain('Configurações')
  })
  it('sem usuário, mostra só os itens comuns aos dois perfis', () => {
    expect(itensDoPerfil(null)).toEqual(itensDoPerfil('Equipe'))
  })
  it('mantém a ordem da tabela', () => {
    expect(ITENS_MENU.map((i) => i.rotulo)).toEqual([
      'Início',
      'Minhas atividades',
      'Clientes',
      'Contratos',
      'Escopos',
      'Central ELO',
      'Especialistas',
      'Documentos',
      'Configurações',
    ])
  })
})
