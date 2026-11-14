import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarAvaliacoesDoCliente } from '@/lib/dados/maturidade'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { salvarAvaliacao } from './acoes'
import { ESTADO_INICIAL_SALVAR_AVALIACAO } from './estados'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_PERMISSAO = 'Você não tem permissão para esta ação.'
const CONCLUIDA = 'Esta avaliação está concluída e não muda. O Administrador pode reabri-la.'

function formulario(campos: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [chave, valor] of Object.entries(campos)) fd.set(chave, valor)
  return fd
}

const salvar = (campos: Record<string, string>) => salvarAvaliacao(ESTADO_INICIAL_SALVAR_AVALIACAO, formulario(campos))

describe('salvarAvaliacao (F20, CA-20.1, RN-19, RN-23)', () => {
  it('na nova avaliação da Montareal, o avaliador precisa ter vínculo (Rafael não tem; Marcos está inativo)', async () => {
    entrarComo('usr-helena')
    for (const avaliadorId of ['usr-rafael', 'usr-marcos']) {
      const r = await salvar({ clienteId: 'cli-montareal', data: '2026-11-14', avaliadorId })
      expect(r.erros.avaliadorId, avaliadorId).toBe('O avaliador precisa ter vínculo com o cliente.')
    }
  })

  it('uma nova avaliação válida responde como salva e volta à aba Maturidade do cliente', async () => {
    entrarComo('usr-helena')
    const r = await salvar({ clienteId: 'cli-montareal', data: '2026-11-14', avaliadorId: 'usr-helena', 'media-0': '3,5' })
    expect(r.erros).toEqual({})
    expect(r.sucesso).toEqual({
      mensagem: 'Avaliação salva. No protótipo, os dados não são gravados.',
      destino: '/clientes/cli-montareal?aba=maturidade',
    })
  })

  it('o Rafael edita a avaliação Em elaboração da Vértice e volta à página dela (CA-20.5)', async () => {
    entrarComo('usr-rafael')
    const r = await salvar({ avaliacaoId: 'ava-vertice-3', data: '2026-11-05', avaliadorId: 'usr-rafael' })
    expect(r.erros).toEqual({})
    expect(r.sucesso?.destino).toBe('/avaliacoes/ava-vertice-3')
  })

  it('o Rafael é recusado fora do vínculo, sem saber se a avaliação existe (ponto de atenção 2)', async () => {
    entrarComo('usr-rafael')
    expect((await salvar({ avaliacaoId: 'ava-montareal-1', data: '2026-11-05', avaliadorId: 'usr-rafael' })).erroGeral).toBe(
      SEM_PERMISSAO,
    )
    expect((await salvar({ clienteId: 'cli-montareal', data: '2026-11-05', avaliadorId: 'usr-rafael' })).erroGeral).toBe(
      SEM_PERMISSAO,
    )
    expect((await salvar({ avaliacaoId: 'ava-nao-existe', data: '2026-11-05', avaliadorId: 'usr-rafael' })).erroGeral).toBe(
      SEM_PERMISSAO,
    )
  })

  it('a avaliação Concluída não muda (RN-23)', async () => {
    entrarComo('usr-rafael')
    expect((await salvar({ avaliacaoId: 'ava-vertice-2', data: '2026-09-15', avaliadorId: 'usr-rafael' })).erroGeral).toBe(
      CONCLUIDA,
    )
  })

  it('não se avalia cliente Inativo nem o cadastro da ELO', async () => {
    entrarComo('usr-helena')
    for (const clienteId of ['cli-fortec', 'cli-elo', '']) {
      const r = await salvar({ clienteId, data: '2026-11-14', avaliadorId: 'usr-helena' })
      expect(r.erroGeral, clienteId).toBe(SEM_PERMISSAO)
    }
  })

  it('a média errada volta com o erro na linha certa e com o que foi digitado', async () => {
    entrarComo('usr-helena')
    const r = await salvar({ clienteId: 'cli-vertice', data: '2026-11-14', avaliadorId: 'usr-helena', 'media-2': '5,01' })
    expect(r.erros.medias).toEqual({ 2: 'A média vai de 1,00 a 5,00.' })
    expect(r.valores?.medias[2]).toBe('5,01')
  })

  it('nada muda nos dados: salvar só simula', async () => {
    entrarComo('usr-helena')
    await salvar({ clienteId: 'cli-vertice', data: '2026-11-14', avaliadorId: 'usr-helena' })
    expect(await listarAvaliacoesDoCliente('cli-vertice')).toHaveLength(3)
  })
})
