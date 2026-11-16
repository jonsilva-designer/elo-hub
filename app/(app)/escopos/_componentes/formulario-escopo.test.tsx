import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { avisarSalvo } from '@/lib/avisos'
import { obterEscopo } from '@/lib/dados/escopos'
import type { EscopoDetalhado } from '@/lib/dados/tipos'
import { salvarEscopo } from '@/lib/escopos/acoes'
import { MENSAGENS_ESCOPO, type DadosEscopo } from '@/lib/escopos/validacao'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { FormularioEscopo } from './formulario-escopo'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))
vi.mock('@/lib/escopos/acoes', () => ({ salvarEscopo: vi.fn() }))
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))

const CONTRATO = { id: 'ctr-vertice-mobilizacao', codigo: 'CT-2026-044', nomeCliente: 'Vértice Manutenção' }
const RESPONSAVEIS = [
  { valor: 'usr-helena', rotulo: 'Helena Prado' },
  { valor: 'usr-rafael', rotulo: 'Rafael Souza' },
]
const CICLOS = [
  { valor: 'esc-vertice-documental', rotulo: 'Regularização documental' },
  { valor: 'esc-vertice-qualidade', rotulo: 'Programa de qualidade' },
]

/** O que o formulário mandou na chamada dada da ação. */
const enviado = (chamada = 0) => vi.mocked(salvarEscopo).mock.calls[chamada][1] as FormData

const DIGITADO: DadosEscopo = {
  contratoId: 'ctr-vertice-mobilizacao',
  nome: 'Treinamento de NR-10',
  descricao: '',
  responsavelId: 'usr-rafael',
  status: 'Planejado',
  justificativa: '',
  prioridade: 'Alta',
  criticidade: 'Alta',
  justificativaCriticidade: 'Treinamentos vencem antes do fim do contrato.',
  inicio: '',
  conclusaoPrevista: '2027-01-29',
  cicloAnteriorId: '',
  observacoes: '',
  confirmarAviso: false,
}

beforeEach(() => {
  limparCookies()
  push.mockReset()
  vi.mocked(salvarEscopo).mockReset()
  vi.mocked(avisarSalvo).mockReset()
})

function montar(escopo: EscopoDetalhado | null = null) {
  return render(<FormularioEscopo escopo={escopo} contrato={CONTRATO} responsaveis={RESPONSAVEIS} ciclos={CICLOS} />)
}

async function escopoDaHelena(id: string) {
  entrarComo('usr-helena')
  return (await obterEscopo(id))!
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

describe('FormularioEscopo (parte 3, 5.8)', () => {
  it('tem os grupos Escopo, Criticidade, Datas e Outros, com o contrato e o cliente só para leitura', () => {
    montar()
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Escopo',
      'Criticidade',
      'Datas',
      'Outros',
    ])
    const escopo = within(screen.getByRole('region', { name: 'Escopo' }))
    expect(escopo.getByText('CT-2026-044')).toHaveClass('font-mono')
    expect(escopo.getByText('Vértice Manutenção')).toBeInTheDocument()
    expect(screen.getByDisplayValue('ctr-vertice-mobilizacao')).toHaveAttribute('name', 'contratoId')
  })

  it('no cadastro, o status oferece os três abertos e a criticidade vem com a justificativa (CA-05.1)', async () => {
    montar()
    expect(await opcoesDe(/Status/)).toEqual(['Planejado', 'Em andamento', 'Em espera'])
    expect(await opcoesDe(/^Criticidade/)).toEqual(['Baixa', 'Moderada', 'Alta', 'Crítica'])
    expect(screen.getByRole('textbox', { name: /Justificativa da criticidade/ })).toBeInTheDocument()
  })

  it('o ciclo anterior oferece os outros escopos do cliente, e Especialistas fica para a parte 5', async () => {
    montar()
    expect(await opcoesDe(/Ciclo anterior/)).toEqual([
      'Sem ciclo anterior',
      'Regularização documental',
      'Programa de qualidade',
    ])
    expect(screen.getByRole('combobox', { name: /Especialistas/ })).toBeDisabled()
    expect(screen.getByRole('combobox', { name: /Especialistas/ })).toHaveTextContent('Nenhum especialista cadastrado')
  })

  it('na edição, os campos vêm preenchidos e a criticidade é só leitura, com a dica de reclassificar', async () => {
    montar(await escopoDaHelena('esc-vertice-documental'))
    expect(screen.getByRole('textbox', { name: /Nome/ })).toHaveValue('Regularização documental')
    expect(screen.getByRole('combobox', { name: /Responsável ELO/ })).toHaveTextContent('Rafael Souza')
    expect(screen.queryByRole('combobox', { name: /^Criticidade/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /Justificativa da criticidade/ })).not.toBeInTheDocument()
    const criticidade = within(screen.getByRole('region', { name: 'Criticidade' }))
    expect(criticidade.getByText('Alta')).toBeInTheDocument()
    expect(criticidade.getByText('Para mudar, use Reclassificar na página do escopo')).toBeInTheDocument()
    expect(screen.getByDisplayValue('esc-vertice-documental')).toHaveAttribute('name', 'id')
  })

  it('de Planejado para Em espera, pede a justificativa; para Em andamento, não (RN-22)', async () => {
    montar(await escopoDaHelena('esc-vertice-qualidade'))
    await escolher(/Status/, 'Em andamento')
    expect(screen.queryByRole('textbox', { name: /^Justificativa/ })).not.toBeInTheDocument()
    await escolher(/Status/, 'Em espera')
    expect(screen.getByRole('textbox', { name: /^Justificativa/ })).toBeInTheDocument()
  })

  it('no escopo Concluído, o status é só leitura, com a dica de reabrir', async () => {
    montar(await escopoDaHelena('esc-atlantica-2025'))
    expect(screen.queryByRole('combobox', { name: /Status/ })).not.toBeInTheDocument()
    expect(screen.getByText(MENSAGENS_ESCOPO.fechado)).toBeInTheDocument()
  })

  it('o aviso da RN-21 aparece acima dos botões, e "Salvar mesmo assim" envia de novo com a confirmação (CA-05.8)', async () => {
    vi.mocked(salvarEscopo)
      .mockResolvedValueOnce({
        erros: {},
        valores: DIGITADO,
        aviso: 'A conclusão prevista é depois do término da vigência do contrato (05/12/2026). Salvar mesmo assim?',
      })
      .mockResolvedValueOnce({
        erros: {},
        valores: { ...DIGITADO, confirmarAviso: true },
        sucesso: { mensagem: 'Escopo salvo. No protótipo, os dados não são gravados.', destino: '/contratos/ctr-vertice-mobilizacao' },
      })
    montar()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText(/A conclusão prevista é depois do término/)).toBeInTheDocument()
    expect(enviado(0).get('confirmarAviso')).toBe('')
    expect(screen.getByRole('textbox', { name: /Nome/ })).toHaveValue('Treinamento de NR-10')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar mesmo assim' }))
    await waitFor(() => expect(salvarEscopo).toHaveBeenCalledTimes(2))
    expect(enviado(1).get('confirmarAviso')).toBe('sim')
    expect(enviado(1).get('nome')).toBe('Treinamento de NR-10')
    await waitFor(() => expect(push).toHaveBeenCalledWith('/contratos/ctr-vertice-mobilizacao'))
  })

  it('"Revisar" esconde o aviso, e o envio seguinte vai sem a confirmação', async () => {
    vi.mocked(salvarEscopo).mockResolvedValue({
      erros: {},
      valores: DIGITADO,
      aviso: 'A conclusão prevista é depois do término da vigência do contrato (05/12/2026). Salvar mesmo assim?',
    })
    montar()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Revisar' }))
    expect(screen.queryByText(/A conclusão prevista é depois do término/)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    await waitFor(() => expect(salvarEscopo).toHaveBeenCalledTimes(2))
    expect(enviado(1).get('confirmarAviso')).toBe('')
  })

  it('salvo, mostra o aviso de salvo e vai para o destino', async () => {
    vi.mocked(salvarEscopo).mockResolvedValue({
      erros: {},
      valores: null,
      sucesso: { mensagem: 'Escopo salvo. No protótipo, os dados não são gravados.', destino: '/escopos/esc-vertice-documental' },
    })
    montar(await escopoDaHelena('esc-vertice-documental'))
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    await waitFor(() => expect(avisarSalvo).toHaveBeenCalledWith('Escopo salvo. No protótipo, os dados não são gravados.'))
    expect(push).toHaveBeenCalledWith('/escopos/esc-vertice-documental')
  })

  it('o erro do servidor aparece no campo, e o que foi digitado volta', async () => {
    vi.mocked(salvarEscopo).mockResolvedValue({
      erros: { nome: MENSAGENS_ESCOPO.nome },
      valores: { ...DIGITADO, nome: '', observacoes: 'Observação digitada' },
    })
    montar()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText(MENSAGENS_ESCOPO.nome)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Observações/ })).toHaveValue('Observação digitada')
  })
})
