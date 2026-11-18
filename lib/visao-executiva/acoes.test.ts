import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { salvarTextoExecutivo } from './acoes'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_PERMISSAO = { ok: false, mensagem: 'Você não tem permissão para esta ação.' }
const SALVO = { ok: true, mensagem: 'Texto salvo. No protótipo, os dados não são gravados.' }

describe('salvarTextoExecutivo (CA-14.7, DF-73, DF-82)', () => {
  it('o Administrador e a Equipe vinculada salvam os três textos, também vazios', async () => {
    entrarComo('usr-rafael')
    expect(await salvarTextoExecutivo('cli-vertice', 'proximosPassos', 'Assinar o segundo aditivo.')).toEqual(SALVO)
    expect(await salvarTextoExecutivo('cli-vertice', 'principaisResultados', '')).toEqual(SALVO)
    entrarComo('usr-helena')
    expect(await salvarTextoExecutivo('cli-montareal', 'observacoesExecutivas', 'Ok.')).toEqual(SALVO)
  })

  it('fora do vínculo, no cadastro da ELO ou com campo inventado: a mesma recusa (CA-14.4)', async () => {
    entrarComo('usr-rafael')
    expect(await salvarTextoExecutivo('cli-montareal', 'proximosPassos', 'x')).toEqual(SEM_PERMISSAO)
    entrarComo('usr-helena')
    expect(await salvarTextoExecutivo('cli-elo', 'proximosPassos', 'x')).toEqual(SEM_PERMISSAO)
    expect(await salvarTextoExecutivo('cli-vertice', 'valorDoContrato', 'x')).toEqual(SEM_PERMISSAO)
    expect(await salvarTextoExecutivo('cli-vertice', 'proximosPassos', 1 as unknown as string)).toEqual(SEM_PERMISSAO)
  })
})
