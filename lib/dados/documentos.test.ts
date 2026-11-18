import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import {
  documentoPrincipalDoContrato,
  documentosPrincipaisPossiveis,
  documentoTemLigacao,
  etapasComDocumento,
  listarDocumentos,
  listarDocumentosLigados,
  obterDocumento,
  substitutosPossiveis,
  temDocumentoLigado,
} from './documentos'
import { listarHistorico } from './historico'
import { listarCategoriasDeDocumento } from './listas'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const ids = (lista: { id: string }[]) => lista.map((d) => d.id)

describe('leitura dos documentos (F12, RN-16, DF-65)', () => {
  it('as 12 categorias de F12, na ordem do PRD', async () => {
    const categorias = await listarCategoriasDeDocumento()
    expect(categorias).toHaveLength(12)
    expect(categorias[0]).toBe('Contrato')
    expect(categorias[9]).toBe('Documento do Especialista')
    expect(categorias[11]).toBe('Outros')
  })

  it('o Administrador vê todos, com o inativo, do mais recente para o mais antigo', async () => {
    entrarComo('usr-helena')
    const todos = await listarDocumentos()
    expect(todos).toHaveLength(13)
    expect(ids(todos)).toContain('doc-atlantica-ata-duplicada')
    const datas = todos.map((d) => d.data)
    expect(datas).toEqual([...datas].sort().reverse())
  })

  it('a Equipe não vê o da Montareal, mas vê o currículo sem cliente (CA-12.5, DF-65)', async () => {
    entrarComo('usr-rafael')
    const vistos = ids(await listarDocumentos())
    expect(vistos).not.toContain('doc-montareal-cronograma')
    expect(vistos).toContain('doc-especialista-curriculo')
    expect(await obterDocumento('doc-montareal-cronograma')).toBeNull()
    expect(await obterDocumento('doc-que-nao-existe')).toBeNull()
    expect((await obterDocumento('doc-especialista-curriculo'))?.nomeEspecialista).toBe('Beatriz Fontes')
  })

  it('detalha os nomes e o vínculo mais específico, com o link', async () => {
    entrarComo('usr-rafael')
    const evidencia = await obterDocumento('doc-vertice-protocolo-licenca')
    expect(evidencia).toMatchObject({
      nomeCliente: 'Vértice Manutenção',
      codigoContrato: 'CT-2025-031',
      nomeEscopo: 'Regularização documental',
      nomeAtividade: 'Protocolar a renovação da licença de operação',
      nomeIncluidoPor: 'Rafael Souza',
      vinculo: {
        tipo: 'Atividade',
        rotulo: 'Protocolar a renovação da licença de operação',
        href: '/atividades/atv-licencas-protocolo/editar',
      },
    })
    expect((await obterDocumento('doc-vertice-levantamento'))?.vinculo).toEqual({
      tipo: 'Etapa',
      rotulo: 'Regularização documental · Diagnosticar',
      href: '/escopos/esc-vertice-documental',
    })
    expect((await obterDocumento('doc-vertice-certidoes'))?.vinculo).toEqual({
      tipo: 'Demanda',
      rotulo: 'ELO-2026-0003 · Certidões vencidas antes da medição',
      href: '/central/ELO-2026-0003',
    })
    expect((await obterDocumento('doc-vertice-instrumento'))?.vinculo).toEqual({
      tipo: 'Avaliação',
      rotulo: 'Avaliação de 15/09/2026',
      href: '/avaliacoes/ava-vertice-2',
    })
    expect((await obterDocumento('doc-vertice-contrato'))?.vinculo).toEqual({
      tipo: 'Contrato',
      rotulo: 'CT-2025-031',
      href: '/contratos/ctr-vertice-manutencao',
    })
    expect((await obterDocumento('doc-especialista-curriculo'))?.vinculo).toEqual({
      tipo: 'Especialista',
      rotulo: 'Beatriz Fontes',
      href: '/especialistas/esp-juridico',
    })
  })

  it('o Superado aponta para o substituto, e o substituto para ele (RN-15, CA-12.4)', async () => {
    entrarComo('usr-rafael')
    const anterior = await obterDocumento('doc-vertice-aditivo-minuta')
    expect(anterior?.substituidoPor).toEqual({ id: 'doc-vertice-aditivo-assinado', nome: 'Primeiro aditivo de prazo, versão assinada' })
    const novo = await obterDocumento('doc-vertice-aditivo-assinado')
    expect(novo?.substitui).toEqual([{ id: 'doc-vertice-aditivo-minuta', nome: 'Primeiro aditivo de prazo' }])
    expect(novo?.substituidoPor).toBeNull()
  })

  it('os ligados a um registro: os que o usuário vê, sem o inativo (CA-12.3, CA-18.2)', async () => {
    entrarComo('usr-rafael')
    expect(ids(await listarDocumentosLigados({ atividadeId: 'atv-licencas-protocolo' }))).toEqual(['doc-vertice-protocolo-licenca'])
    expect(ids(await listarDocumentosLigados({ planoId: 'pla-vertice-licencas' }))).toEqual(['doc-vertice-protocolo-licenca'])
    expect(ids(await listarDocumentosLigados({ demandaNumero: 'ELO-2026-0003' }))).toEqual([
      'doc-vertice-parecer',
      'doc-vertice-certidoes',
    ])
    expect(ids(await listarDocumentosLigados({ avaliacaoId: 'ava-vertice-2' }))).toEqual(['doc-vertice-instrumento'])
    expect(ids(await listarDocumentosLigados({ especialistaId: 'esp-juridico' }))).toEqual([
      'doc-vertice-parecer',
      'doc-especialista-curriculo',
    ])
    expect(ids(await listarDocumentosLigados({ escopoId: 'esc-vertice-documental', etapa: 'Implementar' }))).toEqual([
      'doc-vertice-controle-validade',
    ])
    expect(ids(await listarDocumentosLigados({ contratoId: 'ctr-atlantica-porto' }))).toEqual(['doc-atlantica-termo-2025'])
    expect(await listarDocumentosLigados({ escopoId: 'esc-montareal-montagem' })).toEqual([])
  })

  it('temDocumentoLigado conta o que o usuário não vê e o inativo (RN-13)', async () => {
    entrarComo('usr-rafael')
    expect(await temDocumentoLigado({ escopoId: 'esc-montareal-montagem' })).toBe(true)
    expect(await temDocumentoLigado({ clienteId: 'cli-atlantica' })).toBe(true)
    expect(await temDocumentoLigado({ planoId: 'pla-vertice-mobilizacao' })).toBe(false)
  })

  it('as etapas com documento contam todos (DF-49)', async () => {
    entrarComo('usr-rafael')
    expect(await etapasComDocumento('esc-vertice-documental')).toEqual(['Diagnosticar', 'Implementar'])
    expect(await etapasComDocumento('esc-vertice-qualidade')).toEqual([])
  })

  it('os substitutos possíveis: Vigentes, ativos, do mesmo cliente, menos ele mesmo (CA-12.4)', async () => {
    entrarComo('usr-helena')
    const possiveis = ids(await substitutosPossiveis('doc-vertice-contrato'))
    expect(possiveis).toContain('doc-vertice-aditivo-assinado')
    expect(possiveis).not.toContain('doc-vertice-contrato')
    expect(possiveis).not.toContain('doc-vertice-aditivo-minuta')
    expect(possiveis).not.toContain('doc-montareal-cronograma')
    expect(possiveis).not.toContain('doc-especialista-curriculo')
    expect(await substitutosPossiveis('doc-especialista-curriculo')).toEqual([])
    entrarComo('usr-rafael')
    expect(await substitutosPossiveis('doc-montareal-cronograma')).toEqual([])
  })

  it('documentoTemLigacao: substituição nos dois sentidos ou documento principal de contrato', async () => {
    entrarComo('usr-helena')
    expect(await documentoTemLigacao('doc-vertice-aditivo-minuta')).toBe(true)
    expect(await documentoTemLigacao('doc-vertice-aditivo-assinado')).toBe(true)
    expect(await documentoTemLigacao('doc-vertice-contrato')).toBe(true)
    expect(await documentoTemLigacao('doc-vertice-levantamento')).toBe(false)
  })

  it('o documento principal do contrato e as opções: Contrato ou Proposta Comercial do contrato, ativos (F03)', async () => {
    entrarComo('usr-rafael')
    expect(await documentoPrincipalDoContrato('ctr-vertice-manutencao')).toEqual({
      id: 'doc-vertice-contrato',
      nome: 'Contrato CT-2025-031 assinado',
    })
    expect(await documentoPrincipalDoContrato('ctr-atlantica-porto')).toBeNull()
    expect(await documentosPrincipaisPossiveis('ctr-vertice-manutencao')).toEqual([
      { id: 'doc-vertice-contrato', nome: 'Contrato CT-2025-031 assinado' },
    ])
    expect(await documentosPrincipaisPossiveis('ctr-montareal-montagem')).toEqual([])
  })

  it('o histórico do documento segue o acesso ao documento (F17)', async () => {
    entrarComo('usr-rafael')
    expect((await listarHistorico('documento', 'doc-vertice-aditivo-minuta')).map((h) => h.descricao)).toContain(
      'Substituído por',
    )
    expect(await listarHistorico('documento', 'doc-especialista-curriculo')).toHaveLength(1)
    expect(await listarHistorico('documento', 'doc-montareal-cronograma')).toEqual([])
  })
})
