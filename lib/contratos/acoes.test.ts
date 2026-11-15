import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarContratos } from '@/lib/dados/contratos'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { salvarContrato } from './acoes'
import { ESTADO_INICIAL_SALVAR_CONTRATO } from './estados'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_PERMISSAO = 'Você não tem permissão para esta ação.'

/** Um contrato novo da Vértice, válido, como o formulário manda. */
const NOVO: Record<string, string | string[]> = {
  clienteId: 'cli-vertice',
  codigo: 'CT-2026-100',
  contratante: 'Petrobras',
  objeto: 'Manutenção de bombas',
  servicos: ['Manutenção Mecânica'],
  responsavelId: 'usr-helena',
  status: 'Proposta',
  tipoVigencia: 'Prazo determinado',
}

function formulario(campos: Record<string, string | string[]>): FormData {
  const fd = new FormData()
  for (const [chave, valor] of Object.entries(campos)) {
    for (const v of Array.isArray(valor) ? valor : [valor]) fd.append(chave, v)
  }
  return fd
}

const salvar = (campos: Record<string, string | string[]>) =>
  salvarContrato(ESTADO_INICIAL_SALVAR_CONTRATO, formulario({ ...NOVO, ...campos }))

/** A edição de um contrato existente: o id e os campos que mudam por cima dos dados dele. */
const EDICAO_VERTICE = {
  id: 'ctr-vertice-manutencao',
  codigo: 'CT-2025-031',
  servicos: ['Manutenção Industrial', 'Manutenção Mecânica'],
  status: 'Ativo',
  inicio: '2025-07-01',
  termino: '2027-06-30',
}

describe('salvarContrato (F03, matriz 4.3, critérios 5 e 9)', () => {
  it('o Rafael é recusado no cadastro e na edição, sem saber se o contrato existe', async () => {
    entrarComo('usr-rafael')
    expect((await salvar({})).erroGeral).toBe(SEM_PERMISSAO)
    expect((await salvar(EDICAO_VERTICE)).erroGeral).toBe(SEM_PERMISSAO)
  })

  it('id que não existe recebe a mesma recusa', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ id: 'ctr-nao-existe' })).erroGeral).toBe(SEM_PERMISSAO)
  })

  it('um contrato novo válido responde como salvo e volta à aba Contratos do cliente', async () => {
    entrarComo('usr-helena')
    const r = await salvar({})
    expect(r.erros).toEqual({})
    expect(r.sucesso).toEqual({
      mensagem: 'Contrato salvo. No protótipo, os dados não são gravados.',
      destino: '/clientes/cli-vertice?aba=contratos',
    })
    expect(await listarContratos()).toHaveLength(11)
  })

  it('código repetido no mesmo cliente é recusado; em outro cliente passa; na edição, o próprio vale (ponto de atenção 3)', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ codigo: ' ct-2025-031 ' })).erros.codigo).toBe('Este cliente já tem um contrato com este código.')
    expect((await salvar({ clienteId: 'cli-atlantica', responsavelId: 'usr-rafael', codigo: 'CT-2025-031' })).erros).toEqual({})
    const r = await salvar(EDICAO_VERTICE)
    expect(r.erros).toEqual({})
    expect(r.sucesso?.destino).toBe('/contratos/ctr-vertice-manutencao')
  })

  it('valores fora das listas, enviados à mão, contam como vazios (ponto de atenção 2)', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ contratante: 'Shell' })).erros.contratante).toBe('Escolha o contratante.')
    const soInventado = await salvar({ servicos: ['Serviço inventado'] })
    expect(soInventado.erros.servicos).toBe('Escolha pelo menos um serviço.')
    const misturado = await salvar({ servicos: ['Serviço inventado', 'Engenharia'] })
    expect(misturado.valores?.servicos).toEqual(['Engenharia'])
    expect((await salvar({ tipoVigencia: 'Vitalício' })).erros.tipoVigencia).toBe('Escolha o tipo de vigência.')
  })

  it('responsável sem vínculo e cliente que não pode ter contrato são recusados', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ clienteId: 'cli-montareal', responsavelId: 'usr-rafael' })).erros.responsavelId).toBe(
      'O responsável precisa ter vínculo com o cliente.',
    )
    for (const clienteId of ['cli-fortec', 'cli-elo', 'cli-nao-existe']) {
      expect((await salvar({ clienteId })).erros.clienteId, clienteId).toBe('Escolha o cliente.')
    }
  })

  it('na edição, o cliente é o do contrato, e o do formulário é ignorado', async () => {
    entrarComo('usr-helena')
    const r = await salvar({ ...EDICAO_VERTICE, clienteId: 'cli-montareal' })
    expect(r.erros).toEqual({})
    expect(r.valores?.clienteId).toBe('cli-vertice')
  })

  it('Prazo indeterminado descarta o término; trocar para Prazo determinado no Ativo exige o término (ponto de atenção 4)', async () => {
    entrarComo('usr-helena')
    const r = await salvar({ status: 'Ativo', tipoVigencia: 'Prazo indeterminado', inicio: '2027-01-01', termino: '2027-01-01' })
    expect(r.erros).toEqual({})
    expect(r.valores?.termino).toBe('')
    const atlantica = await salvar({
      id: 'ctr-atlantica-porto',
      codigo: 'CT-2024-008',
      contratante: 'Porto do Açu',
      servicos: ['Serviços Portuários e Marítimos'],
      responsavelId: 'usr-rafael',
      status: 'Ativo',
      tipoVigencia: 'Prazo determinado',
      inicio: '2024-03-01',
    })
    expect(atlantica.erros.termino).toBe('Informe o término da vigência.')
  })

  it('status final no cadastro é recusado; no contrato Encerrado, o status não muda pelo formulário', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ status: 'Encerrado' })).erros.status).toBe('Escolha o status.')
    const r = await salvar({
      id: 'ctr-ondamar-apoio',
      clienteId: 'cli-ondamar',
      codigo: 'CT-2023-021',
      servicos: ['Serviços Offshore'],
      status: 'Ativo',
      inicio: '2023-06-01',
      termino: '2025-05-31',
    })
    expect(r.erros.status).toBe('Para reabrir, use Reabrir na página do contrato.')
  })

  it('o valor em reais é conferido', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ valor: 'abc' })).erros.valor).toBe('Informe um valor em reais.')
    expect((await salvar({ valor: '1.234,56' })).erros).toEqual({})
  })
})
