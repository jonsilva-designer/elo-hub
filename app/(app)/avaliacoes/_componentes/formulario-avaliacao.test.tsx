import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { avisarSalvo } from '@/lib/avisos'
import type { AvaliacaoDetalhada, Usuario } from '@/lib/dados/tipos'
import { salvarAvaliacao } from '@/lib/maturidade/acoes'
import { FormularioAvaliacao } from './formulario-avaliacao'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/lib/maturidade/acoes', () => ({ salvarAvaliacao: vi.fn() }))
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))

const salvarFalso = vi.mocked(salvarAvaliacao)

const DIMENSOES = [
  'Regularidade e documentação',
  'Capacidade técnica',
  'Capacidade operacional',
  'Gestão e qualidade',
  'Saúde, segurança e ambiente',
  'Sustentação financeira',
  'Gestão comercial e contratual',
  'Integridade e informação',
]

const usuario = (id: string, nome: string, perfil: Usuario['perfil']): Usuario => ({
  id,
  nome,
  email: `${id}@elogovernance.com.br`,
  perfil,
  status: 'Ativo',
})
const AVALIADORES = [usuario('usr-helena', 'Helena Prado', 'Administrador'), usuario('usr-rafael', 'Rafael Souza', 'Equipe')]

const rascunho: AvaliacaoDetalhada = {
  id: 'ava-vertice-3',
  clienteId: 'cli-vertice',
  ordem: 6,
  data: '2026-11-05',
  avaliadorId: 'usr-rafael',
  nomeAvaliador: 'Rafael Souza',
  contratoId: null,
  status: 'Em elaboração',
  maturidadeGeral: null,
  prontidao: null,
  dimensoes: DIMENSOES.map((dimensao, i) => ({
    dimensao,
    nivel: i === 0 ? 'Consistente' : null,
    media: i === 0 ? 4.1 : null,
    lacuna: '',
  })),
  pontosFortes: '',
  lacunasPrioritarias: '',
  recomendacao: '',
  observacoesInternas: 'Rascunho do Rafael',
}

const CLIENTE = { id: 'cli-vertice', nome: 'Vértice Manutenção' }

beforeEach(() => {
  push.mockReset()
  salvarFalso.mockReset()
  vi.mocked(avisarSalvo).mockReset()
})

function montar(avaliacao: AvaliacaoDetalhada | null = null) {
  return render(
    <FormularioAvaliacao
      cliente={CLIENTE}
      avaliacao={avaliacao}
      dimensoes={avaliacao ? avaliacao.dimensoes.map((d) => d.dimensao) : DIMENSOES}
      avaliadores={AVALIADORES}
      usuarioAtualId="usr-helena"
    />,
  )
}

const grupo = (dimensao: string) => screen.getByRole('group', { name: dimensao })

describe('FormularioAvaliacao (F20, parte 2, 5.8)', () => {
  it('a nova tem uma linha por dimensão, 8 no total, e o avaliador começa no usuário atual', () => {
    const { container } = montar()
    for (const d of DIMENSOES) expect(grupo(d)).toBeInTheDocument()
    expect(container.querySelector('input[type="hidden"][name="avaliadorId"]')).toHaveValue('usr-helena')
    expect(container.querySelector('input[type="hidden"][name="clienteId"]')).toHaveValue('cli-vertice')
  })

  it('a edição vem com os valores da avaliação', () => {
    const { container } = montar(rascunho)
    expect(container.querySelector('input[type="hidden"][name="nivel-0"]')).toHaveValue('Consistente')
    expect(within(grupo('Regularidade e documentação')).getByRole('textbox', { name: /Média/ })).toHaveValue('4,1')
    expect(container.querySelector('input[type="hidden"][name="avaliacaoId"]')).toHaveValue('ava-vertice-3')
    expect(container.querySelector('input[type="hidden"][name="avaliadorId"]')).toHaveValue('usr-rafael')
    expect(container.querySelector('input[type="hidden"][name="data"]')).toHaveValue('2026-11-05')
  })

  it('o contrato de referência fica desabilitado, sem contratos nesta parte (CA-20.3)', () => {
    montar()
    const contrato = screen.getByRole('combobox', { name: /Contrato de referência/ })
    expect(contrato).toBeDisabled()
    expect(contrato).toHaveTextContent('Nenhum contrato deste cliente')
  })

  it('o status aparece como Em elaboração, e as observações internas avisam que não saem para o cliente', () => {
    montar()
    expect(screen.getByText('Em elaboração')).toBeInTheDocument()
    expect(screen.getByText('Uso interno. Não sai na Visão Executiva nem no PDF')).toBeInTheDocument()
  })

  it('o erro de uma média aparece na linha certa', async () => {
    salvarFalso.mockResolvedValue({ erros: { medias: { 2: 'A média vai de 1,00 a 5,00.' } }, valores: null })
    montar()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await within(grupo('Capacidade operacional')).findByText('A média vai de 1,00 a 5,00.')).toBeInTheDocument()
    expect(within(grupo('Capacidade técnica')).queryByText('A média vai de 1,00 a 5,00.')).not.toBeInTheDocument()
  })

  it('salva, avisa e vai para o destino', async () => {
    salvarFalso.mockResolvedValue({
      erros: {},
      valores: null,
      sucesso: { mensagem: 'Avaliação salva. No protótipo, os dados não são gravados.', destino: '/avaliacoes/ava-vertice-3' },
    })
    montar(rascunho)
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/avaliacoes/ava-vertice-3'))
    expect(avisarSalvo).toHaveBeenCalledWith('Avaliação salva. No protótipo, os dados não são gravados.')
  })

  it('Cancelar volta para a avaliação, na edição, e para a aba Maturidade do cliente, na nova', () => {
    const { unmount } = montar(rascunho)
    expect(screen.getByRole('link', { name: 'Cancelar' })).toHaveAttribute('href', '/avaliacoes/ava-vertice-3')
    unmount()
    montar()
    expect(screen.getByRole('link', { name: 'Cancelar' })).toHaveAttribute('href', '/clientes/cli-vertice?aba=maturidade')
  })
})
