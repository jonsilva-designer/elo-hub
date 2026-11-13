import { describe, expect, it } from 'vitest'
import { cnpjValido } from '@/lib/cnpj'
import { CLIENTES } from './clientes'
import { SEGMENTOS } from './listas'
import { USUARIOS, VINCULOS } from './usuarios'

const digitos = (cnpj: string) => cnpj.replace(/\D/g, '')

describe('clientes de exemplo', () => {
  it('têm CNPJ válido e sem repetição (DF-05)', () => {
    for (const c of CLIENTES) expect(cnpjValido(c.cnpj), `${c.id} ${c.cnpj}`).toBe(true)
    expect(new Set(CLIENTES.map((c) => digitos(c.cnpj))).size).toBe(CLIENTES.length)
  })

  it('só o cadastro da ELO tem a marca DF-40, com o CNPJ do Apêndice C', () => {
    const marcados = CLIENTES.filter((c) => c.ehCadastroElo)
    expect(marcados.map((c) => c.id)).toEqual(['cli-elo'])
    expect(marcados[0]).toMatchObject({
      razaoSocial: 'ELO HUB Governança Inteligente LTDA',
      cnpj: '68.308.773/0001-73',
      status: 'Ativo',
    })
  })

  it('usam só segmentos da lista oficial', () => {
    for (const c of CLIENTES) if (c.segmento) expect(SEGMENTOS, c.id).toContain(c.segmento)
  })
})

describe('segmentos', () => {
  it('são os 11 do Apêndice C, na ordem do PRD (DF-70)', () => {
    expect(SEGMENTOS).toEqual([
      'Óleo e gás',
      'Portuário e logística',
      'Indústria',
      'Construção e montagem',
      'Manutenção e serviços industriais',
      'Serviços gerais',
      'Offshore e Serviços Marítimos',
      'Infraestrutura',
      'Energia',
      'Mineração',
      'Tecnologia',
    ])
  })
})

describe('usuários e vínculos de exemplo', () => {
  it('todo vínculo aponta para um usuário e um cliente que existem', () => {
    for (const v of VINCULOS) {
      expect(USUARIOS.some((u) => u.id === v.usuarioId), v.usuarioId).toBe(true)
      expect(CLIENTES.some((c) => c.id === v.clienteId), v.clienteId).toBe(true)
    }
  })

  it('o Rafael tem três vínculos e o Marcos está inativo', () => {
    const doRafael = VINCULOS.filter((v) => v.usuarioId === 'usr-rafael').map((v) => v.clienteId)
    expect(doRafael).toEqual(['cli-vertice', 'cli-atlantica', 'cli-rede-norte'])
    expect(USUARIOS.find((u) => u.id === 'usr-marcos')?.status).toBe('Inativo')
  })

  it('os e-mails são do domínio da ELO, em minúsculas e sem repetição', () => {
    for (const u of USUARIOS) {
      expect(u.email).toBe(u.email.toLowerCase())
      expect(u.email).toMatch(/@elogovernance\.com\.br$/)
    }
    expect(new Set(USUARIOS.map((u) => u.email)).size).toBe(USUARIOS.length)
  })
})
