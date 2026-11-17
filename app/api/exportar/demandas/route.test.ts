// @vitest-environment node
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { GET } from './route'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const pedir = (busca = '') => GET(new NextRequest(`http://localhost/api/exportar/demandas${busca}`))

const linhas = async (busca = '') => (await (await pedir(busca)).text()).replace(/^﻿/, '').split('\r\n')

describe('GET /api/exportar/demandas (DF-75, CA-16.3; parte 5, critério 15)', () => {
  it('o Administrador baixa o CSV de todas, com BOM, o nome datado e o cabeçalho', async () => {
    entrarComo('usr-helena')
    const resposta = await pedir()
    expect(resposta.status).toBe(200)
    expect(resposta.headers.get('content-disposition')).toMatch(/^attachment; filename="demandas-\d{4}-\d{2}-\d{2}\.csv"$/)
    const tudo = await linhas()
    expect(tudo).toHaveLength(12)
    expect(tudo[0]).toBe(
      'Número;Abertura;Cliente;Contrato;Escopo;Origem;Assunto;Categoria;Criticidade;Triagem;Atendimento;Especialistas;Prazo;Vencida;Status;Encerramento',
    )
  })

  it('respeita os filtros do endereço, com o especialista principal marcado', async () => {
    entrarComo('usr-helena')
    const [, linha] = await linhas('?busca=ELO-2026-0003')
    expect(linha).toContain('ELO-2026-0003;02/04/2026;Vértice Manutenção;CT-2025-031;Regularização documental;Cliente;')
    expect(linha).toContain('Beatriz Fontes (principal), Daniela Prates')
    expect(linha).toMatch(/;Sim;Em atendimento;$/)
    expect(await linhas('?status=Encerrada')).toHaveLength(3)
  })

  it('a Equipe recebe 403; sem sessão, 401', async () => {
    entrarComo('usr-rafael')
    expect((await pedir()).status).toBe(403)
    limparCookies()
    expect((await pedir()).status).toBe(401)
  })
})
