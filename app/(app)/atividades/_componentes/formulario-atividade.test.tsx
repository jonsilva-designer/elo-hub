import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { salvarAtividade } from '@/lib/atividades/acoes'
import { MENSAGENS_ATIVIDADE, type DadosAtividade } from '@/lib/atividades/validacao'
import { avisarSalvo } from '@/lib/avisos'
import { limparCookies } from '@/lib/testes/next-falso'
import { FormularioAtividade } from './formulario-atividade'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))
vi.mock('@/lib/atividades/acoes', () => ({ salvarAtividade: vi.fn() }))
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))

const PLANO = { id: 'pla-vertice-licencas', nome: 'Regularização das licenças', nomeCliente: 'Vértice Manutenção' }
const RESPONSAVEIS = [
  { valor: 'usr-helena', rotulo: 'Helena Prado' },
  { valor: 'usr-rafael', rotulo: 'Rafael Souza' },
]

const AVISO = 'O prazo é depois do prazo do plano (31/03/2027). Salvar mesmo assim?'

const DIGITADO: DadosAtividade = {
  planoId: 'pla-vertice-licencas',
  nome: 'Atualizar o mapa de licenças',
  descricao: '',
  responsavelId: 'usr-rafael',
  executor: '',
  prazo: '2027-04-15',
  prioridade: 'Média',
  status: 'Não iniciada',
  justificativa: '',
  observacoes: '',
  confirmarAviso: false,
}

/** O que o formulário mandou na chamada dada da ação. */
const enviado = (chamada = 0) => vi.mocked(salvarAtividade).mock.calls[chamada][1] as FormData

beforeEach(() => {
  limparCookies()
  push.mockReset()
  vi.mocked(salvarAtividade).mockReset()
  vi.mocked(avisarSalvo).mockReset()
})

function montar() {
  return render(
    <FormularioAtividade atividade={null} plano={PLANO} perfil="Equipe" responsaveis={RESPONSAVEIS} origem={null} />,
  )
}

describe('FormularioAtividade (parte 4, 5.7)', () => {
  it('o aviso da RN-21 aparece, e "Salvar mesmo assim" envia de novo com a confirmação (CA-08.7)', async () => {
    vi.mocked(salvarAtividade)
      .mockResolvedValueOnce({ erros: {}, valores: DIGITADO, aviso: AVISO })
      .mockResolvedValueOnce({
        erros: {},
        valores: { ...DIGITADO, confirmarAviso: true },
        sucesso: { mensagem: 'Atividade salva. No protótipo, os dados não são gravados.', destino: '/planos/pla-vertice-licencas' },
      })
    montar()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText(/O prazo é depois do prazo do plano/)).toBeInTheDocument()
    expect(enviado(0).get('confirmarAviso')).toBe('')
    expect(screen.getByRole('textbox', { name: /Nome/ })).toHaveValue('Atualizar o mapa de licenças')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar mesmo assim' }))
    await waitFor(() => expect(salvarAtividade).toHaveBeenCalledTimes(2))
    expect(enviado(1).get('confirmarAviso')).toBe('sim')
    await waitFor(() => expect(push).toHaveBeenCalledWith('/planos/pla-vertice-licencas'))
    expect(avisarSalvo).toHaveBeenCalledWith('Atividade salva. No protótipo, os dados não são gravados.')
  })

  it('o erro do servidor aparece no campo, e o que foi digitado volta', async () => {
    vi.mocked(salvarAtividade).mockResolvedValue({
      erros: { prazo: MENSAGENS_ATIVIDADE.prazo },
      valores: { ...DIGITADO, prazo: '', executor: 'RH do cliente' },
    })
    montar()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText(MENSAGENS_ATIVIDADE.prazo)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Executor/ })).toHaveValue('RH do cliente')
  })

  it('manda o plano, sem o id, no cadastro', async () => {
    vi.mocked(salvarAtividade).mockResolvedValue({ erros: {}, valores: DIGITADO })
    montar()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    await waitFor(() => expect(salvarAtividade).toHaveBeenCalled())
    expect(enviado().get('planoId')).toBe('pla-vertice-licencas')
    expect(enviado().get('id')).toBeNull()
    expect(enviado().get('status')).toBe('Não iniciada')
  })
})
