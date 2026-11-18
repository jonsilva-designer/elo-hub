import { describe, expect, it } from 'vitest'
import type { UsuarioDetalhado } from '@/lib/dados/usuarios-configuracao'
import { filtrarUsuarios } from './filtros'

const u = (nome: string, email: string, status: 'Ativo' | 'Inativo') =>
  ({ id: nome, nome, email, perfil: 'Equipe', status, clientes: [] }) as UsuarioDetalhado

const TODOS = [u('Helena Prado', 'helena@elo', 'Ativo'), u('Marcos Lima', 'marcos@elo', 'Inativo'), u('Rafael Souza', 'rafael@elo', 'Ativo')]

describe('filtros da lista de usuários (CA-18.2)', () => {
  it('sem escolha, os ativos; com Inativo, os inativos; a busca acha nome e e-mail sem acento', () => {
    expect(filtrarUsuarios(TODOS, { busca: '', status: [] }).map((x) => x.nome)).toEqual(['Helena Prado', 'Rafael Souza'])
    expect(filtrarUsuarios(TODOS, { busca: '', status: ['Inativo'] }).map((x) => x.nome)).toEqual(['Marcos Lima'])
    expect(filtrarUsuarios(TODOS, { busca: 'RAFAEL@', status: [] }).map((x) => x.nome)).toEqual(['Rafael Souza'])
    expect(filtrarUsuarios(TODOS, { busca: 'helena prado', status: ['Ativo', 'Inativo'] }).map((x) => x.nome)).toEqual(['Helena Prado'])
  })
})
