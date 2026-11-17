import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { obterEscopo } from './escopos'
import {
  candidaturasComOMesmoEmail,
  especialistaTemItensLigados,
  ligacoesDoEspecialista,
  listarEspecialistas,
  listarEspecialistasAtivos,
  obterEspecialista,
} from './especialistas'
import { listarEspecialidades } from './listas'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

describe('leitura dos especialistas (F11, DF-02)', () => {
  it('os dois perfis leem os 7 especialistas', async () => {
    entrarComo('usr-helena')
    expect(await listarEspecialistas()).toHaveLength(7)
    entrarComo('usr-rafael')
    expect(await listarEspecialistas()).toHaveLength(7)
    expect(await obterEspecialista('esp-juridico')).not.toBeNull()
    expect(await obterEspecialista('esp-nao-existe')).toBeNull()
  })

  it('para vínculo novo, só os Ativos (RN-14, CA-11.2)', async () => {
    entrarComo('usr-helena')
    expect((await listarEspecialistasAtivos()).map((e) => e.id).sort()).toEqual([
      'esp-contratos',
      'esp-esg',
      'esp-juridico',
      'esp-suprimentos',
    ])
  })

  it('a candidatura com o e-mail de um cadastro anterior é marcada (DF-50)', async () => {
    entrarComo('usr-helena')
    const repetidos = (await listarEspecialistas()).filter((e) => e.emailRepetido).map((e) => e.id)
    expect(repetidos).toEqual(['esp-suprimentos-2'])
  })

  it('as outras candidaturas com o mesmo e-mail, nos dois sentidos (CA-11.6)', async () => {
    entrarComo('usr-rafael')
    expect((await candidaturasComOMesmoEmail('esp-suprimentos')).map((c) => c.id)).toEqual(['esp-suprimentos-2'])
    const anteriores = await candidaturasComOMesmoEmail('esp-suprimentos-2')
    expect(anteriores).toEqual([
      { id: 'esp-suprimentos', nome: expect.any(String), cadastradoEm: expect.any(String), status: 'Ativo', origem: 'Site' },
    ])
    expect(await candidaturasComOMesmoEmail('esp-esg')).toEqual([])
  })

  it('as ligações seguem o vínculo do usuário (CA-11.4)', async () => {
    entrarComo('usr-helena')
    expect((await ligacoesDoEspecialista('esp-juridico')).map((l) => l.id)).toEqual([
      'esc-vertice-documental',
      'esc-montareal-montagem',
      'ELO-2026-0003',
    ])
    entrarComo('usr-rafael')
    const doRafael = (await ligacoesDoEspecialista('esp-juridico')).filter((l) => l.tipo === 'Escopo')
    expect(doRafael).toEqual([
      {
        tipo: 'Escopo',
        id: 'esc-vertice-documental',
        nome: 'Regularização documental',
        cliente: 'Vértice Manutenção',
        status: 'Em andamento',
        href: '/escopos/esc-vertice-documental',
      },
    ])
  })

  it('tem itens ligados quando está em algum escopo, mesmo fora do vínculo de quem pergunta (RN-13)', async () => {
    entrarComo('usr-rafael')
    expect(await especialistaTemItensLigados('esp-juridico')).toBe(true)
    expect(await especialistaTemItensLigados('esp-contratos')).toBe(false)
  })

  it('o escopo traz os especialistas ligados, com o status (DF-51)', async () => {
    entrarComo('usr-helena')
    expect((await obterEscopo('esc-vertice-mobilizacao'))?.especialistas).toEqual([
      { id: 'esp-financeiro', nome: expect.any(String), especialidade: 'Financeiro', status: 'Inativo' },
    ])
    expect((await obterEscopo('esc-vertice-qualidade'))?.especialistas).toEqual([])
  })

  it('as especialidades da lista oficial, na ordem do Apêndice C (DF-70)', async () => {
    expect(await listarEspecialidades()).toEqual([
      'Jurídico (contratos, cláusulas e compliance)',
      'Gestão de contratos',
      'Financeiro',
      'Suprimentos e compras',
      'Gestão de riscos',
      'ESG e sustentabilidade',
      'Gestão e desenvolvimento de fornecedores',
    ])
  })
})

describe('as demandas nas ligações do especialista (parte 5B, CA-11.4)', () => {
  it('o jurídico tem a demanda ELO-2026-0003; o ESG também, e passa a ter vínculo', async () => {
    entrarComo('usr-rafael')
    expect(await ligacoesDoEspecialista('esp-esg')).toEqual([
      {
        tipo: 'Demanda',
        id: 'ELO-2026-0003',
        nome: 'ELO-2026-0003 · Certidões vencidas antes da medição',
        cliente: 'Vértice Manutenção',
        status: 'Em atendimento',
        href: '/central/ELO-2026-0003',
      },
    ])
    expect(await especialistaTemItensLigados('esp-esg')).toBe(true)
  })
})
