import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { excluirEspecialista } from './acoes'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_PERMISSAO = 'Você não tem permissão para esta ação.'

describe('excluirEspecialista (RN-13, DF-33)', () => {
  it('a Helena exclui o especialista sem vínculo, com justificativa', async () => {
    entrarComo('usr-helena')
    expect(await excluirEspecialista('esp-contratos', 'Cadastro feito por engano.')).toEqual({
      ok: true,
      mensagem: 'Especialista excluído. No protótipo, os dados não são gravados.',
    })
    expect(await excluirEspecialista('esp-contratos', ' ')).toEqual({ ok: false, mensagem: 'Escreva a justificativa da exclusão.' })
  })

  it('com vínculo, mesmo em cliente fora da vista, não exclui', async () => {
    entrarComo('usr-helena')
    expect(await excluirEspecialista('esp-juridico', 'Motivo')).toEqual({
      ok: false,
      mensagem: 'Este especialista tem vínculos e não pode ser excluído.',
    })
  })

  it('a Equipe não exclui; id que não existe recebe a mesma recusa (matriz 4.3)', async () => {
    entrarComo('usr-rafael')
    expect(await excluirEspecialista('esp-contratos', 'Motivo')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
    entrarComo('usr-helena')
    expect(await excluirEspecialista('esp-nao-existe', 'Motivo')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
  })
})
