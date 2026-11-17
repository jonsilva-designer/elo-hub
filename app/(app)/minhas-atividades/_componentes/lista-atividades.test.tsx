import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE_FILTROS_DAS_ATIVIDADES, type FiltrosAtividades } from '@/lib/atividades/filtros'
import { listarAtividades } from '@/lib/dados/atividades'
import type { AtividadeDetalhada } from '@/lib/dados/tipos'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { ListaAtividades } from './lista-atividades'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))

const DA_HELENA: FiltrosAtividades = { busca: '', responsavel: 'usr-helena', status: [], prazo: [], escopo: null }
const RESPONSAVEIS = [
  { valor: 'usr-helena', rotulo: 'Helena Prado' },
  { valor: 'usr-rafael', rotulo: 'Rafael Souza' },
]

let ATIVIDADES: AtividadeDetalhada[] = []

function montar(props: Partial<Parameters<typeof ListaAtividades>[0]> = {}) {
  return render(
    <ListaAtividades
      atividades={ATIVIDADES}
      responsaveis={RESPONSAVEIS}
      escopos={[{ valor: 'esc-vertice-documental', rotulo: 'Regularização documental', cliente: 'Vértice Manutenção' }]}
      filtrosIniciais={DA_HELENA}
      usuarioId="usr-helena"
      perfil="Administrador"
      semVinculo={false}
      {...props}
    />,
  )
}

const linhas = () => within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')

beforeEach(async () => {
  limparCookies()
  entrarComo('usr-helena')
  ATIVIDADES = await listarAtividades()
  push.mockReset()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/minhas-atividades')
})

afterEach(() => vi.restoreAllMocks())

describe('ListaAtividades (parte 4, 5.8)', () => {
  it('trocar o responsável para todos vai para o endereço e fica guardado para a volta (CA-16.2)', async () => {
    const trocar = vi.spyOn(window.history, 'replaceState')
    montar()
    expect(linhas()).toHaveLength(4)
    await userEvent.click(screen.getByRole('combobox', { name: 'Responsável' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Todos os responsáveis' }))
    expect(linhas()).toHaveLength(12)
    expect(trocar).toHaveBeenLastCalledWith(null, '', '/minhas-atividades?responsavel=todos')
    expect(sessionStorage.getItem(CHAVE_FILTROS_DAS_ATIVIDADES)).toBe('responsavel=todos')
  })

  it('o filtro de prazo mostra só as atrasadas', async () => {
    montar({ filtrosIniciais: { ...DA_HELENA, responsavel: null } })
    await userEvent.click(screen.getByRole('combobox', { name: 'Prazo' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Atrasada' }))
    // A lista de opções fica aberta para escolher mais de uma; fechada, a tabela volta a ser lida.
    await userEvent.keyboard('{Escape}')
    expect(linhas()).toHaveLength(3)
  })

  it('sem resultado, avisa e deixa limpar os filtros', async () => {
    montar()
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar' }), 'zzz')
    expect(screen.getByText('Nenhuma atividade com esses filtros.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(linhas()).toHaveLength(12)
  })

  it('sem nenhuma atividade, diz que não há atividade cadastrada', () => {
    montar({ atividades: [] })
    expect(screen.getByText('Nenhuma atividade cadastrada.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument()
  })

  it('a Equipe sem vínculo vê o aviso de falar com o Administrador', () => {
    montar({ atividades: [], semVinculo: true, perfil: 'Equipe' })
    expect(screen.getByText('Você ainda não tem clientes vinculados.')).toBeInTheDocument()
  })

  it('Exportar baixa a rota com os filtros do endereço', async () => {
    const clicar = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    montar({ filtrosIniciais: { ...DA_HELENA, prazo: ['Atrasada'] } })
    await userEvent.click(screen.getByRole('button', { name: /Exportar/ }))
    const link = clicar.mock.instances[0] as unknown as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/api/exportar/atividades?prazo=Atrasada')
  })

  it('o escopo aparece com o cliente no filtro', async () => {
    montar()
    await userEvent.click(screen.getByRole('combobox', { name: 'Escopo' }))
    const opcoes = (await screen.findAllByRole('option')).map((o) => o.textContent)
    expect(opcoes).toEqual(['Todos os escopos', 'Regularização documental · Vértice Manutenção'])
  })
})
