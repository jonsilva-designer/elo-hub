import { beforeEach, describe, expect, it, vi } from 'vitest'
import { hojeEmBrasilia, somarDias } from '@/lib/formato'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { salvarEscopo } from './acoes'
import { ESTADO_INICIAL_SALVAR_ESCOPO } from './estados'
import { MENSAGENS_ESCOPO } from './validacao'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_PERMISSAO = 'Você não tem permissão para esta ação.'

/** Um escopo novo no contrato de manutenção da Vértice, válido, como o formulário manda. */
const NOVO: Record<string, string> = {
  contratoId: 'ctr-vertice-manutencao',
  nome: 'Treinamento de NR-10',
  responsavelId: 'usr-rafael',
  status: 'Planejado',
  prioridade: 'Média',
  criticidade: 'Moderada',
  justificativaCriticidade: 'Treinamentos vencem no semestre.',
}

function formulario(campos: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [chave, valor] of Object.entries(campos)) fd.set(chave, valor)
  return fd
}

const salvar = (campos: Record<string, string>) => salvarEscopo(ESTADO_INICIAL_SALVAR_ESCOPO, formulario({ ...NOVO, ...campos }))

/** A edição da Regularização documental, com os dados dela. */
const EDICAO_DOCUMENTAL = {
  id: 'esc-vertice-documental',
  nome: 'Regularização documental',
  status: 'Em andamento',
  prioridade: 'Alta',
}

describe('salvarEscopo (parte 3, 5.8; critérios 9, 13, 14, 20 e 21)', () => {
  it('o Rafael é recusado no cadastro e na edição', async () => {
    entrarComo('usr-rafael')
    expect(await salvar({})).toMatchObject({ erroGeral: SEM_PERMISSAO })
    expect(await salvar(EDICAO_DOCUMENTAL)).toMatchObject({ erroGeral: SEM_PERMISSAO })
  })

  it('contrato ou escopo que não existe: recusa, sem dizer que não existe', async () => {
    entrarComo('usr-helena')
    expect(await salvar({ contratoId: 'ctr-nao-existe' })).toMatchObject({ erroGeral: SEM_PERMISSAO })
    expect(await salvar({ id: 'esc-nao-existe' })).toMatchObject({ erroGeral: SEM_PERMISSAO })
  })

  it('o cadastro pede a criticidade e a justificativa dela (CA-05.1)', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({ criticidade: '', justificativaCriticidade: '' })
    expect(estado.erros).toEqual({
      criticidade: MENSAGENS_ESCOPO.criticidade,
      justificativaCriticidade: MENSAGENS_ESCOPO.justificativaCriticidade,
    })
    expect(estado.sucesso).toBeUndefined()
  })

  it('criticidade fora da lista conta como vazia', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ criticidade: 'Gravíssima' })).erros).toEqual({ criticidade: MENSAGENS_ESCOPO.criticidade })
  })

  it('o responsável precisa ter vínculo com o cliente (RN-19)', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ responsavelId: 'usr-marcos' })).erros).toEqual({
      responsavelId: MENSAGENS_ESCOPO.responsavelSemVinculo,
    })
  })

  it('o ciclo anterior de outro cliente volta vazio (DF-57, RN-02)', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({ cicloAnteriorId: 'esc-montareal-montagem' })
    expect(estado.valores?.cicloAnteriorId).toBe('')
    expect(estado.sucesso).toBeDefined()
  })

  it('o ciclo anterior do mesmo cliente fica', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ cicloAnteriorId: 'esc-vertice-qualidade' })).valores?.cicloAnteriorId).toBe('esc-vertice-qualidade')
  })

  it('o escopo nasce aberto (6.1)', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ status: 'Concluído' })).erros).toEqual({ status: MENSAGENS_ESCOPO.status })
  })

  it('salvo no cadastro: volta para o contrato, com o aviso de que nada foi gravado', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({})
    expect(estado).toMatchObject({
      erros: {},
      sucesso: {
        mensagem: 'Escopo salvo. No protótipo, os dados não são gravados.',
        destino: '/contratos/ctr-vertice-manutencao',
      },
    })
  })

  it('contrato Encerrado não recebe escopo (RN-23)', async () => {
    entrarComo('usr-helena')
    expect(await salvar({ contratoId: 'ctr-ondamar-apoio' })).toMatchObject({ erroGeral: MENSAGENS_ESCOPO.contratoFechado })
  })
})

describe('aviso da RN-21 (CA-05.8; ponto de atenção 3)', () => {
  const hoje = hojeEmBrasilia(new Date())
  const terminoDaMobilizacao = somarDias(hoje, 20)
  const naMobilizacao = (campos: Record<string, string>) =>
    salvar({ contratoId: 'ctr-vertice-mobilizacao', ...campos })

  it('conclusão prevista depois do término: devolve o aviso, sem salvar', async () => {
    entrarComo('usr-helena')
    const estado = await naMobilizacao({ conclusaoPrevista: somarDias(hoje, 21) })
    const [ano, mes, dia] = terminoDaMobilizacao.split('-')
    expect(estado.aviso).toBe(
      `A conclusão prevista é depois do término da vigência do contrato (${dia}/${mes}/${ano}). Salvar mesmo assim?`,
    )
    expect(estado.erros).toEqual({})
    expect(estado.sucesso).toBeUndefined()
    expect(estado.valores?.conclusaoPrevista).toBe(somarDias(hoje, 21))
  })

  it('"Salvar mesmo assim" salva', async () => {
    entrarComo('usr-helena')
    const estado = await naMobilizacao({ conclusaoPrevista: somarDias(hoje, 21), confirmarAviso: 'sim' })
    expect(estado.aviso).toBeUndefined()
    expect(estado.sucesso?.destino).toBe('/contratos/ctr-vertice-mobilizacao')
  })

  it('conclusão prevista no próprio dia do término não dá aviso', async () => {
    entrarComo('usr-helena')
    const estado = await naMobilizacao({ conclusaoPrevista: terminoDaMobilizacao })
    expect(estado.aviso).toBeUndefined()
    expect(estado.sucesso).toBeDefined()
  })

  it('Prazo indeterminado e contrato em Proposta não dão aviso', async () => {
    entrarComo('usr-helena')
    for (const contratoId of ['ctr-atlantica-porto', 'ctr-vertice-proposta']) {
      const estado = await salvar({ contratoId, conclusaoPrevista: '2030-06-28' })
      expect(estado.aviso, contratoId).toBeUndefined()
      expect(estado.sucesso, contratoId).toBeDefined()
    }
  })

  it('o aviso só vem com o resto certo', async () => {
    entrarComo('usr-helena')
    const estado = await naMobilizacao({ conclusaoPrevista: somarDias(hoje, 21), nome: '' })
    expect(estado.erros).toEqual({ nome: MENSAGENS_ESCOPO.nome })
    expect(estado.aviso).toBeUndefined()
  })
})

describe('edição do escopo', () => {
  it('a criticidade do formulário é ignorada: muda só por Reclassificar', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({ ...EDICAO_DOCUMENTAL, criticidade: 'Baixa', justificativaCriticidade: 'outra' })
    expect(estado.sucesso?.destino).toBe('/escopos/esc-vertice-documental')
    expect(estado.valores?.criticidade).toBe('Alta')
  })

  it('o contrato é o do escopo, e o do formulário é ignorado', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({ ...EDICAO_DOCUMENTAL, contratoId: 'ctr-ondamar-apoio' })
    expect(estado.valores?.contratoId).toBe('ctr-vertice-manutencao')
    expect(estado.sucesso).toBeDefined()
  })

  it('o ciclo anterior não pode ser o próprio escopo', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ ...EDICAO_DOCUMENTAL, cicloAnteriorId: 'esc-vertice-documental' })).valores?.cicloAnteriorId).toBe('')
  })

  it('o escopo Concluído não muda de status pela edição (RN-17)', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({
      id: 'esc-atlantica-2025',
      nome: 'Gestão do contrato portuário, ciclo 2025',
      responsavelId: 'usr-rafael',
      status: 'Em andamento',
      prioridade: 'Média',
    })
    expect(estado.erros).toEqual({ status: MENSAGENS_ESCOPO.fechado })
  })
})
