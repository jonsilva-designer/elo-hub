import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarAtividades } from '@/lib/dados/atividades'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import {
  CHAVE_FILTROS_DAS_ATIVIDADES,
  escoposDasAtividades,
  escreverFiltrosAtividades,
  filtrarAtividades,
  lerFiltrosAtividades,
  responsaveisDasAtividades,
  type FiltrosAtividades,
} from './filtros'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const OPCOES = { usuarioId: 'usr-rafael', responsaveis: ['usr-rafael', 'usr-helena'], escopos: ['esc-vertice-documental'] }

const TODAS: FiltrosAtividades = { busca: '', responsavel: null, status: [], prazo: [], escopo: null }

async function doUsuario(id: string) {
  entrarComo(id)
  return listarAtividades()
}

const nomes = (lista: { nome: string }[]) => lista.map((a) => a.nome)

describe('endereço dos filtros de Minhas atividades (CA-08.5, CA-16.2)', () => {
  it('guarda os filtros com uma chave própria', () => {
    expect(CHAVE_FILTROS_DAS_ATIVIDADES).toBe('elo:filtros-atividades')
  })

  it('sem responsável no endereço, a pessoa que entrou; "todos", nenhum filtro de responsável', () => {
    expect(lerFiltrosAtividades(new URLSearchParams(''), OPCOES).responsavel).toBe('usr-rafael')
    expect(lerFiltrosAtividades(new URLSearchParams('responsavel=todos'), OPCOES).responsavel).toBeNull()
    expect(lerFiltrosAtividades(new URLSearchParams('responsavel=usr-helena'), OPCOES).responsavel).toBe('usr-helena')
  })

  it('o que não está nas opções é ignorado; o responsável forjado volta para a pessoa que entrou', () => {
    const params = new URLSearchParams('responsavel=usr-marcos&status=Arquivada,Concluída&prazo=Vencida,Atrasada&escopo=esc-x')
    expect(lerFiltrosAtividades(params, OPCOES)).toEqual({
      busca: '',
      responsavel: 'usr-rafael',
      status: ['Concluída'],
      prazo: ['Atrasada'],
      escopo: null,
    })
  })

  it('lê e escreve o endereço, ida e volta; o responsável padrão não vai para o endereço', () => {
    const filtros: FiltrosAtividades = {
      busca: 'licença',
      responsavel: null,
      status: ['Não iniciada', 'Em andamento'],
      prazo: ['Atrasada', 'Próxima do prazo'],
      escopo: 'esc-vertice-documental',
    }
    const texto = escreverFiltrosAtividades(filtros, 'usr-rafael')
    expect(texto).toContain('responsavel=todos')
    expect(texto).toContain('prazo=Atrasada,Pr%C3%B3xima+do+prazo')
    expect(lerFiltrosAtividades(new URLSearchParams(texto), OPCOES)).toEqual(filtros)
    expect(escreverFiltrosAtividades({ ...TODAS, responsavel: 'usr-rafael' }, 'usr-rafael')).toBe('')
  })
})

describe('filtrarAtividades (CA-08.4, CA-08.5)', () => {
  it('o Rafael abre com as dele: as abertas pelo prazo, as atrasadas e as próximas no topo, as fechadas no fim', async () => {
    const atividades = await doUsuario('usr-rafael')
    expect(nomes(filtrarAtividades(atividades, { ...TODAS, responsavel: 'usr-rafael' }))).toEqual([
      'Protocolar a renovação da licença de operação',
      'Agendar a vistoria do órgão ambiental',
      'Montar o calendário de capacitação técnica',
      'Preparar a auditoria interna dos documentos',
      'Entregar o relatório de resultados do ciclo',
      'Levantar as licenças vencidas',
      'Renovar o alvará da base antiga',
      'Instalar os agentes nas estações',
    ])
  })

  it('a Helena abre com as dela; com todos os responsáveis, as 12', async () => {
    const atividades = await doUsuario('usr-helena')
    expect(nomes(filtrarAtividades(atividades, { ...TODAS, responsavel: 'usr-helena' }))).toEqual([
      'Emitir os ASOs da equipe embarcada',
      'Inspecionar as soldas do módulo 3',
      'Definir os indicadores de desempenho da operação',
      'Concluir os treinamentos de segurança offshore',
    ])
    expect(filtrarAtividades(atividades, TODAS)).toHaveLength(12)
  })

  it('pelo prazo: atrasadas, próximas e no prazo (abertas sem as outras duas situações)', async () => {
    const atividades = await doUsuario('usr-helena')
    expect(nomes(filtrarAtividades(atividades, { ...TODAS, prazo: ['Atrasada'] }))).toEqual([
      'Protocolar a renovação da licença de operação',
      'Emitir os ASOs da equipe embarcada',
      'Inspecionar as soldas do módulo 3',
    ])
    expect(nomes(filtrarAtividades(atividades, { ...TODAS, prazo: ['Próxima do prazo'] }))).toEqual([
      'Agendar a vistoria do órgão ambiental',
      'Definir os indicadores de desempenho da operação',
    ])
    expect(nomes(filtrarAtividades(atividades, { ...TODAS, prazo: ['No prazo'] }))).toEqual([
      'Montar o calendário de capacitação técnica',
      'Concluir os treinamentos de segurança offshore',
      'Preparar a auditoria interna dos documentos',
    ])
  })

  it('pelo status e pelo escopo, combinados', async () => {
    const atividades = await doUsuario('usr-helena')
    expect(
      nomes(filtrarAtividades(atividades, { ...TODAS, status: ['Concluída'], escopo: 'esc-vertice-documental' })),
    ).toEqual(['Levantar as licenças vencidas'])
  })

  it('a busca acha pela atividade, pelo plano e pelo cliente, sem acento nem maiúsculas', async () => {
    const atividades = await doUsuario('usr-helena')
    expect(filtrarAtividades(atividades, { ...TODAS, busca: 'MONTAREAL' })).toHaveLength(1)
    expect(filtrarAtividades(atividades, { ...TODAS, busca: 'licencas' }).length).toBeGreaterThan(1)
    expect(nomes(filtrarAtividades(atividades, { ...TODAS, busca: 'offshore' }))).toEqual([
      'Emitir os ASOs da equipe embarcada',
      'Concluir os treinamentos de segurança offshore',
    ])
    expect(filtrarAtividades(atividades, { ...TODAS, busca: ' . ' })).toHaveLength(12)
  })
})

describe('opções dos filtros', () => {
  it('os responsáveis e os escopos das atividades que o usuário vê, sem repetir, pelo nome', async () => {
    const atividades = await doUsuario('usr-rafael')
    // O Rafael vê também as atividades da Helena nos clientes dele.
    expect(responsaveisDasAtividades(atividades)).toEqual([
      { valor: 'usr-helena', rotulo: 'Helena Prado' },
      { valor: 'usr-rafael', rotulo: 'Rafael Souza' },
    ])
    const escopos = escoposDasAtividades(atividades)
    expect(escopos.map((e) => e.valor)).toEqual([
      'esc-vertice-diagnostico',
      'esc-atlantica-2025',
      'esc-rede-norte-rmm',
      'esc-vertice-mobilizacao',
      'esc-vertice-documental',
    ])
    expect(escopos[0]).toEqual({
      valor: 'esc-vertice-diagnostico',
      rotulo: 'Diagnóstico para nova proposta',
      cliente: 'Vértice Manutenção',
    })
  })
})
