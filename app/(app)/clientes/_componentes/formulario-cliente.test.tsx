import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { avisarSalvo } from '@/lib/avisos'
import { salvarCliente } from '@/lib/clientes/acoes'
import type { Cliente } from '@/lib/dados/tipos'
import { FormularioCliente } from './formulario-cliente'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/lib/clientes/acoes', () => ({ salvarCliente: vi.fn() }))
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))

const salvarFalso = vi.mocked(salvarCliente)

const vertice: Cliente = {
  id: 'cli-vertice',
  razaoSocial: 'Vértice Manutenção Industrial Ltda',
  nomeFantasia: 'Vértice Manutenção',
  cnpj: '21.473.509/0001-21',
  segmento: 'Tecnologia',
  cidade: 'Macaé',
  uf: 'RJ',
  status: 'Ativo',
  ehCadastroElo: false,
}
const fortec: Cliente = { ...vertice, id: 'cli-fortec', razaoSocial: 'Fortec Energia Ltda', status: 'Inativo' }

beforeEach(() => {
  push.mockReset()
  salvarFalso.mockReset()
  vi.mocked(avisarSalvo).mockReset()
})

const montar = (cliente: Cliente | null) => render(<FormularioCliente cliente={cliente} segmentos={['Energia', 'Tecnologia']} />)

async function escolherStatus(status: string) {
  await userEvent.click(screen.getByRole('combobox', { name: /Status/ }))
  await userEvent.click(await screen.findByRole('option', { name: status }))
}

describe('FormularioCliente (F02)', () => {
  it('tem os grupos Empresa e Contato', () => {
    montar(null)
    expect(screen.getByRole('heading', { name: 'Empresa' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Contato' })).toBeInTheDocument()
  })

  it('na edição, vem com os dados do cliente', () => {
    montar(vertice)
    expect(screen.getByRole('textbox', { name: /Razão Social/ })).toHaveValue('Vértice Manutenção Industrial Ltda')
    expect(screen.getByRole('textbox', { name: /CNPJ/ })).toHaveValue('21.473.509/0001-21')
  })

  it('de Ativo para Prospect, pede a justificativa; de volta a Ativo, ela some (RN-22)', async () => {
    montar(vertice)
    expect(screen.queryByRole('textbox', { name: /Justificativa/ })).not.toBeInTheDocument()
    await escolherStatus('Prospect')
    expect(screen.getByRole('textbox', { name: /Justificativa/ })).toBeInTheDocument()
    await escolherStatus('Ativo')
    expect(screen.queryByRole('textbox', { name: /Justificativa/ })).not.toBeInTheDocument()
  })

  it('no cliente Inativo, o status é só leitura e explica como reativar', () => {
    const { container } = montar(fortec)
    expect(screen.queryByRole('combobox', { name: /Status/ })).not.toBeInTheDocument()
    expect(screen.getByText('Para reativar, use Reativar na página do cliente')).toBeInTheDocument()
    expect(container.querySelector('input[type="hidden"][name="status"]')).toHaveValue('Inativo')
  })

  it('mostra o erro abaixo do campo e marca o campo como inválido', async () => {
    salvarFalso.mockResolvedValue({
      erros: { cnpj: 'CNPJ inválido. Confira os números.' },
      valores: null,
    })
    montar(null)
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('CNPJ inválido. Confira os números.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /CNPJ/ })).toHaveAttribute('aria-invalid', 'true')
    expect(push).not.toHaveBeenCalled()
  })

  it('salvo, mostra o aviso e volta para o destino', async () => {
    salvarFalso.mockResolvedValue({
      erros: {},
      valores: null,
      sucesso: { mensagem: 'Cliente salvo. No protótipo, os dados não são gravados.', destino: '/clientes/cli-vertice' },
    })
    montar(vertice)
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/clientes/cli-vertice'))
    expect(avisarSalvo).toHaveBeenCalledWith('Cliente salvo. No protótipo, os dados não são gravados.')
  })

  it('Cancelar volta sem salvar', () => {
    montar(vertice)
    expect(screen.getByRole('link', { name: 'Cancelar' })).toHaveAttribute('href', '/clientes/cli-vertice')
  })
})

describe('FormularioCliente, revisão do código', () => {
  it('o segmento que saiu da lista oficial continua aparecendo como escolhido', () => {
    render(<FormularioCliente cliente={{ ...vertice, segmento: 'Naval' }} segmentos={['Energia', 'Tecnologia']} />)
    expect(screen.getByRole('combobox', { name: /Segmento/ })).toHaveTextContent('Naval')
  })
})
