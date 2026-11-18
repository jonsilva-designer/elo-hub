import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarItensDaLista } from '@/lib/dados/listas-configuracao'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { excluirItem, inativarItem, incluirItem, reativarItem, renomearItem } from './acoes'
import { MENSAGENS_LISTA, mesmoNome } from './regras'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_PERMISSAO = { ok: false, mensagem: 'Você não tem permissão para esta ação.' }
const ok = (frase: string) => ({ ok: true, mensagem: `${frase} No protótipo, os dados não são gravados.` })
const nao = (mensagem: string) => ({ ok: false, mensagem })

describe('listas oficiais (DF-01, DF-38, CA-18.5, CA-18.6)', () => {
  it('o mesmo nome, sem diferenciar maiúsculas, acentos e espaços nas pontas', () => {
    expect(mesmoNome(' petrobrás ', 'Petrobras')).toBe(true)
    expect(mesmoNome('Porto do Açu', 'Porto do Acu')).toBe(true)
    expect(mesmoNome('Petrobras', 'Petrobras S.A.')).toBe(false)
  })

  it('a leitura traz os itens, o uso e o status; só o Administrador lê (CA-01.2)', async () => {
    entrarComo('usr-rafael')
    expect(await listarItensDaLista('contratantes')).toEqual([])
    entrarComo('usr-helena')
    const contratantes = await listarItensDaLista('contratantes')
    expect(contratantes.find((i) => i.nome === 'Petrobras')).toMatchObject({ ativo: true, fixo: false })
    expect(contratantes.find((i) => i.nome === 'Petrobras')!.uso).toBeGreaterThan(0)
    expect(contratantes.find((i) => i.nome === 'Vale')).toEqual({ nome: 'Vale', uso: 0, ativo: false, fixo: false })
    expect((await listarItensDaLista('categoriasDeDocumento')).filter((i) => i.fixo).map((i) => i.nome)).toEqual([
      'Contrato',
      'Proposta Comercial',
      'Documento do Especialista',
    ])
    expect(await listarItensDaLista('inventada')).toEqual([])
  })

  it('a Equipe é recusada em todas as ações (CA-01.4)', async () => {
    entrarComo('usr-rafael')
    expect(await incluirItem('contratantes', 'Vale do Rio')).toEqual(SEM_PERMISSAO)
    expect(await renomearItem('contratantes', 'Petrobras', 'Petrobras S.A.')).toEqual(SEM_PERMISSAO)
    expect(await inativarItem('contratantes', 'Petrobras')).toEqual(SEM_PERMISSAO)
    expect(await reativarItem('contratantes', 'Vale')).toEqual(SEM_PERMISSAO)
    expect(await excluirItem('contratantes', 'Vale')).toEqual(SEM_PERMISSAO)
  })

  it('inclui e renomeia sem repetir nome na lista; o próprio item pode mudar a caixa (CA-18.6)', async () => {
    entrarComo('usr-helena')
    expect(await incluirItem('contratantes', 'Vale do Rio Doce')).toEqual(ok('Item incluído.'))
    expect(await incluirItem('contratantes', 'petrobrás')).toEqual(nao(MENSAGENS_LISTA.repetido))
    expect(await incluirItem('contratantes', ' vale ')).toEqual(nao(MENSAGENS_LISTA.repetido))
    expect(await incluirItem('contratantes', '  ')).toEqual(nao(MENSAGENS_LISTA.nome))
    expect(await renomearItem('contratantes', 'Petrobras', 'PETROBRAS')).toEqual(ok(MENSAGENS_LISTA.renomeado))
    expect(await renomearItem('contratantes', 'Petrobras', 'Porto do Acu')).toEqual(nao(MENSAGENS_LISTA.repetido))
    expect(await renomearItem('contratantes', 'Inexistente', 'X')).toEqual(SEM_PERMISSAO)
  })

  it('inativa e reativa; o inativo sai das novas escolhas e fica nos registros (DF-38, CA-18.5)', async () => {
    entrarComo('usr-helena')
    expect(await inativarItem('contratantes', 'Petrobras')).toEqual(ok(MENSAGENS_LISTA.inativado))
    expect(await inativarItem('contratantes', 'Vale')).toEqual(nao('O item já está inativo.'))
    expect(await reativarItem('contratantes', 'Vale')).toEqual(ok('Item reativado.'))
    expect(await reativarItem('contratantes', 'Petrobras')).toEqual(nao('O item já está ativo.'))
  })

  it('exclui só o item nunca usado; os fixos das regras não mudam (DF-38)', async () => {
    entrarComo('usr-helena')
    expect(await excluirItem('contratantes', 'Petrobras')).toEqual(nao(MENSAGENS_LISTA.usado))
    expect(await excluirItem('contratantes', 'Vale')).toEqual(ok('Item excluído.'))
    expect(await excluirItem('categoriasDeDocumento', 'Documento do Especialista')).toEqual(nao(MENSAGENS_LISTA.fixo))
    expect(await inativarItem('categoriasDeDocumento', 'Contrato')).toEqual(nao(MENSAGENS_LISTA.fixo))
    expect(await renomearItem('categoriasDeDocumento', 'Proposta Comercial', 'Proposta')).toEqual(nao(MENSAGENS_LISTA.fixo))
  })
})
