import { beforeEach, describe, expect, it, vi } from 'vitest'
import { somarDias } from '@/lib/formato'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { hojeDaRequisicao } from './hoje'
import { obterVisaoExecutiva } from './visao-executiva'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const vertice = async (contrato?: string) => (await obterVisaoExecutiva('cli-vertice', contrato))!

describe('leitura da Visão Executiva (F14, arquitetura 3.5)', () => {
  it('a Equipe só abre a dos clientes vinculados; ninguém abre a do cadastro da ELO (CA-14.4)', async () => {
    entrarComo('usr-rafael')
    expect(await obterVisaoExecutiva('cli-montareal')).toBeNull()
    expect(await obterVisaoExecutiva('cli-nao-existe')).toBeNull()
    expect(await obterVisaoExecutiva('cli-vertice')).not.toBeNull()
    entrarComo('usr-helena')
    expect(await obterVisaoExecutiva('cli-elo')).toBeNull()
  })

  it('nunca leva valor, observações internas, comentários, justificativa da criticidade nem especialistas (CA-14.5)', async () => {
    entrarComo('usr-helena')
    const texto = JSON.stringify(await vertice())
    for (const proibido of [
      '1850000',
      'Contrato principal da Vértice',
      'Três certidões vencem antes da próxima medição',
      'Sócio muito receptivo',
      'Evolução clara desde março',
      'Pedi ao cliente a lista das certidões vencidas',
      'Beatriz Fontes',
      'Eduardo Salles',
    ]) {
      expect(texto, proibido).not.toContain(proibido)
    }
  })

  it('os escopos não cancelados, com o contrato, o contratante, a criticidade, a etapa atual e as 5 etapas (DF-48)', async () => {
    entrarComo('usr-helena')
    const v = await vertice()
    expect(v.cliente).toEqual({ id: 'cli-vertice', nome: 'Vértice Manutenção' })
    const documental = v.escopos.find((e) => e.nome === 'Regularização documental')!
    expect(documental).toMatchObject({ codigoContrato: 'CT-2025-031', contratante: 'Petrobras', criticidade: 'Alta', etapaAtual: 'Estruturar' })
    expect(documental.etapas.map((e) => e.status)).toEqual(['Concluída', 'Em andamento', 'Não iniciada', 'Não iniciada', 'Não iniciada'])
    expect(v.escopos.find((e) => e.nome === 'Diagnóstico para nova proposta')?.planejamento).toBe(true)
    expect(v.escopos.every((e) => e.status !== 'Cancelado')).toBe(true)
  })

  it('os planos abertos com o resumo e as atividades pendentes com prazo, responsável e executor (DF-71)', async () => {
    entrarComo('usr-helena')
    const licencas = (await vertice()).planos.find((p) => p.nome === 'Regularização das licenças')!
    expect(licencas).toMatchObject({ total: 5, concluidas: 1 })
    const vistoria = licencas.pendentes.find((a) => a.nome === 'Agendar a vistoria do órgão ambiental')!
    expect(vistoria).toMatchObject({ responsavel: 'Rafael Souza', executor: 'Ana Ribeiro (SSMA do cliente)' })
    expect(licencas.pendentes.every((a) => a.status === 'Não iniciada' || a.status === 'Em andamento')).toBe(true)
  })

  it('as demandas por status e as abertas, sem descrição nem comentários', async () => {
    entrarComo('usr-helena')
    const { demandas } = await vertice()
    expect(demandas.porStatus.find((s) => s.status === 'Encerrada')?.total).toBe(1)
    expect(demandas.abertas.map((d) => d.numero)).toContain('ELO-2026-0003')
    expect(Object.keys(demandas.abertas[0]).sort()).toEqual(['assunto', 'criticidade', 'numero', 'prazo', 'status', 'vencida'])
  })

  it('entregas dos últimos 30 dias, próximos prazos dos próximos 30 e pendências', async () => {
    entrarComo('usr-helena')
    const hoje = await hojeDaRequisicao()
    const v = await vertice()
    for (const e of v.entregas) expect(e.data >= somarDias(hoje, -30) && e.data <= hoje, e.descricao).toBe(true)
    const prazos = v.proximosPrazos.map((p) => p.descricao)
    expect(prazos).toContain('Agendar a vistoria do órgão ambiental')
    expect(prazos).toContain('CT-2026-044')
    expect(prazos).not.toContain('Preparar a auditoria interna dos documentos')
    for (const p of v.proximosPrazos) expect(p.data >= hoje && p.data <= somarDias(hoje, 30), p.descricao).toBe(true)
    const pendencias = v.pendencias.map((p) => p.descricao)
    expect(pendencias).toContain('Protocolar a renovação da licença de operação')
    expect(pendencias).toContain('ELO-2026-0003 · Certidões vencidas antes da medição')
  })

  it('a maturidade: a avaliação inicial e a atual, só os níveis, a geral e a prontidão (RN-25)', async () => {
    entrarComo('usr-helena')
    const { maturidade } = await vertice()
    expect(maturidade?.inicial.data).toBe('2026-03-10')
    expect(maturidade?.atual.data).toBe('2026-09-15')
    expect(Object.keys(maturidade!.atual).sort()).toEqual(['data', 'dimensoes', 'maturidadeGeral', 'prontidao'])
  })

  it('os três textos, com quem atualizou e quando; o texto não escrito vem vazio (DF-73, DF-82)', async () => {
    entrarComo('usr-helena')
    const v = await vertice()
    expect(v.textos.map((t) => t.campo)).toEqual(['principaisResultados', 'observacoesExecutivas', 'proximosPassos'])
    expect(v.textos.every((t) => t.texto && t.atualizadoPor && t.atualizadoEm)).toBe(true)
    expect(v.textosAtualizadosEm).toBe([...v.textos.map((t) => t.atualizadoEm!)].sort().at(-1))
    const rede = (await obterVisaoExecutiva('cli-rede-norte'))!
    expect(rede.textos.every((t) => t.texto === '' && t.atualizadoEm === null)).toBe(true)
    expect(rede.textosAtualizadosEm).toBeNull()
  })

  it('o filtro por contrato recorta os blocos; contrato de outro cliente é ignorado (CA-14.6)', async () => {
    entrarComo('usr-helena')
    const mobilizacao = await vertice('ctr-vertice-mobilizacao')
    expect(mobilizacao.contrato).toEqual({ id: 'ctr-vertice-mobilizacao', codigo: 'CT-2026-044' })
    expect(mobilizacao.escopos.map((e) => e.nome)).toEqual(['Mobilização de equipe'])
    expect(mobilizacao.planos.map((p) => p.nome)).toEqual(['Mobilização da equipe offshore'])
    expect(mobilizacao.demandas.abertas.map((d) => d.numero)).toEqual(['ELO-2026-0006'])
    expect(mobilizacao.proximosPrazos.map((p) => p.descricao)).not.toContain('Agendar a vistoria do órgão ambiental')
    const outro = await vertice('ctr-montareal-montagem')
    expect(outro.contrato).toBeNull()
    expect(outro.escopos.length).toBeGreaterThan(1)
    expect(outro.contratos.map((c) => c.id)).not.toContain('ctr-montareal-montagem')
  })
})
