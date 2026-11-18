// @vitest-environment node
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { GET } from './route'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const baixar = (id: string) =>
  GET(new NextRequest(`http://localhost/api/documentos/${id}/arquivo`), { params: Promise.resolve({ id }) })

describe('GET /api/documentos/[id]/arquivo (arquitetura 5; CA-12.5, DF-65)', () => {
  it('com acesso, devolve o arquivo de exemplo, para baixar, sem cache', async () => {
    entrarComo('usr-rafael')
    const resposta = await baixar('doc-vertice-contrato')
    expect(resposta.status).toBe(200)
    expect(resposta.headers.get('content-type')).toBe('text/plain; charset=utf-8')
    expect(resposta.headers.get('cache-control')).toBe('no-store')
    expect(resposta.headers.get('content-disposition')).toBe(
      `attachment; filename="CT-2025-031 assinado-exemplo.txt"; filename*=UTF-8''CT-2025-031%20assinado-exemplo.txt`,
    )
    const texto = await resposta.text()
    expect(texto).toContain('Contrato CT-2025-031 assinado')
    expect(texto).toContain('Categoria: Contrato')
    expect(texto).toContain('Cliente: Vértice Manutenção')
    expect(texto).toContain('Arquivo original: CT-2025-031 assinado.pdf (2,4 MB)')
    expect(texto).toContain('Etapa 3')
  })

  it('o nome com acento vai sem acento no filename e completo no filename*', async () => {
    entrarComo('usr-rafael')
    const resposta = await baixar('doc-especialista-curriculo')
    expect(resposta.status).toBe(200)
    expect(resposta.headers.get('content-disposition')).toBe(
      `attachment; filename="Curriculo Beatriz Fontes-exemplo.txt"; filename*=UTF-8''Curr%C3%ADculo%20Beatriz%20Fontes-exemplo.txt`,
    )
    expect(await resposta.text()).toContain('Cliente: Sem cliente')
  })

  it('sem acesso ou inexistente, 404 sem revelar; sem sessão, 401', async () => {
    entrarComo('usr-rafael')
    const fora = await baixar('doc-montareal-cronograma')
    expect(fora.status).toBe(404)
    expect(await fora.text()).toBe('Documento não encontrado.')
    expect((await baixar('doc-que-nao-existe')).status).toBe(404)
    limparCookies()
    const semSessao = await baixar('doc-vertice-contrato')
    expect(semSessao.status).toBe(401)
    expect(await semSessao.text()).toBe('Entre na plataforma para baixar.')
  })
})
