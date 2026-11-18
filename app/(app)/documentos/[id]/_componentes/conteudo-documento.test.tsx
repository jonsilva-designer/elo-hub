import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoDocumento } from './conteudo-documento'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  sessionStorage.clear()
})

const conteudo = (id: string) => ConteudoDocumento({ params: Promise.resolve({ id }) })

async function abrir(id: string) {
  return render(<TooltipProvider>{await conteudo(id)}</TooltipProvider>)
}

const painel = (titulo: string) => within(screen.getByRole('region', { name: titulo }))
const cabecalho = (container: HTMLElement) => within(container.querySelector('header')!)

describe('página do documento (parte 6, 4.4)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Documento | Plataforma ELO')
  })

  it('o cabeçalho tem a volta, o nome, a categoria e o status; os painéis vêm na ordem', async () => {
    entrarComo('usr-rafael')
    const { container } = await abrir('doc-vertice-protocolo-licenca')
    expect(screen.getByRole('link', { name: 'Voltar para Documentos' })).toHaveAttribute('href', '/documentos')
    expect(screen.getByRole('heading', { level: 1, name: 'Protocolo da renovação da licença de operação' })).toBeInTheDocument()
    expect(cabecalho(container).getByText('Evidência')).toBeInTheDocument()
    expect(cabecalho(container).getByText('Vigente')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Dados',
      'Vínculos',
      'Versões',
      'Histórico',
    ])
  })

  it('os Dados: datas, quem incluiu, o arquivo com o tamanho e as observações', async () => {
    entrarComo('usr-helena')
    await abrir('doc-vertice-contrato')
    const dados = painel('Dados')
    expect(dados.getByText('20/06/2025')).toBeInTheDocument()
    expect(dados.getByText('03/02/2026')).toBeInTheDocument()
    expect(dados.getByText('Helena Prado')).toBeInTheDocument()
    expect(dados.getByText('CT-2025-031 assinado.pdf')).toBeInTheDocument()
    expect(dados.getByText('2,4 MB')).toBeInTheDocument()
    expect(dados.getByText('Via assinada pelas duas partes, com os anexos técnicos.')).toBeInTheDocument()
  })

  it('os Vínculos com links para cada registro', async () => {
    entrarComo('usr-rafael')
    await abrir('doc-vertice-protocolo-licenca')
    const vinculos = painel('Vínculos')
    expect(vinculos.getByRole('link', { name: 'Vértice Manutenção' })).toHaveAttribute('href', '/clientes/cli-vertice')
    expect(vinculos.getByRole('link', { name: 'CT-2025-031' })).toHaveAttribute('href', '/contratos/ctr-vertice-manutencao')
    expect(vinculos.getByRole('link', { name: 'Regularização documental' })).toHaveAttribute('href', '/escopos/esc-vertice-documental')
    expect(vinculos.getByRole('link', { name: 'Regularização das licenças' })).toHaveAttribute('href', '/planos/pla-vertice-licencas')
    expect(vinculos.getByRole('link', { name: 'Protocolar a renovação da licença de operação' })).toHaveAttribute(
      'href',
      '/atividades/atv-licencas-protocolo/editar',
    )
    expect(vinculos.queryByText('Demanda')).not.toBeInTheDocument()
  })

  it('a demanda e a avaliação dos vínculos levam o número e a data na fonte dos números', async () => {
    entrarComo('usr-helena')
    const { unmount } = await abrir('doc-vertice-certidoes')
    expect(painel('Vínculos').getByRole('link', { name: /ELO-2026-0003/ }).querySelector('.font-mono')).toHaveTextContent('ELO-2026-0003')
    unmount()
    await abrir('doc-vertice-instrumento')
    expect(painel('Vínculos').getByRole('link', { name: /Avaliação de/ }).querySelector('.font-mono')).toHaveTextContent('15/09/2026')
  })

  it('as Versões ligam o anterior e o novo, nos dois sentidos (RN-15, CA-12.4)', async () => {
    entrarComo('usr-rafael')
    const { unmount } = await abrir('doc-vertice-aditivo-minuta')
    expect(painel('Versões').getByRole('link', { name: 'Primeiro aditivo de prazo, versão assinada' })).toHaveAttribute(
      'href',
      '/documentos/doc-vertice-aditivo-assinado',
    )
    unmount()
    await abrir('doc-vertice-aditivo-assinado')
    expect(painel('Versões').getByRole('link', { name: 'Primeiro aditivo de prazo' })).toHaveAttribute(
      'href',
      '/documentos/doc-vertice-aditivo-minuta',
    )
  })

  it('sem outra versão, o vazio; o histórico do documento', async () => {
    entrarComo('usr-helena')
    await abrir('doc-vertice-levantamento')
    expect(painel('Versões').getByText('Nenhuma outra versão.')).toBeInTheDocument()
    expect(painel('Histórico').getByText('Documento incluído')).toBeInTheDocument()
  })

  it('a Equipe baixa, edita e envia nova versão do documento do cliente vinculado', async () => {
    entrarComo('usr-rafael')
    await abrir('doc-vertice-levantamento')
    expect(screen.getByRole('link', { name: 'Baixar' })).toHaveAttribute('href', '/api/documentos/doc-vertice-levantamento/arquivo')
    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/documentos/doc-vertice-levantamento/editar')
    expect(screen.getByRole('link', { name: 'Enviar nova versão' })).toHaveAttribute(
      'href',
      '/documentos/novo?substitui=doc-vertice-levantamento',
    )
  })

  it('o currículo sem cliente: a Equipe vê e baixa, mas não edita nem envia nova versão (DF-65)', async () => {
    entrarComo('usr-rafael')
    await abrir('doc-especialista-curriculo')
    expect(screen.getByRole('link', { name: 'Baixar' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Editar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Enviar nova versão' })).not.toBeInTheDocument()
    expect(painel('Vínculos').getByText('Sem cliente')).toBeInTheDocument()
    expect(painel('Vínculos').getByRole('link', { name: 'Beatriz Fontes' })).toHaveAttribute('href', '/especialistas/esp-juridico')
  })

  it('o Superado não recebe nova versão; o inativo abre com a etiqueta (RN-24)', async () => {
    entrarComo('usr-helena')
    const { unmount } = await abrir('doc-vertice-aditivo-minuta')
    expect(screen.getByRole('link', { name: 'Editar' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Enviar nova versão' })).not.toBeInTheDocument()
    unmount()
    const { container } = await abrir('doc-atlantica-ata-duplicada')
    expect(cabecalho(container).getByText('Inativo')).toBeInTheDocument()
  })

  it('o menu de status, inativação e exclusão é só do Administrador (CA-12.6)', async () => {
    entrarComo('usr-rafael')
    const { unmount } = await abrir('doc-vertice-levantamento')
    expect(screen.queryByRole('button', { name: 'Mais ações' })).not.toBeInTheDocument()
    unmount()
    entrarComo('usr-helena')
    await abrir('doc-vertice-levantamento')
    expect(screen.getByRole('button', { name: 'Mais ações' })).toBeInTheDocument()
  })

  it('fora do acesso ou com id que não existe, "não encontrado" (CA-12.5)', async () => {
    entrarComo('usr-rafael')
    await expect(conteudo('doc-montareal-cronograma')).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(conteudo('doc-que-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
