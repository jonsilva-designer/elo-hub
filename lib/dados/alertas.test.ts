import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ordenarAlertas, type Alerta } from '@/lib/alertas/regras'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { listarAlertas } from './alertas'
import { obterInicioDaOperacao } from './parametros'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)
vi.mock('./parametros', async (original) => ({
  ...(await original<typeof import('./parametros')>()),
  obterInicioDaOperacao: vi.fn(),
}))

beforeEach(() => {
  limparCookies()
  vi.mocked(obterInicioDaOperacao).mockResolvedValue('2026-11-02')
})

const doTipo = (alertas: Alerta[], tipo: Alerta['tipo']) => alertas.filter((a) => a.tipo === tipo).map((a) => a.registro)

describe('alertas (F15)', () => {
  it('antes do início oficial da operação, nenhum alerta (DF-46, CA-15.7)', async () => {
    entrarComo('usr-helena')
    vi.mocked(obterInicioDaOperacao).mockResolvedValue(null)
    expect(await listarAlertas()).toEqual({ ativos: false, alertas: [] })
    vi.mocked(obterInicioDaOperacao).mockResolvedValue('2999-01-01')
    expect((await listarAlertas()).ativos).toBe(false)
  })

  it('os 8 tipos, cada um com o link do registro (CA-15.1)', async () => {
    entrarComo('usr-helena')
    const { ativos, alertas } = await listarAlertas()
    expect(ativos).toBe(true)
    expect(doTipo(alertas, 'Contrato próximo do vencimento')).toEqual(['CT-2026-044 · FMC Logística'])
    expect(doTipo(alertas, 'Contrato vencido')).toEqual(['CT-2025-077 · FMC Logística'])
    expect(doTipo(alertas, 'Atividade atrasada')).toEqual(
      expect.arrayContaining(['Protocolar a renovação da licença de operação', 'Emitir os ASOs da equipe embarcada']),
    )
    expect(doTipo(alertas, 'Atividade próxima do prazo')).toContain('Agendar a vistoria do órgão ambiental')
    expect(doTipo(alertas, 'Escopo crítico')).toEqual(['Mobilização de equipe'])
    expect(doTipo(alertas, 'Demanda crítica')).toEqual([expect.stringMatching(/^ELO-2026-0008 · /)])
    expect(doTipo(alertas, 'Demanda vencida')).toEqual([expect.stringMatching(/^ELO-2026-0003/), expect.stringMatching(/^ELO-2026-0004/)])
    expect(doTipo(alertas, 'Especialista inativo')).toEqual(
      expect.arrayContaining(['Eduardo Salles em Mobilização de equipe', expect.stringMatching(/^Eduardo Salles em ELO-2026-0006/)]),
    )
    const protocolo = alertas.find((a) => a.registro === 'Protocolar a renovação da licença de operação')!
    expect(protocolo).toMatchObject({ href: '/atividades/atv-licencas-protocolo/editar', cliente: 'Vértice Manutenção', criticidade: 'Alta' })
    expect(alertas.find((a) => a.tipo === 'Contrato vencido')).toMatchObject({ href: '/contratos/ctr-rede-norte-rmm', criticidade: null })
  })

  it('da maior para a menor criticidade, sem criticidade por último (DF-15, CA-15.5)', async () => {
    entrarComo('usr-helena')
    const { alertas } = await listarAlertas()
    const pesos = alertas.map((a) => (a.criticidade ? ['Baixa', 'Moderada', 'Alta', 'Crítica'].indexOf(a.criticidade) : -1))
    expect(pesos).toEqual([...pesos].sort((a, b) => b - a))
    expect(alertas[0].criticidade).toBe('Crítica')
  })

  it('a ordem desempata pela data, a mais antiga primeiro, e sem data por último', () => {
    const alerta = (registro: string, data: string | null): Alerta => ({
      chave: registro,
      tipo: 'Atividade atrasada',
      registro,
      cliente: 'X',
      criticidade: 'Alta',
      data,
      href: '/',
      tom: 'problema',
    })
    expect(ordenarAlertas([alerta('c', null), alerta('b', '2026-11-10'), alerta('a', '2026-11-01')]).map((a) => a.registro)).toEqual([
      'a',
      'b',
      'c',
    ])
  })

  it('a Equipe vê só os alertas dos clientes vinculados (CA-15.3)', async () => {
    entrarComo('usr-helena')
    const todos = await listarAlertas()
    expect(todos.alertas.some((a) => a.cliente === 'Montareal')).toBe(true)
    entrarComo('usr-rafael')
    const doRafael = await listarAlertas()
    expect(doRafael.alertas.some((a) => a.cliente === 'Montareal')).toBe(false)
    expect(doRafael.alertas.length).toBeGreaterThan(0)
  })

  it('o especialista inativo vai para o responsável do escopo ou da demanda e para o Administrador (DF-51, CA-15.6)', async () => {
    entrarComo('usr-rafael')
    expect(doTipo((await listarAlertas()).alertas, 'Especialista inativo')).toContain('Eduardo Salles em Mobilização de equipe')
  })

  it('o prazo de hoje não é atrasado nem vencido (CA-15.4)', async () => {
    entrarComo('usr-helena')
    const { alertas } = await listarAlertas()
    const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
    for (const a of alertas.filter((x) => x.tipo === 'Atividade atrasada' || x.tipo === 'Demanda vencida')) {
      expect(a.data! < hoje, a.registro).toBe(true)
    }
  })
})
