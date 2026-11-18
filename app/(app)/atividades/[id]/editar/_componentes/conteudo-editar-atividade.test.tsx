import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoEditarAtividade } from './conteudo-editar-atividade'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  sessionStorage.clear()
})

const editar = (id: string, busca: Record<string, string> = {}) =>
  ConteudoEditarAtividade({ params: Promise.resolve({ id }), searchParams: Promise.resolve(busca) })

async function abrir(id: string, busca: Record<string, string> = {}) {
  return render(<TooltipProvider>{await editar(id, busca)}</TooltipProvider>)
}

describe('editar atividade (parte 4, 5.7)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Editar atividade | Plataforma ELO')
  })

  it('o Rafael vê o formulário preenchido e a volta para o plano', async () => {
    entrarComo('usr-rafael')
    await abrir('atv-licencas-vistoria')
    expect(screen.getByRole('heading', { level: 1, name: 'Editar atividade' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Nome/ })).toHaveValue('Agendar a vistoria do órgão ambiental')
    expect(screen.getByRole('textbox', { name: /Executor/ })).toHaveValue('Ana Ribeiro (SSMA do cliente)')
    expect(screen.getByRole('link', { name: 'Voltar para Regularização das licenças' })).toHaveAttribute(
      'href',
      '/planos/pla-vertice-licencas',
    )
    expect(screen.queryByRole('button', { name: 'Excluir atividade' })).not.toBeInTheDocument()
  })

  it('aberta a partir de Minhas atividades, volta para lá e manda a origem', async () => {
    entrarComo('usr-rafael')
    await abrir('atv-licencas-vistoria', { origem: 'minhas-atividades' })
    expect(screen.getByRole('link', { name: 'Voltar para Minhas atividades' })).toHaveAttribute('href', '/minhas-atividades')
    expect(screen.getByDisplayValue('minhas-atividades')).toHaveAttribute('name', 'origem')
  })

  it('aberta: a Equipe pode concluir, e a tela avisa que a data de conclusão é registrada ao salvar (DF-43)', async () => {
    entrarComo('usr-rafael')
    await abrir('atv-licencas-protocolo')
    await userEvent.click(screen.getByRole('combobox', { name: /Status/ }))
    expect((await screen.findAllByRole('option')).map((o) => o.textContent)).toEqual([
      'Não iniciada',
      'Em andamento',
      'Concluída',
      'Cancelada',
    ])
    await userEvent.click(screen.getByRole('option', { name: 'Concluída' }))
    expect(screen.getByText('A data de conclusão é registrada ao salvar.')).toBeInTheDocument()
  })

  it('Concluída: mostra a data de conclusão; a Helena reabre com justificativa, e a data é apagada (CA-08.6, CN-22.2)', async () => {
    entrarComo('usr-helena')
    await abrir('atv-licencas-levantamento')
    expect(screen.getByText('Concluída em')).toBeInTheDocument()
    expect(screen.getByText('20/05/2026')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /Justificativa/ })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('combobox', { name: /Status/ }))
    expect((await screen.findAllByRole('option')).map((o) => o.textContent)).toEqual([
      'Não iniciada',
      'Em andamento',
      'Concluída',
    ])
    await userEvent.click(screen.getByRole('option', { name: 'Em andamento' }))
    expect(screen.getByRole('textbox', { name: /Justificativa/ })).toBeInTheDocument()
    expect(screen.getByText('A data de conclusão é apagada na reabertura.')).toBeInTheDocument()
  })

  it('o Administrador exclui pela edição, com justificativa (DF-33)', async () => {
    entrarComo('usr-helena')
    await abrir('atv-licencas-alvara')
    await userEvent.click(screen.getByRole('button', { name: 'Excluir atividade' }))
    const janela = within(await screen.findByRole('alertdialog'))
    expect(janela.getByRole('textbox', { name: /Justificativa/ })).toBeInTheDocument()
  })

  it('a atividade com evidência não oferece Excluir (RN-13, CA-18.4)', async () => {
    entrarComo('usr-helena')
    await abrir('atv-licencas-protocolo')
    expect(screen.getByRole('heading', { level: 1, name: 'Editar atividade' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Excluir atividade' })).not.toBeInTheDocument()
  })

  it('a Equipe na atividade fechada vê acesso negado (RN-17)', async () => {
    entrarComo('usr-rafael')
    await abrir('atv-licencas-levantamento')
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /Nome/ })).not.toBeInTheDocument()
  })

  it('fora do vínculo ou com id que não existe: não encontrado', async () => {
    entrarComo('usr-rafael')
    await expect(editar('atv-estruturas-inspecao')).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(editar('atv-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
