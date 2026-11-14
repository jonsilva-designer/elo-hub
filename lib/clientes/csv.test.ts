import { describe, expect, it } from 'vitest'
import type { Cliente } from '@/lib/dados/tipos'
import { gerarCsvClientes, nomeDoArquivoClientes } from './csv'

const CABECALHO =
  'Razão Social;Nome Fantasia;CNPJ;Segmento;Cidade;Estado;Contato Principal;Cargo;Telefone;E-mail;Status;Observações'

const cliente = (parcial: Partial<Cliente>): Cliente => ({
  id: 'c',
  razaoSocial: 'Vértice Manutenção Industrial Ltda',
  nomeFantasia: 'Vértice Manutenção',
  cnpj: '21.473.509/0001-21',
  status: 'Ativo',
  ehCadastroElo: false,
  ...parcial,
})

const linhas = (csv: string) => csv.replace(/^﻿/, '').split('\r\n')

describe('gerarCsvClientes (DF-75, CA-16.3)', () => {
  it('começa com o BOM e o cabeçalho, separado por ponto e vírgula', () => {
    const csv = gerarCsvClientes([cliente({ cidade: 'Macaé', uf: 'RJ' })])
    expect(csv.startsWith('﻿')).toBe(true)
    expect(linhas(csv)[0]).toBe(CABECALHO)
    expect(linhas(csv)[1]).toBe('Vértice Manutenção Industrial Ltda;Vértice Manutenção;21.473.509/0001-21;;Macaé;RJ;;;;;Ativo;')
  })

  it('põe entre aspas o campo com ponto e vírgula, aspas ou quebra de linha', () => {
    const csv = gerarCsvClientes([cliente({ razaoSocial: 'Alfa; Beta Ltda', observacoes: 'Disse "sim"\nem março' })])
    expect(csv).toContain('\r\n"Alfa; Beta Ltda";')
    expect(csv).toContain(';"Disse ""sim""\nem março"')
  })

  it('não deixa um texto virar fórmula no Excel', () => {
    const csv = gerarCsvClientes([cliente({ observacoes: '=HIPERLINK("x")', telefone: '+55 22 2765-4310', cargo: '@diretor' })])
    expect(csv).toContain(`"'=HIPERLINK(""x"")"`)
    expect(csv).toContain(";'+55 22 2765-4310;")
    expect(csv).toContain(";'@diretor;")
  })

  it('sem clientes, só o cabeçalho', () => {
    expect(linhas(gerarCsvClientes([]))).toEqual([CABECALHO])
  })
})

describe('nomeDoArquivoClientes', () => {
  it('usa a data de Brasília', () => {
    expect(nomeDoArquivoClientes(new Date('2026-11-14T01:30:00Z'))).toBe('clientes-2026-11-13.csv')
    expect(nomeDoArquivoClientes(new Date('2026-11-14T15:00:00Z'))).toBe('clientes-2026-11-14.csv')
  })
})
