import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import {
  excluirDocumento,
  inativarDocumento,
  incluirDocumento,
  mudarStatusDocumento,
  reativarDocumento,
  salvarDocumento,
} from './acoes'
import { ESTADO_INICIAL_DOCUMENTO } from './estados'
import { MENSAGENS_ARQUIVO, TAMANHO_MAXIMO } from './regras'
import { MENSAGENS_DOCUMENTO } from './validacao'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_PERMISSAO = 'Você não tem permissão para esta ação.'
const NAO_GRAVA = 'No protótipo, os dados não são gravados.'

const pdf = (tamanho = 2048, nome = 'Relatório.pdf') => new File([new Uint8Array(tamanho)], nome, { type: 'application/pdf' })

const NOVO: Record<string, string> = {
  nome: 'Relatório de setembro',
  categoria: 'Relatório',
  clienteId: 'cli-vertice',
  data: '2026-10-05',
}

function formulario(campos: Record<string, string>, arquivo: File | null = pdf()): FormData {
  const fd = new FormData()
  for (const [chave, valor] of Object.entries(campos)) fd.set(chave, valor)
  if (arquivo) fd.set('arquivo', arquivo)
  return fd
}

const incluir = (campos: Record<string, string>, arquivo?: File | null) =>
  incluirDocumento(ESTADO_INICIAL_DOCUMENTO, formulario({ ...NOVO, ...campos }, arquivo === undefined ? pdf() : arquivo))

describe('incluirDocumento (parte 6, 4.2; F12, UC-15)', () => {
  it('inclui e volta para o registro de onde veio (CA-12.1)', async () => {
    entrarComo('usr-rafael')
    const estado = await incluir({ atividadeId: 'atv-licencas-protocolo', origem: 'atividade' })
    expect(estado.erros).toEqual({})
    expect(estado.sucesso).toEqual({
      mensagem: `Documento incluído. ${NAO_GRAVA}`,
      destino: '/atividades/atv-licencas-protocolo/editar',
    })
    expect(estado.valores).toMatchObject({ planoId: 'pla-vertice-licencas', escopoId: 'esc-vertice-documental', contratoId: 'ctr-vertice-manutencao' })
  })

  it('sem origem, volta para a lista', async () => {
    entrarComo('usr-helena')
    expect((await incluir({})).sucesso?.destino).toBe('/documentos')
  })

  it('recusa sem os obrigatórios e sem arquivo (CA-12.1)', async () => {
    entrarComo('usr-helena')
    const estado = await incluirDocumento(ESTADO_INICIAL_DOCUMENTO, formulario({}, null))
    expect(estado.sucesso).toBeUndefined()
    expect(estado.erros).toEqual({
      nome: MENSAGENS_DOCUMENTO.nome,
      categoria: MENSAGENS_DOCUMENTO.categoria,
      clienteId: MENSAGENS_DOCUMENTO.cliente,
      data: MENSAGENS_DOCUMENTO.data,
      arquivo: MENSAGENS_ARQUIVO.falta,
    })
  })

  it('o arquivo no limite: 10 MB passa; 1 byte a mais, o formato errado e o vazio não (CA-12.2, DF-72)', async () => {
    entrarComo('usr-rafael')
    expect((await incluir({}, pdf(TAMANHO_MAXIMO, 'GRANDE.PDF'))).erros).toEqual({})
    expect((await incluir({}, pdf(TAMANHO_MAXIMO + 1))).erros).toEqual({ arquivo: MENSAGENS_ARQUIVO.tamanho })
    expect((await incluir({}, pdf(10, 'relatorio.pdf.exe'))).erros).toEqual({ arquivo: MENSAGENS_ARQUIVO.formato })
    expect((await incluir({}, pdf(0))).erros).toEqual({ arquivo: MENSAGENS_ARQUIVO.vazio })
  })

  it('a Equipe não inclui para cliente fora dos vínculos, nem por vínculo enviado à mão (CA-12.5, RN-02)', async () => {
    entrarComo('usr-rafael')
    expect((await incluir({ clienteId: 'cli-montareal' })).erros).toEqual({ clienteId: MENSAGENS_DOCUMENTO.cliente })
    expect((await incluir({ contratoId: 'ctr-montareal-montagem' })).erros).toEqual({ contratoId: MENSAGENS_DOCUMENTO.contrato })
    expect((await incluir({ escopoId: 'esc-atlantica-2026' })).erros).toEqual({ escopoId: MENSAGENS_DOCUMENTO.escopo })
    expect((await incluir({ demandaNumero: 'ELO-2026-0001' })).erros).toEqual({ demandaNumero: MENSAGENS_DOCUMENTO.demanda })
    expect((await incluir({ avaliacaoId: 'ava-atlantica-1' })).erros).toEqual({ avaliacaoId: MENSAGENS_DOCUMENTO.avaliacao })
  })

  it('Documento do Especialista: sem cliente só o Administrador; com cliente, a Equipe vinculada (DF-65)', async () => {
    const curriculo = { categoria: 'Documento do Especialista', clienteId: '', especialistaId: 'esp-esg', origem: 'especialista' }
    entrarComo('usr-rafael')
    expect((await incluir(curriculo)).erros).toEqual({ clienteId: MENSAGENS_DOCUMENTO.semClienteSoAdmin })
    expect((await incluir({ ...curriculo, clienteId: 'cli-vertice' })).sucesso?.destino).toBe('/especialistas/esp-esg')
    entrarComo('usr-helena')
    expect((await incluir(curriculo)).erros).toEqual({})
    expect((await incluir({ ...curriculo, especialistaId: '' })).erros).toEqual({ especialistaId: MENSAGENS_DOCUMENTO.especialista })
  })

  it('a contrato ou escopo fechado aceita documento (RN-23)', async () => {
    entrarComo('usr-rafael')
    expect((await incluir({ clienteId: 'cli-atlantica', escopoId: 'esc-atlantica-2025' })).erros).toEqual({})
  })
})

describe('incluirDocumento como nova versão (DF-44, CA-12.4)', () => {
  const novaVersao = { nome: 'Relatório do levantamento, revisado', substitui: 'doc-vertice-levantamento', origem: 'substitui' }

  it('a Equipe inclui o substituto, e o anterior passa a Superado', async () => {
    entrarComo('usr-rafael')
    const estado = await incluir(novaVersao)
    expect(estado.erros).toEqual({})
    expect(estado.sucesso).toEqual({
      mensagem: `Documento incluído. O anterior passou a Superado. ${NAO_GRAVA}`,
      destino: '/documentos/doc-vertice-levantamento',
    })
  })

  it('o substituto precisa ser do mesmo cliente do anterior', async () => {
    entrarComo('usr-helena')
    expect((await incluir({ ...novaVersao, clienteId: 'cli-atlantica' })).erros).toEqual({ clienteId: MENSAGENS_DOCUMENTO.mesmoDono })
  })

  it('só o Vigente recebe nova versão', async () => {
    entrarComo('usr-helena')
    expect((await incluir({ ...novaVersao, substitui: 'doc-vertice-aditivo-minuta' })).erroGeral).toBe(MENSAGENS_DOCUMENTO.soVigente)
    expect(
      (await incluir({ ...novaVersao, clienteId: 'cli-atlantica', substitui: 'doc-atlantica-termo-2025' })).erroGeral,
    ).toBe(MENSAGENS_DOCUMENTO.soVigente)
  })

  it('a Equipe não substitui o currículo sem cliente nem o documento fora dos vínculos (DF-65, CA-12.5)', async () => {
    entrarComo('usr-rafael')
    expect((await incluir({ ...novaVersao, substitui: 'doc-especialista-curriculo' })).erroGeral).toBe(SEM_PERMISSAO)
    expect((await incluir({ ...novaVersao, substitui: 'doc-montareal-cronograma' })).erroGeral).toBe(SEM_PERMISSAO)
    expect((await incluir({ ...novaVersao, substitui: 'doc-nao-existe' })).erroGeral).toBe(SEM_PERMISSAO)
  })

  it('o Administrador substitui o currículo sem cliente por outro do mesmo especialista', async () => {
    entrarComo('usr-helena')
    const curriculo = {
      ...novaVersao,
      categoria: 'Documento do Especialista',
      clienteId: '',
      especialistaId: 'esp-juridico',
      substitui: 'doc-especialista-curriculo',
    }
    expect((await incluir(curriculo)).erros).toEqual({})
    expect((await incluir({ ...curriculo, especialistaId: 'esp-esg' })).erros).toEqual({ clienteId: MENSAGENS_DOCUMENTO.mesmoDono })
  })
})

describe('salvarDocumento (parte 6, 4.2; matriz 4.3)', () => {
  const editar = (id: string, campos: Record<string, string>) =>
    salvarDocumento(ESTADO_INICIAL_DOCUMENTO, formulario({ id, ...campos }, null))

  const LEVANTAMENTO = {
    nome: 'Relatório do levantamento, revisado',
    categoria: 'Relatório',
    clienteId: 'cli-vertice',
    escopoId: 'esc-vertice-documental',
    etapa: 'Diagnosticar',
  }

  it('a Equipe vinculada altera nome, categoria, vínculos e observações, e volta para a página', async () => {
    entrarComo('usr-rafael')
    const estado = await editar('doc-vertice-levantamento', { ...LEVANTAMENTO, observacoes: 'Revisado.' })
    expect(estado.erros).toEqual({})
    expect(estado.sucesso).toEqual({ mensagem: `Documento salvo. ${NAO_GRAVA}`, destino: '/documentos/doc-vertice-levantamento' })
  })

  it('a data e o arquivo não mudam na edição: a data enviada é ignorada', async () => {
    entrarComo('usr-rafael')
    const estado = await editar('doc-vertice-levantamento', { ...LEVANTAMENTO, data: '' })
    expect(estado.erros).toEqual({})
    expect(estado.valores?.data).toBe('2026-04-30')
  })

  it('recusa o vínculo de outro cliente, enviado à mão (RN-02)', async () => {
    entrarComo('usr-helena')
    expect((await editar('doc-vertice-levantamento', { ...LEVANTAMENTO, planoId: 'pla-atlantica-indicadores' })).erros).toEqual({
      planoId: MENSAGENS_DOCUMENTO.plano,
    })
    expect((await editar('doc-vertice-levantamento', { ...LEVANTAMENTO, escopoId: 'esc-atlantica-2026', etapa: '' })).erros).toEqual({
      escopoId: MENSAGENS_DOCUMENTO.escopo,
    })
    expect((await editar('doc-vertice-levantamento', { ...LEVANTAMENTO, demandaNumero: 'ELO-2026-0011' })).erros).toEqual({
      demandaNumero: MENSAGENS_DOCUMENTO.demanda,
    })
  })

  it('a Equipe não edita o currículo sem cliente nem o documento fora dos vínculos (DF-65, CA-12.5)', async () => {
    entrarComo('usr-rafael')
    expect((await editar('doc-especialista-curriculo', { nome: 'Currículo', categoria: 'Documento do Especialista' })).erroGeral).toBe(
      SEM_PERMISSAO,
    )
    expect((await editar('doc-montareal-cronograma', { nome: 'Cronograma', categoria: 'Outros', clienteId: 'cli-montareal' })).erroGeral).toBe(
      SEM_PERMISSAO,
    )
    expect((await editar('doc-nao-existe', LEVANTAMENTO)).erroGeral).toBe(SEM_PERMISSAO)
  })

  it('a Equipe não tira o cliente do Documento do Especialista; o Administrador tira (DF-65)', async () => {
    const parecer = { nome: 'Parecer', categoria: 'Documento do Especialista', especialistaId: 'esp-juridico', clienteId: '' }
    entrarComo('usr-rafael')
    expect((await editar('doc-vertice-parecer', parecer)).erros).toEqual({ clienteId: MENSAGENS_DOCUMENTO.semClienteSoAdmin })
    entrarComo('usr-helena')
    expect((await editar('doc-vertice-parecer', parecer)).erros).toEqual({})
  })

  it('o cliente não muda no documento com versões ligadas (CA-12.4)', async () => {
    entrarComo('usr-helena')
    const aditivo = { nome: 'Aditivo', categoria: 'Aditivo Contratual' }
    expect((await editar('doc-vertice-aditivo-minuta', { ...aditivo, clienteId: 'cli-atlantica' })).erros).toEqual({
      clienteId: MENSAGENS_DOCUMENTO.clienteComVersoes,
    })
    expect((await editar('doc-vertice-aditivo-assinado', { ...aditivo, clienteId: 'cli-vertice' })).erros).toEqual({})
  })

  it('o documento principal do contrato continua um contrato ou proposta dele (F03)', async () => {
    entrarComo('usr-helena')
    const principal = { nome: 'Contrato assinado', clienteId: 'cli-vertice', contratoId: 'ctr-vertice-manutencao' }
    expect((await editar('doc-vertice-contrato', { ...principal, categoria: 'Proposta Comercial' })).erros).toEqual({})
    expect((await editar('doc-vertice-contrato', { ...principal, categoria: 'Relatório' })).erros).toEqual({
      categoria: MENSAGENS_DOCUMENTO.principal,
    })
    expect((await editar('doc-vertice-contrato', { ...principal, categoria: 'Contrato', contratoId: 'ctr-vertice-mobilizacao' })).erros).toEqual({
      contratoId: MENSAGENS_DOCUMENTO.principal,
    })
  })
})

describe('status, inativação e exclusão (CA-12.6, PRD 6.1, RN-24, DF-33)', () => {
  const ok = (frase: string) => ({ ok: true, mensagem: `${frase} ${NAO_GRAVA}` })
  const nao = (mensagem: string) => ({ ok: false, mensagem })

  it('só o Administrador muda status, inativa e exclui; a Equipe e o id inexistente recebem a mesma recusa', async () => {
    entrarComo('usr-rafael')
    expect(await mudarStatusDocumento('doc-vertice-levantamento', 'encerrar', '')).toEqual(nao(SEM_PERMISSAO))
    expect(await inativarDocumento('doc-vertice-levantamento')).toEqual(nao(SEM_PERMISSAO))
    expect(await reativarDocumento('doc-atlantica-ata-duplicada')).toEqual(nao(SEM_PERMISSAO))
    expect(await excluirDocumento('doc-vertice-levantamento', 'Arquivo errado.')).toEqual(nao(SEM_PERMISSAO))
    entrarComo('usr-helena')
    expect(await mudarStatusDocumento('doc-nao-existe', 'encerrar', '')).toEqual(nao(SEM_PERMISSAO))
  })

  it('encerra o Vigente e volta o Encerrado ou o Superado a Vigente', async () => {
    entrarComo('usr-helena')
    expect(await mudarStatusDocumento('doc-vertice-levantamento', 'encerrar', '')).toEqual(ok('Documento encerrado.'))
    expect(await mudarStatusDocumento('doc-atlantica-termo-2025', 'voltar-a-vigente', '')).toEqual(ok('Documento de volta a Vigente.'))
    expect(await mudarStatusDocumento('doc-vertice-aditivo-minuta', 'voltar-a-vigente', '')).toEqual(ok('Documento de volta a Vigente.'))
    expect(await mudarStatusDocumento('doc-atlantica-termo-2025', 'encerrar', '')).toEqual(
      nao('Esta mudança não vale para o documento neste status.'),
    )
    expect(await mudarStatusDocumento('doc-vertice-levantamento', 'inventada', '')).toEqual(
      nao('Esta mudança não vale para o documento neste status.'),
    )
  })

  it('Superado só com o substituto: Vigente, do mesmo cliente, e não ele mesmo (CA-12.4, DF-63)', async () => {
    entrarComo('usr-helena')
    const superar = (substituto: string) => mudarStatusDocumento('doc-vertice-levantamento', 'marcar-superado', substituto)
    expect(await superar('')).toEqual(nao('Escolha o documento que substitui este.'))
    expect(await superar('doc-vertice-levantamento')).toEqual(nao('Escolha o documento que substitui este.'))
    expect(await superar('doc-vertice-aditivo-minuta')).toEqual(nao('Escolha o documento que substitui este.'))
    expect(await superar('doc-montareal-cronograma')).toEqual(nao('Escolha o documento que substitui este.'))
    expect(await superar('doc-vertice-controle-validade')).toEqual(ok('Documento marcado como Superado.'))
  })

  it('inativa e reativa, sem mudar o status (RN-24)', async () => {
    entrarComo('usr-helena')
    expect(await inativarDocumento('doc-vertice-levantamento')).toEqual(ok('Documento inativado.'))
    expect(await inativarDocumento('doc-atlantica-ata-duplicada')).toEqual(nao('O documento já está inativo.'))
    expect(await reativarDocumento('doc-atlantica-ata-duplicada')).toEqual(ok('Documento reativado.'))
    expect(await reativarDocumento('doc-vertice-levantamento')).toEqual(nao('O documento não está inativo.'))
  })

  it('exclui só sem ligação, com justificativa (DF-33, CA-18.4, EC-80)', async () => {
    entrarComo('usr-helena')
    expect(await excluirDocumento('doc-vertice-levantamento', ' ')).toEqual(nao('Escreva a justificativa da exclusão.'))
    expect(await excluirDocumento('doc-vertice-levantamento', 'Arquivo errado.')).toEqual(ok('Documento excluído.'))
    const ligado = nao('Este documento tem registros ligados e não pode ser excluído.')
    expect(await excluirDocumento('doc-vertice-aditivo-minuta', 'Motivo')).toEqual(ligado)
    expect(await excluirDocumento('doc-vertice-aditivo-assinado', 'Motivo')).toEqual(ligado)
    expect(await excluirDocumento('doc-vertice-contrato', 'Motivo')).toEqual(ligado)
  })
})
