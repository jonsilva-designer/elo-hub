import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE_FILTROS_DOS_DOCUMENTOS } from '@/lib/documentos/filtros'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoDocumentos } from './conteudo-documentos'
import { VoltarParaDocumentos } from './voltar-para-documentos'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  push.mockReset()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/documentos')
})

async function abrir(busca: Record<string, string> = {}) {
  return render(await ConteudoDocumentos({ searchParams: Promise.resolve(busca) }))
}

const linhas = () => within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')

describe('lista de documentos (parte 6, 4.4)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Documentos | Plataforma ELO')
  })

  it('o Rafael vê os dos clientes dele e o currículo sem cliente, sem o inativo e sem o da Montareal (CA-12.5, CA-18.2)', async () => {
    entrarComo('usr-rafael')
    await abrir()
    expect(screen.getByRole('heading', { level: 1, name: 'Documentos' })).toBeInTheDocument()
    expect(linhas()).toHaveLength(11)
    expect(document.querySelector('header')).toHaveTextContent('11 documentos')
    expect(screen.getByRole('link', { name: 'Incluir documento' })).toHaveAttribute('href', '/documentos/novo')
    expect(screen.queryByText('Cronograma da montagem eletromecânica')).not.toBeInTheDocument()
    expect(screen.queryByText('Ata da reunião de abertura do ciclo 2026')).not.toBeInTheDocument()
    const curriculo = screen.getByText('Currículo de Beatriz Fontes').closest('tr')!
    expect(curriculo).toHaveTextContent('Sem cliente')
    expect(within(curriculo).getByRole('link', { name: 'Beatriz Fontes' })).toHaveAttribute('href', '/especialistas/esp-juridico')
    expect(screen.queryByRole('button', { name: /Exportar/ })).not.toBeInTheDocument()
  })

  it('as colunas e a linha que abre o documento', async () => {
    entrarComo('usr-helena')
    await abrir()
    expect(screen.getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Documento', 'Cliente', 'Vínculo', 'Data', 'Status'])
    expect(linhas()).toHaveLength(12)
    const evidencia = screen.getByText('Protocolo da renovação da licença de operação').closest('tr')!
    expect(evidencia).toHaveTextContent('Evidência')
    expect(evidencia).toHaveTextContent('Vértice Manutenção')
    expect(evidencia).toHaveTextContent('21/10/2026')
    await userEvent.click(within(evidencia).getByText('Protocolo da renovação da licença de operação'))
    expect(push).toHaveBeenCalledWith('/documentos/doc-vertice-protocolo-licenca')
  })

  it('o inativo volta com o filtro do endereço, com a etiqueta; os filtros ficam guardados para a volta', async () => {
    entrarComo('usr-helena')
    await abrir({ status: 'Inativo' })
    expect(linhas()).toHaveLength(1)
    const ata = screen.getByText('Ata da reunião de abertura do ciclo 2026').closest('tr')!
    expect(ata).toHaveTextContent('Inativo')
    expect(sessionStorage.getItem(CHAVE_FILTROS_DOS_DOCUMENTOS)).toBe('status=Inativo')
  })

  it('a busca filtra na hora e vai para o endereço; sem resultado, o vazio com Limpar filtros', async () => {
    entrarComo('usr-helena')
    await abrir()
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar' }), 'aditivo')
    expect(linhas()).toHaveLength(2)
    expect(window.location.search).toBe('?busca=aditivo')
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar' }), 'xyz')
    expect(screen.getByText('Nenhum documento com esses filtros.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(linhas()).toHaveLength(12)
  })

  it('a volta da página do documento leva à lista com os filtros guardados', () => {
    sessionStorage.setItem(CHAVE_FILTROS_DOS_DOCUMENTOS, 'cliente=sem-cliente')
    render(<VoltarParaDocumentos />)
    expect(screen.getByRole('link', { name: 'Voltar para Documentos' })).toHaveAttribute('href', '/documentos?cliente=sem-cliente')
  })
})
