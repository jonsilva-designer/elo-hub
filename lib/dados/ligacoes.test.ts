import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { listarClientes, obterCliente } from './clientes'
import { contratoTemItensLigados } from './contratos'
import { temDemandaLigada } from './demandas'
import { documentosPrincipaisPossiveis, temDocumentoLigado } from './documentos'
import { escopoTemItensLigados } from './escopos'
import { especialistaTemItensLigados, especialistaTemVinculoAberto } from './especialistas'
import { AVALIACOES } from './mock/avaliacoes'
import { CONTRATOS } from './mock/contratos'
import { COMENTARIOS, DEMANDAS } from './mock/demandas'
import { DOCUMENTOS } from './mock/documentos'
import { ESCOPOS } from './mock/escopos'
import { ESPECIALISTAS } from './mock/especialistas'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

// Achados do code review de lib/dados (20/11/2026). Cada teste monta o próprio caso nos dados de exemplo, a partir de um
// registro sem nada ligado, e desfaz no fim: não depende de os dados de exemplo terem o caso pronto.

const desfazer: (() => void)[] = []

/** Põe o registro na lista até o fim do teste. */
function incluir<T>(lista: T[], registro: T) {
  lista.push(registro)
  desfazer.push(() => lista.splice(lista.indexOf(registro), 1))
}

async function primeiroQue<T>(lista: readonly T[], condicao: (x: T) => Promise<boolean>): Promise<T> {
  for (const x of lista) if (await condicao(x)) return x
  throw new Error('os dados de exemplo não têm o caso')
}

beforeEach(() => {
  limparCookies()
  entrarComo('usr-helena')
})

afterEach(() => {
  while (desfazer.length) desfazer.pop()!()
})

describe('o que impede excluir (DF-33)', () => {
  it('o contrato que uma avaliação de maturidade usa como referência (RN-25)', async () => {
    const livre = await primeiroQue(CONTRATOS, async (c) => !(await contratoTemItensLigados(c.id)))
    incluir(AVALIACOES, { ...AVALIACOES[0], id: 'ava-teste', clienteId: livre.clienteId, contratoId: livre.id })
    expect(await contratoTemItensLigados(livre.id)).toBe(true)
  })

  it('o escopo que um ciclo seguinte aponta como ciclo anterior (DF-46, DF-57)', async () => {
    const livre = await primeiroQue(ESCOPOS, async (e) => !(await escopoTemItensLigados(e.id)))
    incluir(ESCOPOS, { ...ESCOPOS[0], id: 'esc-teste', cicloAnteriorId: livre.id })
    expect(await escopoTemItensLigados(livre.id)).toBe(true)
  })

  it('o especialista com um contato registrado num comentário de demanda (DF-30)', async () => {
    const livre = await primeiroQue(ESPECIALISTAS, async (e) => !(await especialistaTemItensLigados(e.id)))
    incluir(COMENTARIOS, { ...COMENTARIOS[0], id: 'com-teste', tipo: 'Contato com especialista', especialistaId: livre.id })
    expect(await especialistaTemItensLigados(livre.id)).toBe(true)
  })

  it('id vazio não casa com tudo: não há registro ligado a ""', async () => {
    expect(await temDemandaLigada({ especialistaId: '' })).toBe(false)
    expect(await temDemandaLigada({ clienteId: '' })).toBe(false)
    expect(await temDocumentoLigado({ clienteId: '' })).toBe(false)
  })
})

describe('vínculo em aberto do especialista inativado (DF-51, CA-15.6)', () => {
  it('conta a demanda não resolvida, como o alerta "Especialista inativo"', async () => {
    const livre = await primeiroQue(ESPECIALISTAS, async (e) => !(await especialistaTemVinculoAberto(e.id)))
    const aberta = DEMANDAS.find((d) => d.status === 'Em atendimento')!
    incluir(DEMANDAS, { ...aberta, numero: 'ELO-2099-0001', especialistas: [{ id: livre.id, principal: true }] })
    expect(await especialistaTemVinculoAberto(livre.id)).toBe(true)
  })

  it('a demanda resolvida ou encerrada não conta', async () => {
    const livre = await primeiroQue(ESPECIALISTAS, async (e) => !(await especialistaTemVinculoAberto(e.id)))
    const fechada = DEMANDAS.find((d) => d.status === 'Encerrada')!
    incluir(DEMANDAS, { ...fechada, numero: 'ELO-2099-0002', especialistas: [{ id: livre.id, principal: true }] })
    expect(await especialistaTemVinculoAberto(livre.id)).toBe(false)
  })
})

describe('documento principal do contrato (F03)', () => {
  it('o documento Superado ou Encerrado não é oferecido como principal', async () => {
    const base = DOCUMENTOS.find((d) => d.contratoId && d.categoria === 'Contrato' && d.status === 'Vigente')!
    incluir(DOCUMENTOS, { ...base, id: 'doc-superado-teste', status: 'Superado' })
    incluir(DOCUMENTOS, { ...base, id: 'doc-encerrado-teste', status: 'Encerrado' })
    const ids = (await documentosPrincipaisPossiveis(base.contratoId!)).map((d) => d.id)
    expect(ids).toContain(base.id)
    expect(ids).not.toContain('doc-superado-teste')
    expect(ids).not.toContain('doc-encerrado-teste')
  })

  it('o principal de hoje continua na lista, mesmo Superado, marcado: editar o contrato não trava (revisão do código)', async () => {
    const base = DOCUMENTOS.find((d) => d.contratoId && d.categoria === 'Contrato' && d.status === 'Vigente')!
    incluir(DOCUMENTOS, { ...base, id: 'doc-principal-superado', nome: 'Contrato antigo', status: 'Superado' })
    const contrato = CONTRATOS.find((c) => c.id === base.contratoId)!
    const antes = contrato.documentoPrincipalId
    contrato.documentoPrincipalId = 'doc-principal-superado'
    desfazer.push(() => {
      contrato.documentoPrincipalId = antes
    })
    const possiveis = await documentosPrincipaisPossiveis(contrato.id)
    expect(possiveis).toContainEqual({ id: 'doc-principal-superado', nome: 'Contrato antigo (Superado)' })
  })
})

describe('as leituras devolvem cópias', () => {
  it('mudar o cliente lido não muda os dados de exemplo', async () => {
    const [primeiro] = await listarClientes()
    const status = primeiro.status
    primeiro.status = status === 'Ativo' ? 'Inativo' : 'Ativo'
    expect((await obterCliente(primeiro.id))!.status).toBe(status)
  })
})
