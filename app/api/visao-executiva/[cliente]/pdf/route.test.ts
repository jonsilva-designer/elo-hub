// @vitest-environment node
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { GET } from './route'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const gerar = (cliente: string, busca = '') =>
  GET(new NextRequest(`http://localhost/api/visao-executiva/${cliente}/pdf${busca}`), { params: Promise.resolve({ cliente }) })

describe('GET /api/visao-executiva/[cliente]/pdf (arquitetura 5; CA-14.3, CA-14.4)', () => {
  it('com vínculo, devolve o PDF para baixar, sem cache', async () => {
    entrarComo('usr-rafael')
    const resposta = await gerar('cli-vertice')
    expect(resposta.status).toBe(200)
    expect(resposta.headers.get('content-type')).toBe('application/pdf')
    expect(resposta.headers.get('cache-control')).toBe('no-store')
    expect(resposta.headers.get('content-disposition')).toMatch(/^attachment; filename="visao-executiva-cli-vertice-\d{4}-\d{2}-\d{2}\.pdf"$/)
    const bytes = Buffer.from(await resposta.arrayBuffer())
    expect(bytes.subarray(0, 4).toString()).toBe('%PDF')
  }, 30_000)

  it('aceita o filtro por contrato, e o cliente sem nada escrito também gera (CA-14.6)', async () => {
    entrarComo('usr-helena')
    expect((await gerar('cli-vertice', '?contrato=ctr-vertice-mobilizacao')).status).toBe(200)
    expect((await gerar('cli-limpar')).status).toBe(200)
  }, 30_000)

  it('sem vínculo, o cadastro da ELO ou inexistente: 404 sem revelar; sem sessão, 401', async () => {
    entrarComo('usr-rafael')
    const fora = await gerar('cli-montareal')
    expect(fora.status).toBe(404)
    expect(await fora.text()).toBe('Cliente não encontrado.')
    entrarComo('usr-helena')
    expect((await gerar('cli-elo')).status).toBe(404)
    limparCookies()
    const semSessao = await gerar('cli-vertice')
    expect(semSessao.status).toBe(401)
    expect(await semSessao.text()).toBe('Entre na plataforma para gerar o PDF.')
  })
})
