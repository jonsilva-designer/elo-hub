import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarAvaliacoesDoCliente, obterAvaliacao } from '@/lib/dados/maturidade'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { concluirAvaliacao, reabrirAvaliacao, salvarAvaliacao } from './acoes'
import { ESTADO_INICIAL_SALVAR_AVALIACAO } from './estados'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)
// Parcial: as leituras continuam as verdadeiras; um teste troca uma resposta de obterAvaliacao com mockResolvedValueOnce.
vi.mock('@/lib/dados/maturidade', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/dados/maturidade')>()
  return { ...original, obterAvaliacao: vi.fn(original.obterAvaliacao) }
})

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

  it('valor fora das listas, enviado à mão, conta como em branco, e o contrato que não existe também (CA-20.3)', async () => {
    entrarComo('usr-helena')
    const r = await salvar({
      clienteId: 'cli-montareal',
      data: '2026-11-14',
      avaliadorId: 'usr-helena',
      contratoId: 'ctr-de-outro-cliente',
      'nivel-0': 'Excelente',
      'nivel-1': 'Básica',
      maturidadeGeral: 'Ótima',
      prontidao: 'Talvez',
    })
    expect(r.sucesso).toBeDefined()
    expect(r.valores?.niveis.slice(0, 2)).toEqual(['', 'Básica'])
    expect(r.valores?.maturidadeGeral).toBe('')
    expect(r.valores?.prontidao).toBe('')
    expect(r.valores?.contratoId).toBe('')
  })

  it('o contrato de referência só aceita contrato do mesmo cliente (CA-20.3, critério 23)', async () => {
    entrarComo('usr-helena')
    const base = { clienteId: 'cli-vertice', data: '2026-11-14', avaliadorId: 'usr-helena' }
    expect((await salvar({ ...base, contratoId: 'ctr-vertice-manutencao' })).valores?.contratoId).toBe('ctr-vertice-manutencao')
    expect((await salvar({ ...base, contratoId: 'ctr-montareal-montagem' })).valores?.contratoId).toBe('')
  })

  it('na edição, vale o cliente da avaliação', async () => {
    entrarComo('usr-helena')
    const base = { avaliacaoId: 'ava-vertice-3', data: '2026-11-05', avaliadorId: 'usr-rafael' }
    expect((await salvar({ ...base, contratoId: 'ctr-vertice-proposta' })).valores?.contratoId).toBe('ctr-vertice-proposta')
    expect((await salvar({ ...base, contratoId: 'ctr-atlantica-porto' })).valores?.contratoId).toBe('')
  })

  it('nada muda nos dados: salvar só simula', async () => {
    entrarComo('usr-helena')
    await salvar({ clienteId: 'cli-vertice', data: '2026-11-14', avaliadorId: 'usr-helena' })
    expect(await listarAvaliacoesDoCliente('cli-vertice')).toHaveLength(3)
  })
})

describe('concluirAvaliacao e reabrirAvaliacao (CA-20.2, RN-22, CA-20.5)', () => {
  it('o Rafael é recusado nas duas, mesmo na avaliação que ele edita (critério 17)', async () => {
    entrarComo('usr-rafael')
    expect(await concluirAvaliacao('ava-vertice-3')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
    expect(await reabrirAvaliacao('ava-vertice-2', 'Erro')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
  })

  it('concluir com falta lista o que falta, na ordem das dimensões (critério 16)', async () => {
    entrarComo('usr-helena')
    expect(await concluirAvaliacao('ava-vertice-3')).toEqual({
      ok: false,
      mensagem:
        'Para concluir, preencha: Gestão e qualidade, Saúde, segurança e ambiente, Gestão comercial e contratual, Maturidade geral, Prontidão.',
    })
  })

  it('concluir uma Concluída é recusado', async () => {
    entrarComo('usr-helena')
    expect(await concluirAvaliacao('ava-vertice-2')).toEqual({ ok: false, mensagem: 'Esta avaliação já está concluída.' })
  })

  it('uma avaliação Em elaboração completa conclui (critério 16)', async () => {
    entrarComo('usr-helena')
    const completa = await obterAvaliacao('ava-vertice-2')
    vi.mocked(obterAvaliacao).mockResolvedValueOnce({ ...completa!, status: 'Em elaboração' })
    expect(await concluirAvaliacao('ava-vertice-2')).toEqual({
      ok: true,
      mensagem: 'Avaliação concluída. No protótipo, os dados não são gravados.',
    })
  })

  it('reabrir exige justificativa e só vale para a Concluída (critério 18)', async () => {
    entrarComo('usr-helena')
    expect(await reabrirAvaliacao('ava-vertice-2', '  ')).toEqual({
      ok: false,
      mensagem: 'Escreva a justificativa da reabertura.',
    })
    expect(await reabrirAvaliacao('ava-vertice-2', 'Nível revisto')).toEqual({
      ok: true,
      mensagem: 'Avaliação reaberta. No protótipo, os dados não são gravados.',
    })
    expect(await reabrirAvaliacao('ava-vertice-3', 'x')).toEqual({
      ok: false,
      mensagem: 'Só uma avaliação concluída pode ser reaberta.',
    })
  })

  it('um id que não existe ou forjado recebe a mesma recusa (ponto de atenção 2)', async () => {
    entrarComo('usr-helena')
    expect(await concluirAvaliacao('ava-nao-existe')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
    expect(await reabrirAvaliacao('ava-nao-existe', 'Motivo')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
    expect(await concluirAvaliacao(42 as unknown as string)).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
    expect(await reabrirAvaliacao('ava-vertice-2', 7 as unknown as string)).toEqual({
      ok: false,
      mensagem: 'Escreva a justificativa da reabertura.',
    })
  })
})
