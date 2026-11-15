// @vitest-environment node
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { GET } from './route'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const pedir = (busca = '') => GET(new NextRequest(`http://localhost/api/exportar/contratos${busca}`))

describe('GET /api/exportar/contratos (DF-75, CA-16.3, critério 3)', () => {
  it('o Administrador baixa o CSV, com BOM e o nome datado', async () => {
    entrarComo('usr-helena')
    const resposta = await pedir()
    expect(resposta.status).toBe(200)
    expect(resposta.headers.get('content-type')).toContain('text/csv')
    expect(resposta.headers.get('content-disposition')).toMatch(/^attachment; filename="contratos-\d{4}-\d{2}-\d{2}\.csv"$/)
    expect(resposta.headers.get('cache-control')).toBe('no-store')
    const bytes = new Uint8Array(await resposta.clone().arrayBuffer())
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    const corpo = await resposta.text()
    expect(corpo.split('\r\n')).toHaveLength(12)
  })

  it('respeita os filtros do endereço', async () => {
    entrarComo('usr-helena')
    const corpo = await (await pedir('?status=Suspenso')).text()
    expect(corpo).toContain('CT-2026-019')
    expect(corpo).not.toContain('CT-2025-031')
  })

  it('a Equipe recebe 403', async () => {
    entrarComo('usr-rafael')
    const resposta = await pedir()
    expect(resposta.status).toBe(403)
    expect(await resposta.text()).toBe('Você não tem permissão para exportar.')
  })

  it('sem sessão válida, 401', async () => {
    const resposta = await pedir()
    expect(resposta.status).toBe(401)
    expect(await resposta.text()).toBe('Entre na plataforma para exportar.')
  })
})
