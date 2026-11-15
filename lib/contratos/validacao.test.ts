import { describe, expect, it } from 'vitest'
import type { Contrato } from '@/lib/dados/tipos'
import { MENSAGENS_CONTRATO, validarContrato, type DadosContrato } from './validacao'

const DADOS: DadosContrato = {
  clienteId: 'cli-vertice',
  codigo: 'CT-2026-100',
  contratante: 'Petrobras',
  objeto: 'Manutenção de bombas',
  servicos: ['Manutenção Mecânica'],
  responsavelId: 'usr-helena',
  status: 'Proposta',
  justificativa: '',
  tipoVigencia: 'Prazo determinado',
  dataProposta: '',
  inicio: '',
  termino: '',
  valor: '',
  observacoes: '',
}

const ATUAL: Contrato = {
  id: 'ctr-x',
  clienteId: 'cli-vertice',
  codigo: 'CT-2025-031',
  contratante: 'Petrobras',
  objeto: 'Manutenção',
  servicos: ['Manutenção Industrial'],
  dataProposta: null,
  tipoVigencia: 'Prazo determinado',
  inicio: '2025-07-01',
  termino: '2027-06-30',
  valor: null,
  responsavelId: 'usr-helena',
  status: 'Ativo',
  observacoes: '',
}

type Contexto = { atual: Contrato | null; codigosDoCliente: string[]; responsaveisPermitidos: string[] }

const CONTEXTO: Contexto = { atual: null, codigosDoCliente: ['CT-2025-031'], responsaveisPermitidos: ['usr-helena', 'usr-rafael'] }

const validar = (parcial: Partial<DadosContrato>, contexto: Partial<Contexto> = {}) =>
  validarContrato({ ...DADOS, ...parcial }, { ...CONTEXTO, ...contexto })

describe('validarContrato (F03, CA-03.1 a CA-03.3, CA-03.6, RN-03, RN-19, RN-22)', () => {
  it('uma proposta completa passa', () => {
    expect(validar({})).toEqual({})
  })

  it('cada campo obrigatório tem a sua mensagem (CA-03.1)', () => {
    const erros = validar({
      clienteId: '',
      codigo: ' ',
      contratante: '',
      objeto: '',
      servicos: [],
      responsavelId: '',
      status: '',
      tipoVigencia: '',
    })
    expect(erros).toEqual({
      clienteId: MENSAGENS_CONTRATO.cliente,
      codigo: MENSAGENS_CONTRATO.codigo,
      contratante: MENSAGENS_CONTRATO.contratante,
      objeto: MENSAGENS_CONTRATO.objeto,
      servicos: MENSAGENS_CONTRATO.servicos,
      responsavelId: MENSAGENS_CONTRATO.responsavel,
      status: MENSAGENS_CONTRATO.status,
      tipoVigencia: MENSAGENS_CONTRATO.tipoVigencia,
    })
  })

  it('código repetido no mesmo cliente, sem diferenciar maiúsculas e espaços (CA-03.6, DF-47)', () => {
    expect(validar({ codigo: ' ct-2025-031 ' }).codigo).toBe('Este cliente já tem um contrato com este código.')
    expect(validar({ codigo: 'CT-2025-031' }, { codigosDoCliente: [] }).codigo).toBeUndefined()
  })

  it('responsável sem vínculo (RN-19)', () => {
    expect(validar({ responsavelId: 'usr-marcos' }).responsavelId).toBe('O responsável precisa ter vínculo com o cliente.')
  })

  it('Ativo de Prazo determinado sem término é recusado (CN-03.1); sem início também (CA-03.2)', () => {
    expect(validar({ status: 'Ativo', inicio: '2027-02-01' }).termino).toBe('Informe o término da vigência.')
    expect(validar({ status: 'Ativo', termino: '2027-12-31' }).inicio).toBe('Informe o início da vigência.')
  })

  it('Ativo de Prazo indeterminado, com início e sem término, passa (CN-03.2)', () => {
    expect(validar({ status: 'Ativo', tipoVigencia: 'Prazo indeterminado', inicio: '2027-02-01' })).toEqual({})
  })

  it('término antes do início é recusado (CN-03.3)', () => {
    expect(validar({ status: 'Ativo', inicio: '2027-03-01', termino: '2027-02-28' }).termino).toBe(
      'O término não pode ser antes do início.',
    )
  })

  it('data que não existe é recusada no próprio campo', () => {
    expect(validar({ dataProposta: '2026-02-31' }).dataProposta).toBe('Informe uma data válida.')
    expect(validar({ inicio: '31/02/2026' }).inicio).toBe('Informe uma data válida.')
  })

  it('valor que não é número em reais é recusado; vazio vale', () => {
    expect(validar({ valor: 'abc' }).valor).toBe('Informe um valor em reais.')
    expect(validar({ valor: '1.234,56' }).valor).toBeUndefined()
  })

  it('no cadastro, o status é Proposta, Em contratação ou Ativo (6.1)', () => {
    expect(validar({ status: 'Suspenso' }).status).toBe('Escolha o status.')
    expect(validar({ status: 'Encerrado' }).status).toBe('Escolha o status.')
  })

  it('na edição, as transições da 6.1 passam e a correção pede justificativa (RN-22)', () => {
    const ativo = { atual: ATUAL }
    expect(validar({ status: 'Suspenso', inicio: '2025-07-01', termino: '2027-06-30' }, ativo)).toEqual({})
    expect(validar({ status: 'Proposta' }, ativo).justificativa).toBe('Escreva a justificativa da mudança.')
    expect(validar({ status: 'Proposta', justificativa: 'Assinatura anulada' }, ativo)).toEqual({})
    const proposta = { atual: { ...ATUAL, status: 'Proposta' as const, inicio: null, termino: null } }
    expect(validar({ status: 'Ativo', inicio: '2026-01-01', termino: '2026-12-31' }, proposta)).toEqual({})
  })

  it('contrato fechado não muda de status pelo formulário', () => {
    const encerrado = { atual: { ...ATUAL, status: 'Encerrado' as const } }
    expect(validar({ status: 'Ativo', inicio: '2025-07-01', termino: '2027-06-30' }, encerrado).status).toBe(
      'Para reabrir, use Reabrir na página do contrato.',
    )
    expect(validar({ status: 'Encerrado' }, encerrado)).toEqual({})
  })
})
