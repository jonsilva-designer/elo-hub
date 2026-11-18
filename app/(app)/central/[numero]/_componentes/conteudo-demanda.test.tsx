import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoDemanda } from './conteudo-demanda'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  sessionStorage.clear()
})

const conteudo = (numero: string) => ConteudoDemanda({ params: Promise.resolve({ numero }) })

async function abrir(numero: string) {
  return render(<TooltipProvider>{await conteudo(numero)}</TooltipProvider>)
}

const painel = (titulo: string) => within(screen.getByRole('region', { name: titulo }))

describe('página da demanda (parte 5, 5.10)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Demanda | Plataforma ELO')
  })

  it('o cabeçalho tem a volta, o assunto, o número, o cliente, o status e a criticidade', async () => {
    entrarComo('usr-rafael')
    const { container } = await abrir('ELO-2026-0003')
    expect(screen.getByRole('link', { name: 'Voltar para Central ELO' })).toHaveAttribute('href', '/central')
    expect(screen.getByRole('heading', { level: 1, name: 'Certidões vencidas antes da medição' })).toBeInTheDocument()
    const cabecalho = within(container.querySelector('header')!)
    expect(cabecalho.getByText('ELO-2026-0003')).toHaveClass('font-mono')
    expect(cabecalho.getByRole('link', { name: 'Vértice Manutenção' })).toHaveAttribute('href', '/clientes/cli-vertice')
    expect(cabecalho.getByText('Em atendimento')).toBeInTheDocument()
    expect(cabecalho.getByText('Alta')).toBeInTheDocument()
  })

  it('os painéis na ordem, com os dados, a triagem e os anexos (CA-12.3)', async () => {
    entrarComo('usr-rafael')
    await abrir('ELO-2026-0003')
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Dados',
      'Triagem',
      'Atendimento',
      'Comentários',
      'Anexos',
      'Histórico',
    ])
    expect(painel('Dados').getByRole('link', { name: 'CT-2025-031' })).toHaveAttribute('href', '/contratos/ctr-vertice-manutencao')
    expect(painel('Dados').getByRole('link', { name: 'Regularização documental' })).toHaveAttribute('href', '/escopos/esc-vertice-documental')
    const triagem = painel('Triagem')
    expect(triagem.getByText('Pedido de documento')).toBeInTheDocument()
    expect(triagem.getByText('Vencida')).toBeInTheDocument()
    expect(triagem.getByText('Beatriz Fontes').closest('li')).toHaveTextContent('Principal')
    const anexos = painel('Anexos')
    expect(anexos.getByText('Lista das certidões vencidas, enviada pelo cliente')).toBeInTheDocument()
    expect(anexos.getByText('Parecer sobre a retenção do pagamento')).toBeInTheDocument()
    expect(anexos.getByRole('link', { name: 'Incluir documento' })).toHaveAttribute('href', '/documentos/novo?demanda=ELO-2026-0003')
  })

  it('os comentários com o contato com especialista (DF-30)', async () => {
    entrarComo('usr-rafael')
    await abrir('ELO-2026-0003')
    expect(painel('Comentários').getByText(/Contato com especialista · Beatriz Fontes/)).toBeInTheDocument()
  })

  it('o especialista Inativo pede troca (DF-51); a encerrada mostra a solução, o retorno e a data', async () => {
    entrarComo('usr-helena')
    const { unmount } = await abrir('ELO-2026-0006')
    expect(painel('Triagem').getByText('Trocar especialista')).toBeInTheDocument()
    unmount()
    await abrir('ELO-2026-0001')
    const atendimento = painel('Atendimento')
    expect(atendimento.getByText(/cláusula 12.3/)).toBeInTheDocument()
    expect(atendimento.getByText(/Explicado ao gerente/)).toBeInTheDocument()
    expect(atendimento.getByText('18/03/2026')).toBeInTheDocument()
  })

  it('o menu Mudar status aparece na aberta e, para a Equipe, some na Encerrada (RN-17)', async () => {
    entrarComo('usr-rafael')
    const { unmount } = await abrir('ELO-2026-0010')
    expect(screen.getByRole('button', { name: /Mudar status/ })).toBeInTheDocument()
    unmount()
    await abrir('ELO-2026-0001')
    expect(screen.queryByRole('button', { name: /Mudar status/ })).not.toBeInTheDocument()
  })

  it('a demanda aberta tem o formulário de comentário; a Encerrada, não', async () => {
    entrarComo('usr-helena')
    const { unmount } = await abrir('ELO-2026-0003')
    expect(painel('Comentários').getByRole('button', { name: 'Registrar comentário' })).toBeInTheDocument()
    unmount()
    await abrir('ELO-2026-0001')
    expect(screen.queryByRole('button', { name: 'Registrar comentário' })).not.toBeInTheDocument()
  })

  it('o Rafael não abre a demanda da Montareal que ele mesmo registrou (CA-09.9)', async () => {
    entrarComo('usr-rafael')
    await expect(conteudo('ELO-2026-0011')).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(conteudo('ELO-2026-9999')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
