import { describe, expect, it } from 'vitest'
import type { ContratoDetalhado } from '@/lib/dados/tipos'
import { gerarCsvContratos, nomeDoArquivoContratos } from './csv'

const CABECALHO = [
  'Código',
  'Cliente',
  'Contratante',
  'Objeto',
  'Serviços',
  'Data da Proposta',
  'Tipo de Vigência',
  'Início da Vigência',
  'Término da Vigência',
  'Dias Restantes',
  'Status da Vigência',
  'Valor',
  'Responsável ELO',
  'Status',
  'Observações',
].join(';')

const CONTRATO: ContratoDetalhado = {
  id: 'ctr-vertice-manutencao',
  clienteId: 'cli-vertice',
  codigo: 'CT-2025-031',
  contratante: 'Petrobras',
  objeto: 'Manutenção industrial da planta de Macaé',
  servicos: ['Manutenção Industrial', 'Manutenção Mecânica'],
  dataProposta: '2025-05-10',
  tipoVigencia: 'Prazo determinado',
  inicio: '2025-07-01',
  termino: '2027-06-30',
  valor: 1850000,
  responsavelId: 'usr-helena',
  status: 'Ativo',
  observacoes: '',
  nomeCliente: 'Vértice Manutenção',
  nomeResponsavel: 'Helena Prado',
  vigencia: { status: 'Vigente', diasRestantes: 228 },
}

const linhas = (csv: string) => csv.replace(/^﻿/, '').split('\r\n')

describe('gerarCsvContratos (CA-16.3, DF-75)', () => {
  it('traz o cabeçalho na ordem e uma linha por contrato, com datas, serviços e valor no formato brasileiro', () => {
    const [cabecalho, linha] = linhas(gerarCsvContratos([CONTRATO]))
    expect(cabecalho).toBe(CABECALHO)
    expect(linha).toBe(
      'CT-2025-031;Vértice Manutenção;Petrobras;Manutenção industrial da planta de Macaé;Manutenção Industrial, Manutenção Mecânica;' +
        '10/05/2025;Prazo determinado;01/07/2025;30/06/2027;228;Vigente;1.850.000,00;Helena Prado;Ativo;',
    )
  })

  it('sem vigência, sem datas e sem valor, as colunas ficam vazias', () => {
    const proposta: ContratoDetalhado = { ...CONTRATO, status: 'Proposta', inicio: null, termino: null, valor: null, vigencia: null }
    const [, linha] = linhas(gerarCsvContratos([proposta]))
    expect(linha.split(';').slice(7, 12)).toEqual(['', '', '', '', ''])
  })

  it('o arquivo leva a data de Brasília no nome', () => {
    expect(nomeDoArquivoContratos(new Date('2026-11-14T12:00:00Z'))).toBe('contratos-2026-11-14.csv')
    expect(nomeDoArquivoContratos(new Date('2026-11-15T01:00:00Z'))).toBe('contratos-2026-11-14.csv')
  })
})
