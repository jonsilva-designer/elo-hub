import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { avisarSalvo } from '@/lib/avisos'
import { salvarContrato } from '@/lib/contratos/acoes'
import type { ContratoDetalhado } from '@/lib/dados/tipos'
import { FormularioContrato } from './formulario-contrato'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/lib/contratos/acoes', () => ({ salvarContrato: vi.fn() }))
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))

const CLIENTES = [
  { valor: 'cli-montareal', rotulo: 'Montareal' },
  { valor: 'cli-vertice', rotulo: 'Vértice Manutenção' },
]
const RESPONSAVEIS = {
  'cli-vertice': [
    { valor: 'usr-helena', rotulo: 'Helena Prado' },
    { valor: 'usr-rafael', rotulo: 'Rafael Souza' },
  ],
  'cli-montareal': [{ valor: 'usr-helena', rotulo: 'Helena Prado' }],
}

const ATIVO: ContratoDetalhado = {
  id: 'ctr-vertice-manutencao',
  clienteId: 'cli-vertice',
  codigo: 'CT-2025-031',
  contratante: 'Petrobras',
  objeto: 'Manutenção industrial da planta de Macaé',
  servicos: ['Manutenção Industrial'],
  dataProposta: '2025-05-10',
  tipoVigencia: 'Prazo determinado',
  inicio: '2025-07-01',
  termino: '2027-06-30',
  valor: 1850000,
  responsavelId: 'usr-helena',
  status: 'Ativo',
  observacoes: '',
  nomeCliente: 'Vértice Manutenção',
  nomeResponsavel: 'Helena Prado',
  vigencia: { status: 'Vigente', diasRestantes: 228 },
}

beforeEach(() => {
  push.mockReset()
  vi.mocked(salvarContrato).mockReset()
  vi.mocked(avisarSalvo).mockReset()
})

function montar(contrato: ContratoDetalhado | null, clienteInicial: string | null = null) {
  return render(
    <FormularioContrato
      contrato={contrato}
      clienteInicial={clienteInicial}
      clientes={CLIENTES}
      responsaveisPorCliente={RESPONSAVEIS}
      contratantes={['Petrobras', 'Porto do Açu']}
      servicos={['Manutenção Industrial', 'Engenharia']}
    />,
  )
}

async function escolher(campo: RegExp, opcao: string) {
  await userEvent.click(screen.getByRole('combobox', { name: campo }))
  await userEvent.click(await screen.findByRole('option', { name: opcao }))
}

async function opcoesDe(campo: RegExp) {
  await userEvent.click(screen.getByRole('combobox', { name: campo }))
  const opcoes = (await screen.findAllByRole('option')).map((o) => o.textContent)
  await userEvent.keyboard('{Escape}')
  return opcoes
}

describe('FormularioContrato (F03, seção 5.5)', () => {
  it('tem os grupos Contrato, Vigência e Outros', () => {
    montar(null)
    for (const titulo of ['Contrato', 'Vigência', 'Outros']) {
      expect(screen.getByRole('heading', { name: titulo })).toBeInTheDocument()
    }
  })

  it('o cliente do endereço vem escolhido, e o responsável lista os de vínculo com ele (RN-19)', async () => {
    montar(null, 'cli-vertice')
    expect(screen.getByRole('combobox', { name: /Cliente/ })).toHaveTextContent('Vértice Manutenção')
    expect(await opcoesDe(/Responsável ELO/)).toEqual(['Helena Prado', 'Rafael Souza'])
  })

  it('trocar o cliente troca as opções de responsável', async () => {
    montar(null, 'cli-vertice')
    await escolher(/Cliente/, 'Montareal')
    expect(await opcoesDe(/Responsável ELO/)).toEqual(['Helena Prado'])
  })

  it('no cadastro, o status oferece Proposta, Em contratação e Ativo', async () => {
    montar(null)
    expect(await opcoesDe(/Status/)).toEqual(['Proposta', 'Em contratação', 'Ativo'])
  })

  it('no Prazo indeterminado, o campo Término some (DF-68)', async () => {
    montar(null)
    expect(screen.getByRole('textbox', { name: /Término/ })).toBeInTheDocument()
    await escolher(/Tipo de vigência/, 'Prazo indeterminado')
    expect(screen.queryByRole('textbox', { name: /Término/ })).not.toBeInTheDocument()
  })

  it('na edição, o cliente é só leitura, os campos vêm preenchidos e o status oferece os quatro abertos', async () => {
    montar(ATIVO)
    expect(screen.queryByRole('combobox', { name: /Cliente/ })).not.toBeInTheDocument()
    expect(screen.getByText('Vértice Manutenção')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Código/ })).toHaveValue('CT-2025-031')
    expect(screen.getByRole('textbox', { name: /Início/ })).toHaveValue('01/07/2025')
    expect(document.querySelector('input[type="hidden"][name="servicos"]')).toHaveValue('Manutenção Industrial')
    expect(await opcoesDe(/Status/)).toEqual(['Proposta', 'Em contratação', 'Ativo', 'Suspenso'])
  })

  it('de Ativo para Proposta, pede a justificativa; de Ativo para Suspenso, não (RN-22)', async () => {
    montar(ATIVO)
    expect(screen.queryByRole('textbox', { name: /Justificativa/ })).not.toBeInTheDocument()
    await escolher(/Status/, 'Proposta')
    expect(screen.getByRole('textbox', { name: /Justificativa/ })).toBeInTheDocument()
    await escolher(/Status/, 'Suspenso')
    expect(screen.queryByRole('textbox', { name: /Justificativa/ })).not.toBeInTheDocument()
  })

  it('no contrato Encerrado, o status é só leitura, com a dica de reabrir', () => {
    montar({ ...ATIVO, status: 'Encerrado', vigencia: { status: 'Encerrado', diasRestantes: null } })
    expect(screen.queryByRole('combobox', { name: /Status/ })).not.toBeInTheDocument()
    expect(screen.getByText('Para reabrir, use Reabrir na página do contrato.')).toBeInTheDocument()
  })

  it('salvo, mostra o aviso e vai para o destino', async () => {
    vi.mocked(salvarContrato).mockResolvedValue({
      erros: {},
      valores: null,
      sucesso: { mensagem: 'Contrato salvo. No protótipo, os dados não são gravados.', destino: '/contratos/ctr-vertice-manutencao' },
    })
    montar(ATIVO)
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    await waitFor(() => expect(avisarSalvo).toHaveBeenCalledWith('Contrato salvo. No protótipo, os dados não são gravados.'))
    expect(push).toHaveBeenCalledWith('/contratos/ctr-vertice-manutencao')
  })

  it('o erro do servidor aparece no campo, e o que foi digitado volta', async () => {
    vi.mocked(salvarContrato).mockResolvedValue({
      erros: { codigo: 'Este cliente já tem um contrato com este código.' },
      valores: {
        clienteId: 'cli-vertice',
        codigo: 'CT-2025-031',
        contratante: 'Petrobras',
        objeto: 'Objeto digitado',
        servicos: ['Engenharia'],
        responsavelId: 'usr-helena',
        status: 'Proposta',
        justificativa: '',
        tipoVigencia: 'Prazo determinado',
        dataProposta: '',
        inicio: '',
        termino: '',
        valor: '',
        observacoes: '',
      },
    })
    montar(null, 'cli-vertice')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('Este cliente já tem um contrato com este código.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Objeto/ })).toHaveValue('Objeto digitado')
  })
})
