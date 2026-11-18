import { describe, expect, it } from 'vitest'
import type { OpcoesDeVinculo } from '@/lib/dados/opcoes-documento'
import { completarVinculos, destinoDaInclusao, lerArquivo, lerDadosDocumento, MENSAGENS_DOCUMENTO, validarDocumento, type DadosDocumento } from './validacao'

const OPCOES: OpcoesDeVinculo = {
  clientes: [
    { id: 'cli-a', rotulo: 'Alfa' },
    { id: 'cli-b', rotulo: 'Beta' },
  ],
  contratos: [
    { id: 'ctr-a1', rotulo: 'A1', clienteId: 'cli-a' },
    { id: 'ctr-a2', rotulo: 'A2', clienteId: 'cli-a' },
    { id: 'ctr-b1', rotulo: 'B1', clienteId: 'cli-b' },
  ],
  escopos: [
    { id: 'esc-a1', rotulo: 'Escopo A1', clienteId: 'cli-a', contratoId: 'ctr-a1' },
    { id: 'esc-b1', rotulo: 'Escopo B1', clienteId: 'cli-b', contratoId: 'ctr-b1' },
  ],
  planos: [{ id: 'pla-a1', rotulo: 'Plano A1', escopoId: 'esc-a1' }],
  atividades: [{ id: 'atv-a1', rotulo: 'Atividade A1', planoId: 'pla-a1' }],
  demandas: [
    { id: 'ELO-1', rotulo: 'ELO-1', clienteId: 'cli-a' },
    { id: 'ELO-2', rotulo: 'ELO-2', clienteId: 'cli-b' },
  ],
  avaliacoes: [{ id: 'ava-a', rotulo: 'Avaliação', clienteId: 'cli-a' }],
  especialistas: [{ id: 'esp-1', rotulo: 'Beatriz' }],
}

const CATEGORIAS = ['Contrato', 'Relatório', 'Documento do Especialista']

const VAZIO: DadosDocumento = {
  id: '',
  nome: '',
  categoria: '',
  clienteId: '',
  especialistaId: '',
  contratoId: '',
  escopoId: '',
  etapa: '',
  planoId: '',
  atividadeId: '',
  demandaNumero: '',
  avaliacaoId: '',
  data: '',
  observacoes: '',
  substitui: '',
  origem: '',
}

const BASE: DadosDocumento = { ...VAZIO, nome: 'Relatório', categoria: 'Relatório', clienteId: 'cli-a', data: '2026-11-10' }

const contexto = (admin = false) => ({ categorias: CATEGORIAS, opcoes: OPCOES, semClientePermitido: admin })
const validar = (dados: Partial<DadosDocumento>, admin = false) =>
  validarDocumento(completarVinculos({ ...BASE, ...dados }, OPCOES), contexto(admin))

describe('validação do documento (CA-12.1, RN-02, DF-65)', () => {
  it('lê os campos sem espaços nas pontas, e o arquivo como File', () => {
    const fd = new FormData()
    fd.set('nome', '  Ata  ')
    fd.set('categoria', 'Relatório')
    fd.set('arquivo', new File(['abc'], 'C:\\pasta\\Ata<1>.PDF', { type: 'application/pdf' }))
    expect(lerDadosDocumento(fd)).toMatchObject({ nome: 'Ata', categoria: 'Relatório', clienteId: '' })
    expect(lerArquivo(fd)).toEqual({ nome: 'Ata1.PDF', tipo: 'application/pdf', tamanho: 3 })
    expect(lerArquivo(new FormData())).toBeNull()
  })

  it('exige nome, categoria, cliente e data', () => {
    expect(validarDocumento(VAZIO, contexto())).toEqual({
      nome: MENSAGENS_DOCUMENTO.nome,
      categoria: MENSAGENS_DOCUMENTO.categoria,
      clienteId: MENSAGENS_DOCUMENTO.cliente,
      data: MENSAGENS_DOCUMENTO.data,
    })
    expect(validar({})).toEqual({})
    expect(validar({ data: '2026-02-30' })).toEqual({ data: MENSAGENS_DOCUMENTO.data })
    expect(validar({ categoria: 'Inventada' })).toEqual({ categoria: MENSAGENS_DOCUMENTO.categoria })
    expect(validar({ clienteId: 'cli-fora' })).toEqual({ clienteId: MENSAGENS_DOCUMENTO.cliente })
  })

  it('Documento do Especialista: exige o especialista; sem cliente, só o Administrador (DF-65)', () => {
    const doEspecialista = { categoria: 'Documento do Especialista', clienteId: '' }
    expect(validar({ ...doEspecialista, especialistaId: 'esp-1' }, true)).toEqual({})
    expect(validar({ ...doEspecialista, especialistaId: 'esp-1' })).toEqual({ clienteId: MENSAGENS_DOCUMENTO.semClienteSoAdmin })
    expect(validar({ ...doEspecialista }, true)).toEqual({ especialistaId: MENSAGENS_DOCUMENTO.especialista })
    expect(validar({ categoria: 'Documento do Especialista', especialistaId: 'esp-1' })).toEqual({})
  })

  it('fora do Documento do Especialista, o especialista é descartado', () => {
    expect(completarVinculos({ ...BASE, especialistaId: 'esp-1' }, OPCOES).especialistaId).toBe('')
  })

  it('completa os ancestrais a partir do vínculo mais específico, e o cliente', () => {
    expect(completarVinculos({ ...BASE, clienteId: '', atividadeId: 'atv-a1' }, OPCOES)).toMatchObject({
      clienteId: 'cli-a',
      contratoId: 'ctr-a1',
      escopoId: 'esc-a1',
      planoId: 'pla-a1',
      atividadeId: 'atv-a1',
    })
    expect(completarVinculos({ ...BASE, clienteId: '', demandaNumero: 'ELO-2' }, OPCOES).clienteId).toBe('cli-b')
  })

  it('recusa o vínculo de outro cliente ou que não bate, com mensagem no campo (RN-02)', () => {
    expect(validar({ contratoId: 'ctr-b1' })).toEqual({ contratoId: MENSAGENS_DOCUMENTO.contrato })
    expect(validar({ escopoId: 'esc-b1' })).toEqual({ escopoId: MENSAGENS_DOCUMENTO.escopo })
    expect(validar({ contratoId: 'ctr-a2', escopoId: 'esc-a1' })).toEqual({ escopoId: MENSAGENS_DOCUMENTO.escopo })
    expect(validar({ etapa: 'Monitorar' })).toEqual({ etapa: MENSAGENS_DOCUMENTO.etapa })
    expect(validar({ escopoId: 'esc-a1', etapa: 'Inventada' })).toEqual({ etapa: MENSAGENS_DOCUMENTO.etapa })
    expect(validar({ demandaNumero: 'ELO-2' })).toEqual({ demandaNumero: MENSAGENS_DOCUMENTO.demanda })
    expect(validar({ avaliacaoId: 'ava-fora' })).toEqual({ avaliacaoId: MENSAGENS_DOCUMENTO.avaliacao })
    expect(validar({ escopoId: 'esc-a1', planoId: 'pla-fora' })).toEqual({ planoId: MENSAGENS_DOCUMENTO.plano })
    expect(validar({ planoId: 'pla-a1', atividadeId: 'atv-fora' })).toEqual({ atividadeId: MENSAGENS_DOCUMENTO.atividade })
    expect(validar({ escopoId: 'esc-a1', etapa: 'Monitorar', planoId: 'pla-a1', atividadeId: 'atv-a1', demandaNumero: 'ELO-1' })).toEqual(
      {},
    )
  })

  it('o destino da volta vem da origem conhecida, nunca do endereço livre', () => {
    const dados = completarVinculos({ ...BASE, atividadeId: 'atv-a1' }, OPCOES)
    expect(destinoDaInclusao({ ...dados, origem: 'atividade' })).toBe('/atividades/atv-a1/editar')
    expect(destinoDaInclusao({ ...dados, origem: 'plano' })).toBe('/planos/pla-a1')
    expect(destinoDaInclusao({ ...dados, origem: 'cliente' })).toBe('/clientes/cli-a?aba=documentos')
    expect(destinoDaInclusao({ ...dados, origem: 'https://fora.com' })).toBe('/documentos')
    expect(destinoDaInclusao({ ...dados, origem: 'substitui', substitui: 'doc-1' })).toBe('/documentos/doc-1')
    expect(destinoDaInclusao({ ...BASE, origem: 'demanda', demandaNumero: 'ELO-1' })).toBe('/central/ELO-1')
  })
})
