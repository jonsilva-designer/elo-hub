// @vitest-environment node
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { GET } from './route'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const pedir = (busca = '') => GET(new NextRequest(`http://localhost/api/exportar/atividades${busca}`))

const linhas = async (busca = '') => (await (await pedir(busca)).text()).replace(/^\uFEFF/, '').split('\r\n')

describe('GET /api/exportar/atividades (DF-75, CA-16.3; parte 4, critério 5)', () => {
  it('o Administrador baixa o CSV, com BOM e o nome datado', async () => {
    entrarComo('usr-helena')
    const resposta = await pedir()
    expect(resposta.status).toBe(200)
    expect(resposta.headers.get('content-type')).toContain('text/csv')
    expect(resposta.headers.get('content-disposition')).toMatch(/^attachment; filename="atividades-\d{4}-\d{2}-\d{2}\.csv"$/)
    expect(resposta.headers.get('cache-control')).toBe('no-store')
    const bytes = new Uint8Array(await resposta.clone().arrayBuffer())
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
  })

  it('sem filtro no endereço, as da pessoa que entrou, como a tela', async () => {
    entrarComo('usr-helena')
    expect(await linhas()).toHaveLength(5)
  })

  it('respeita os filtros do endereço, com o executor (CA-08.8)', async () => {
    entrarComo('usr-helena')
    const todas = await linhas('?responsavel=todos')
    expect(todas).toHaveLength(13)
    const atrasadas = await linhas('?responsavel=todos&prazo=Atrasada')
    expect(atrasadas).toHaveLength(4)
    const corpo = (await linhas('?responsavel=todos&busca=vistoria')).join('\n')
    expect(corpo).toContain('Ana Ribeiro (SSMA do cliente)')
  })

  it('a Equipe recebe 403', async () => {
    entrarComo('usr-rafael')
    const resposta = await pedir()
    expect(resposta.status).toBe(403)
    expect(await resposta.text()).toBe('Você não tem permissão para exportar.')
  })

  it('sem sessão, 401', async () => {
    const resposta = await pedir()
    expect(resposta.status).toBe(401)
  })
})
