import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { avisarSalvo } from '@/lib/avisos'
import type { LinhaEtapaDetalhada, StatusEtapa } from '@/lib/dados/tipos'
import { atualizarEtapa } from '@/lib/jornada/acoes'
import { MOTIVO_ULTIMA_APLICAVEL } from '@/lib/jornada/regras'
import { AtualizarEtapa } from './atualizar-etapa'

vi.mock('@/lib/jornada/acoes', () => ({ atualizarEtapa: vi.fn() }))
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))

const RESPONSAVEIS = [
  { valor: 'usr-helena', rotulo: 'Helena Prado' },
  { valor: 'usr-rafael', rotulo: 'Rafael Souza' },
]

const ESTRUTURAR: LinhaEtapaDetalhada = {
  etapa: 'Estruturar',
  status: 'Em andamento',
  responsavelId: 'usr-rafael',
  nomeResponsavel: 'Rafael Souza',
  inicio: '2026-05-04',
  conclusao: null,
  observacoes: '',
}

const DIAGNOSTICAR: LinhaEtapaDetalhada = {
  etapa: 'Diagnosticar',
  status: 'Concluída',
  responsavelId: 'usr-rafael',
  nomeResponsavel: 'Rafael Souza',
  inicio: '2026-02-09',
  conclusao: '2026-04-30',
  observacoes: 'Levantamento de 42 documentos obrigatórios.',
}

beforeEach(() => {
  vi.mocked(atualizarEtapa).mockReset()
  vi.mocked(avisarSalvo).mockReset()
})

function montar(
  etapa: LinhaEtapaDetalhada,
  perfil: 'Administrador' | 'Equipe',
  destinos: StatusEtapa[],
  motivo: string | null = null,
) {
  return render(
    <AtualizarEtapa
      escopoId="esc-vertice-documental"
      etapa={etapa}
      perfil={perfil}
      destinos={destinos}
      motivo={motivo}
      responsaveis={RESPONSAVEIS}
    />,
  )
}

async function abrir(etapa: string) {
  await userEvent.click(screen.getByRole('button', { name: `Atualizar ${etapa}` }))
  return within(await screen.findByRole('dialog', { name: `Atualizar ${etapa}` }))
}

async function opcoesDe(janela: ReturnType<typeof within>, campo: RegExp) {
  await userEvent.click(janela.getByRole('combobox', { name: campo }))
  const opcoes = (await screen.findAllByRole('option')).map((o) => o.textContent)
  await userEvent.keyboard('{Escape}')
  return opcoes
}

describe('AtualizarEtapa (parte 3, 5.10)', () => {
  it('o botão diz o nome da etapa e abre a janela com os dados dela', async () => {
    montar(ESTRUTURAR, 'Equipe', ['Não iniciada', 'Concluída'])
    expect(screen.getByRole('button', { name: 'Atualizar Estruturar' })).toHaveTextContent(/^Atualizar$/)
    const janela = await abrir('Estruturar')
    expect(janela.getByRole('combobox', { name: /Status/ })).toHaveTextContent('Em andamento')
    expect(janela.getByRole('textbox', { name: /Início/ })).toHaveValue('04/05/2026')
  })

  it('o status oferece o atual e os destinos recebidos (critério 16)', async () => {
    montar(ESTRUTURAR, 'Equipe', ['Não iniciada', 'Concluída'])
    const janela = await abrir('Estruturar')
    expect(await opcoesDe(janela, /Status/)).toEqual(['Em andamento', 'Não iniciada', 'Concluída'])
  })

  it('o motivo do Não aplicável que falta aparece abaixo do status (DF-49)', async () => {
    montar({ ...ESTRUTURAR, status: 'Não iniciada', inicio: null }, 'Administrador', ['Em andamento', 'Concluída'], MOTIVO_ULTIMA_APLICAVEL)
    const janela = await abrir('Estruturar')
    expect(janela.getByText(MOTIVO_ULTIMA_APLICAVEL)).toBeInTheDocument()
  })

  it('para a Equipe, o responsável é só leitura', async () => {
    montar(ESTRUTURAR, 'Equipe', ['Não iniciada', 'Concluída'])
    const janela = await abrir('Estruturar')
    expect(janela.queryByRole('combobox', { name: /Responsável/ })).not.toBeInTheDocument()
    expect(janela.getByText('Rafael Souza')).toBeInTheDocument()
  })

  it('para o Administrador, o responsável se escolhe, com o item Sem responsável', async () => {
    montar(ESTRUTURAR, 'Administrador', ['Não iniciada', 'Concluída'])
    const janela = await abrir('Estruturar')
    expect(await opcoesDe(janela, /Responsável/)).toEqual(['Sem responsável', 'Helena Prado', 'Rafael Souza'])
  })

  it('a justificativa aparece ao reabrir uma Concluída (RN-22)', async () => {
    montar(DIAGNOSTICAR, 'Administrador', ['Não iniciada', 'Em andamento'])
    const janela = await abrir('Diagnosticar')
    expect(janela.queryByRole('textbox', { name: /Justificativa/ })).not.toBeInTheDocument()
    await userEvent.click(janela.getByRole('combobox', { name: /Status/ }))
    await userEvent.click(await screen.findByRole('option', { name: 'Em andamento' }))
    expect(janela.getByRole('textbox', { name: /Justificativa/ })).toBeInTheDocument()
  })

  it('o erro do servidor aparece no campo, com a janela aberta', async () => {
    vi.mocked(atualizarEtapa).mockResolvedValue({ erros: { conclusao: 'Informe a data de conclusão.' } })
    montar(ESTRUTURAR, 'Equipe', ['Não iniciada', 'Concluída'])
    const janela = await abrir('Estruturar')
    await userEvent.click(janela.getByRole('button', { name: 'Salvar' }))
    expect(await janela.findByText('Informe a data de conclusão.')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('salvo, avisa e fecha a janela', async () => {
    vi.mocked(atualizarEtapa).mockResolvedValue({
      erros: {},
      sucesso: { mensagem: 'Etapa atualizada. No protótipo, os dados não são gravados.' },
    })
    montar(ESTRUTURAR, 'Equipe', ['Não iniciada', 'Concluída'])
    const janela = await abrir('Estruturar')
    await userEvent.click(janela.getByRole('button', { name: 'Salvar' }))
    await waitFor(() => expect(avisarSalvo).toHaveBeenCalledWith('Etapa atualizada. No protótipo, os dados não são gravados.'))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    const enviado = vi.mocked(atualizarEtapa).mock.calls[0][1] as FormData
    expect(Object.fromEntries(enviado)).toMatchObject({
      escopoId: 'esc-vertice-documental',
      etapa: 'Estruturar',
      status: 'Em andamento',
      responsavelId: 'usr-rafael',
      inicio: '2026-05-04',
      conclusao: '',
    })
  })
})
