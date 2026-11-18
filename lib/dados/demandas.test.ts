import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import {
  clientesParaNovaDemanda,
  demandasQueImpedem,
  listarComentarios,
  listarDemandas,
  listarDemandasDoCliente,
  listarDemandasDoEscopo,
  numeroDaProximaDemanda,
  obterDemanda,
  responsaveisParaTriagem,
  temDemandaLigada,
} from './demandas'
import { listarCategorias } from './listas'
import { obterInicioDaOperacao, obterReferenciasDePrazo } from './parametros'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

describe('leitura das demandas (F09, RN-01)', () => {
  it('a Helena vê as 11; o Rafael não vê a da Montareal nem a institucional (CA-09.9)', async () => {
    entrarComo('usr-helena')
    expect(await listarDemandas()).toHaveLength(11)
    entrarComo('usr-rafael')
    const doRafael = (await listarDemandas()).map((d) => d.numero)
    expect(doRafael).toHaveLength(9)
    expect(doRafael).not.toContain('ELO-2026-0011')
    expect(doRafael).not.toContain('ELO-2026-0007')
    expect(await obterDemanda('ELO-2026-0011')).toBeNull()
  })

  it('traz os nomes, o contrato, o escopo, os especialistas com o principal e a vencida', async () => {
    entrarComo('usr-rafael')
    expect(await obterDemanda('ELO-2026-0003')).toMatchObject({
      nomeCliente: 'Vértice Manutenção',
      codigoContrato: 'CT-2025-031',
      nomeEscopo: 'Regularização documental',
      nomeTriagem: 'Rafael Souza',
      nomeAtendimento: 'Rafael Souza',
      status: 'Em atendimento',
      vencida: true,
      especialistasLigados: [
        expect.objectContaining({ id: 'esp-juridico', principal: true }),
        expect.objectContaining({ id: 'esp-esg', principal: false }),
      ],
    })
    expect((await obterDemanda('ELO-2026-0004'))?.vencida).toBe(true)
    expect((await obterDemanda('ELO-2026-0008'))?.vencida).toBe(false)
  })

  it('as do cliente e as do escopo seguem o vínculo', async () => {
    entrarComo('usr-helena')
    expect((await listarDemandasDoCliente('cli-elo')).map((d) => d.numero)).toEqual(['ELO-2026-0007'])
    expect((await listarDemandasDoEscopo('esc-vertice-documental')).map((d) => d.numero)).toEqual([
      'ELO-2026-0003',
      'ELO-2026-0009',
    ])
    entrarComo('usr-rafael')
    expect(await listarDemandasDoCliente('cli-montareal')).toEqual([])
  })

  it('os comentários, do mais antigo para o mais recente, com o contato com especialista (DF-30)', async () => {
    entrarComo('usr-rafael')
    const comentarios = await listarComentarios('ELO-2026-0003')
    expect(comentarios.map((c) => c.tipo)).toEqual(['Comentário', 'Contato com especialista'])
    expect(comentarios[1]).toMatchObject({ autor: 'Rafael Souza', nomeEspecialista: 'Beatriz Fontes', dataContato: '2026-04-06' })
    entrarComo('usr-rafael')
    expect(await listarComentarios('ELO-2026-0011')).toEqual([])
  })
})

describe('registro de demanda para qualquer cliente Ativo (DF-39)', () => {
  it('o Rafael escolhe os vinculados e os Ativos, só com o nome; o Inativo não aparece', async () => {
    entrarComo('usr-rafael')
    const clientes = await clientesParaNovaDemanda()
    const montareal = clientes.find((c) => c.id === 'cli-montareal')
    expect(montareal).toEqual({ id: 'cli-montareal', nome: 'Montareal', ehCadastroElo: false, visivel: false })
    expect(clientes.find((c) => c.id === 'cli-vertice')?.visivel).toBe(true)
    expect(clientes.some((c) => c.id === 'cli-fortec')).toBe(false)
  })

  it('a triagem de um cliente fora dos vínculos oferece os Administradores e a Equipe vinculada a ele, só com o nome', async () => {
    entrarComo('usr-rafael')
    expect(await responsaveisParaTriagem('cli-montareal')).toEqual([{ id: 'usr-helena', nome: 'Helena Prado' }])
    expect(await responsaveisParaTriagem('cli-vertice')).toEqual([
      { id: 'usr-helena', nome: 'Helena Prado' },
      { id: 'usr-rafael', nome: 'Rafael Souza' },
    ])
    expect(await responsaveisParaTriagem('cli-fortec')).toEqual([])
  })

  it('o próximo número segue os existentes do ano', async () => {
    entrarComo('usr-rafael')
    expect(await numeroDaProximaDemanda()).toMatch(/^ELO-\d{4}-\d{4}$/)
  })
})

describe('o que as demandas impedem (RN-18, RN-13)', () => {
  it('as abertas do contrato, do escopo e do cliente', async () => {
    entrarComo('usr-helena')
    expect((await demandasQueImpedem({ escopoId: 'esc-vertice-documental' })).map((i) => i.descricao)).toEqual([
      expect.stringContaining('ELO-2026-0003'),
      expect.stringContaining('ELO-2026-0009'),
    ])
    expect(await demandasQueImpedem({ escopoId: 'esc-atlantica-2026' })).toEqual([])
    const item = (await demandasQueImpedem({ contratoId: 'ctr-rede-norte-rmm' }))[0]
    expect(item).toMatchObject({ tipo: 'Demanda', status: 'Resolvida', href: '/central/ELO-2026-0005' })
  })

  it('a ligada, mesmo Encerrada, impede excluir', async () => {
    entrarComo('usr-rafael')
    expect(await temDemandaLigada({ escopoId: 'esc-atlantica-2026' })).toBe(true)
    expect(await temDemandaLigada({ escopoId: 'esc-vertice-qualidade' })).toBe(false)
    expect(await temDemandaLigada({ especialistaId: 'esp-esg' })).toBe(true)
  })
})

describe('listas e parâmetros da Central (Apêndice C)', () => {
  it('as 13 categorias, e os parâmetros ainda vazios (DF-22, DF-46)', async () => {
    const categorias = await listarCategorias()
    expect(categorias).toHaveLength(13)
    expect(categorias[0]).toBe('Dúvida contratual')
    expect(categorias.at(-1)).toBe('Outros assuntos')
    expect(await obterReferenciasDePrazo()).toEqual({})
    expect(await obterInicioDaOperacao()).toBe('2026-03-02')
  })
})
