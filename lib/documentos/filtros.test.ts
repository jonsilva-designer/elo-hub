import { describe, expect, it } from 'vitest'
import type { DocumentoDetalhado } from '@/lib/dados/tipos'
import {
  escreverFiltrosDocumentos,
  filtrarDocumentos,
  lerFiltrosDocumentos,
  opcoesDosDocumentos,
  SEM_CLIENTE,
  type FiltrosDocumentos,
} from './filtros'

const doc = (id: string, resto: Partial<DocumentoDetalhado> = {}) =>
  ({
    id,
    nome: id,
    categoria: 'Relatório',
    clienteId: 'cli-a',
    nomeCliente: 'Alfa',
    status: 'Vigente',
    inativo: false,
    arquivo: { nome: `${id}.pdf`, tipo: 'application/pdf', tamanho: 10 },
    ...resto,
  }) as DocumentoDetalhado

const DOCS = [
  doc('Relatório anual'),
  doc('Aditivo antigo', { categoria: 'Aditivo Contratual', status: 'Superado' }),
  doc('Termo encerrado', { status: 'Encerrado', clienteId: 'cli-b', nomeCliente: 'Beta' }),
  doc('Ata inativa', { inativo: true }),
  doc('Currículo', { categoria: 'Documento do Especialista', clienteId: null, nomeCliente: null }),
]

const SEM: FiltrosDocumentos = { busca: '', cliente: null, categoria: null, status: [] }
const nomes = (f: Partial<FiltrosDocumentos>) => filtrarDocumentos(DOCS, { ...SEM, ...f }).map((d) => d.id)

describe('filtros da lista de documentos (parte 6, 4.4; CA-18.2)', () => {
  it('sem filtro, todos menos os inativos, na ordem recebida', () => {
    expect(nomes({})).toEqual(['Relatório anual', 'Aditivo antigo', 'Termo encerrado', 'Currículo'])
  })

  it('o inativo volta com o filtro Inativo; os status escolhidos valem para os ativos', () => {
    expect(nomes({ status: ['Inativo'] })).toEqual(['Ata inativa'])
    expect(nomes({ status: ['Superado', 'Inativo'] })).toEqual(['Aditivo antigo', 'Ata inativa'])
    expect(nomes({ status: ['Vigente'] })).toEqual(['Relatório anual', 'Currículo'])
  })

  it('busca pelo nome do documento e do arquivo, sem acento nem maiúscula', () => {
    expect(nomes({ busca: 'relatorio' })).toEqual(['Relatório anual'])
    expect(nomes({ busca: 'TERMO ENCERRADO.PDF' })).toEqual(['Termo encerrado'])
    expect(nomes({ busca: '  ' })).toHaveLength(4)
  })

  it('cliente, "Sem cliente" e categoria', () => {
    expect(nomes({ cliente: 'cli-b' })).toEqual(['Termo encerrado'])
    expect(nomes({ cliente: SEM_CLIENTE })).toEqual(['Currículo'])
    expect(nomes({ categoria: 'Aditivo Contratual' })).toEqual(['Aditivo antigo'])
  })

  it('as opções: os clientes dos documentos e "Sem cliente" quando há', () => {
    expect(opcoesDosDocumentos(DOCS).clientes).toEqual([
      { valor: 'cli-a', rotulo: 'Alfa' },
      { valor: 'cli-b', rotulo: 'Beta' },
      { valor: SEM_CLIENTE, rotulo: 'Sem cliente' },
    ])
    expect(opcoesDosDocumentos(DOCS.slice(0, 2)).clientes).toEqual([{ valor: 'cli-a', rotulo: 'Alfa' }])
  })

  it('lê e escreve o endereço; ignora o desconhecido (CA-16.2)', () => {
    const lidos = lerFiltrosDocumentos(
      new URLSearchParams('busca=ata&cliente=cli-a&categoria=Relatório&status=Superado,Inativo,Outro'),
      { clientes: ['cli-a', SEM_CLIENTE], categorias: ['Relatório'] },
    )
    expect(lidos).toEqual({ busca: 'ata', cliente: 'cli-a', categoria: 'Relatório', status: ['Superado', 'Inativo'] })
    expect(escreverFiltrosDocumentos(lidos)).toBe('busca=ata&cliente=cli-a&categoria=Relat%C3%B3rio&status=Superado,Inativo')
    expect(escreverFiltrosDocumentos(SEM)).toBe('')
    expect(
      lerFiltrosDocumentos(new URLSearchParams('cliente=cli-x&categoria=Nada'), { clientes: ['cli-a'], categorias: ['Relatório'] }),
    ).toEqual(SEM)
  })
})
