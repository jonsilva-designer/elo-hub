import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoEspecialista } from './conteudo-especialista'

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
})

const conteudo = (id: string) => ConteudoEspecialista({ params: Promise.resolve({ id }) })

async function abrir(id: string) {
  return render(<TooltipProvider>{await conteudo(id)}</TooltipProvider>)
}

const painel = (titulo: string) => within(screen.getByRole('region', { name: titulo }))

describe('página do especialista (parte 5, 5.6)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Especialista | Plataforma ELO')
  })

  it('o cabeçalho tem a volta, o nome, a especialidade e o status; os painéis vêm na ordem', async () => {
    entrarComo('usr-helena')
    const { container } = await abrir('esp-juridico')
    expect(screen.getByRole('link', { name: 'Voltar para Especialistas' })).toHaveAttribute('href', '/especialistas')
    expect(screen.getByRole('heading', { level: 1, name: 'Beatriz Fontes' })).toBeInTheDocument()
    const cabecalho = within(container.querySelector('header')!)
    expect(cabecalho.getByText('Jurídico (contratos, cláusulas e compliance)')).toBeInTheDocument()
    expect(cabecalho.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Dados do especialista',
      'Observações internas',
      'Escopos e demandas',
      'Documentos',
      'Histórico',
    ])
    expect(painel('Dados do especialista').getByText('beatriz.fontes@exemplo.com.br')).toBeInTheDocument()
  })

  it('os escopos seguem o vínculo de quem vê (CA-11.4)', async () => {
    entrarComo('usr-helena')
    const { unmount } = await abrir('esp-juridico')
    expect(painel('Escopos e demandas').getByText('Montagem eletromecânica')).toBeInTheDocument()
    unmount()
    entrarComo('usr-rafael')
    await abrir('esp-juridico')
    const ligacoes = painel('Escopos e demandas')
    expect(ligacoes.getByText('Regularização documental')).toBeInTheDocument()
    expect(ligacoes.queryByText('Montagem eletromecânica')).not.toBeInTheDocument()
    await userEvent.click(ligacoes.getByText('Regularização documental'))
    expect(push).toHaveBeenCalledWith('/escopos/esc-vertice-documental')
  })

  it('a candidatura repetida mostra a marca e as outras com o mesmo e-mail (DF-50, CA-11.6)', async () => {
    entrarComo('usr-rafael')
    const { container } = await abrir('esp-suprimentos-2')
    expect(within(container.querySelector('header')!).getByText('E-mail já cadastrado')).toBeInTheDocument()
    const outras = painel('Outras candidaturas com o mesmo e-mail')
    expect(outras.getByText('04/03/2026')).toBeInTheDocument()
    expect(outras.getByText('Ativo')).toBeInTheDocument()
  })

  it('a Equipe não tem Editar nem o menu; o Administrador tem Editar e Excluir só sem vínculo', async () => {
    entrarComo('usr-rafael')
    const { unmount } = await abrir('esp-contratos')
    expect(screen.queryByRole('link', { name: /Editar/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mais ações' })).not.toBeInTheDocument()
    unmount()
    entrarComo('usr-helena')
    const helena = await abrir('esp-contratos')
    expect(screen.getByRole('link', { name: /Editar/ })).toHaveAttribute('href', '/especialistas/esp-contratos/editar')
    await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }))
    expect(await screen.findByRole('menuitem', { name: 'Excluir' })).toBeInTheDocument()
    helena.unmount()
    await abrir('esp-juridico')
    expect(screen.queryByRole('button', { name: 'Mais ações' })).not.toBeInTheDocument()
  })

  it('id que não existe dá não encontrado', async () => {
    entrarComo('usr-rafael')
    await expect(conteudo('esp-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
