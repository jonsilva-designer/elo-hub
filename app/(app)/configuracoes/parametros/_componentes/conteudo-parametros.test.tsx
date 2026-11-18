import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoParametros } from './conteudo-parametros'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  usePathname: () => '/configuracoes/parametros',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => limparCookies())

describe('parâmetros (parte 8, 4.3)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Parâmetros | Plataforma ELO')
  })

  it('a Equipe recebe acesso negado (CA-01.2)', async () => {
    entrarComo('usr-rafael')
    render(await ConteudoParametros())
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
  })

  it('o Administrador vê os valores do Apêndice C e a recusa no campo', async () => {
    entrarComo('usr-helena')
    render(await ConteudoParametros())
    expect(screen.getByRole('textbox', { name: /próxima do prazo/ })).toHaveValue('5')
    expect(screen.getByRole('textbox', { name: /alerta de vencimento/ })).toHaveValue('30')
    expect(screen.getByRole('textbox', { name: /Notificação de demanda/ })).toHaveValue('atendimento@elogovernance.com.br')
    expect(screen.getByRole('textbox', { name: /^Crítica/ })).toHaveValue('')
    const alerta = screen.getByRole('textbox', { name: /alerta de vencimento/ })
    await userEvent.clear(alerta)
    await userEvent.type(alerta, '120')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar parâmetros' }))
    expect(await screen.findByText('Informe um número inteiro de 1 a 90.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /alerta de vencimento/ })).toHaveValue('120')
  })
})
