import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { excluirEspecialista, salvarEspecialista } from './acoes'
import { ESTADO_INICIAL_SALVAR_ESPECIALISTA } from './estados'
import { MENSAGENS_ESPECIALISTA } from './validacao'

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

const NOVO: Record<string, string> = {
  nome: 'Helena Ribas',
  especialidade: 'Financeiro',
  email: 'helena.ribas@exemplo.com.br',
  telefone: '(21) 99999-0000',
  status: 'Ativo',
}

function formulario(campos: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [chave, valor] of Object.entries(campos)) fd.set(chave, valor)
  return fd
}

const salvar = (campos: Record<string, string>) =>
  salvarEspecialista(ESTADO_INICIAL_SALVAR_ESPECIALISTA, formulario({ ...NOVO, ...campos }))

describe('salvarEspecialista (parte 5, 5.5)', () => {
  it('a Helena cadastra e volta para a lista; edita e volta para o especialista', async () => {
    entrarComo('usr-helena')
    expect((await salvar({})).sucesso).toEqual({
      mensagem: 'Especialista salvo. No protótipo, os dados não são gravados.',
      destino: '/especialistas',
    })
    expect((await salvar({ id: 'esp-esg' })).sucesso?.destino).toBe('/especialistas/esp-esg')
  })

  it('a Equipe é recusada no cadastro e na edição (matriz 4.3)', async () => {
    entrarComo('usr-rafael')
    expect(await salvar({})).toMatchObject({ erroGeral: SEM_PERMISSAO })
    expect(await salvar({ id: 'esp-esg' })).toMatchObject({ erroGeral: SEM_PERMISSAO })
  })

  it('id que não existe: recusa', async () => {
    entrarComo('usr-helena')
    expect(await salvar({ id: 'esp-nao-existe' })).toMatchObject({ erroGeral: SEM_PERMISSAO })
  })

  it('os erros voltam por campo', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ telefone: '' })).erros).toEqual({ telefone: MENSAGENS_ESPECIALISTA.telefone })
  })

  it('inativar o Ativo com vínculo aberto salva e avisa que os vínculos continuam (DF-51)', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({
      id: 'esp-juridico',
      nome: 'Beatriz Fontes',
      especialidade: 'Jurídico (contratos, cláusulas e compliance)',
      email: 'beatriz.fontes@exemplo.com.br',
      status: 'Inativo',
    })
    expect(estado.sucesso?.mensagem).toBe(
      'Especialista salvo. Os vínculos em aberto continuam e aparecem para troca. No protótipo, os dados não são gravados.',
    )
  })
})
