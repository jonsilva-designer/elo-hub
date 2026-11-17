import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarAtividades } from '@/lib/dados/atividades'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { gerarCsvAtividades, nomeDoArquivoAtividades } from './csv'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

describe('CSV das atividades (DF-75, CA-16.3, CA-08.8)', () => {
  it('uma coluna por campo, com o executor, a conclusão e a situação do prazo', async () => {
    entrarComo('usr-helena')
    const atividades = (await listarAtividades()).filter((a) =>
      ['atv-licencas-vistoria', 'atv-licencas-levantamento'].includes(a.id),
    )
    const linhas = gerarCsvAtividades(atividades).replace(/^﻿/, '').split('\r\n')
    expect(linhas[0]).toBe(
      'Atividade;Plano;Escopo;Cliente;Responsável;Executor;Prazo;Prioridade;Status;Conclusão;Situação do Prazo',
    )
    expect(linhas[1]).toContain('Agendar a vistoria do órgão ambiental;Regularização das licenças;Regularização documental;')
    expect(linhas[1]).toContain(';Ana Ribeiro (SSMA do cliente);')
    expect(linhas[1]).toMatch(/;Média;Não iniciada;;Próxima do prazo$/)
    expect(linhas[2]).toMatch(/;15\/05\/2026;Alta;Concluída;20\/05\/2026;$/)
  })

  it('o nome do arquivo tem a data de Brasília', () => {
    expect(nomeDoArquivoAtividades(new Date('2026-11-17T02:30:00Z'))).toBe('atividades-2026-11-16.csv')
  })
})
