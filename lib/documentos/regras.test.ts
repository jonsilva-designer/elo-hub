import { describe, expect, it } from 'vitest'
import type { Usuario, Vinculo } from '@/lib/dados/tipos'
import {
  ACEITAR_ARQUIVO,
  acoesDeStatus,
  erroDoArquivo,
  EXTENSOES_ACEITAS,
  MENSAGENS_ARQUIVO,
  nomeDeArquivoSeguro,
  podeAlterarDocumento,
  podeVerDocumento,
  semCliente,
  STATUS_DOCUMENTO,
  TAMANHO_MAXIMO,
} from './regras'

const ADMIN: Usuario = { id: 'usr-helena', nome: 'Helena', email: 'h@x', perfil: 'Administrador', status: 'Ativo' }
const RAFAEL: Usuario = { id: 'usr-rafael', nome: 'Rafael', email: 'r@x', perfil: 'Equipe', status: 'Ativo' }
const VINCULOS: Vinculo[] = [{ usuarioId: 'usr-rafael', clienteId: 'cli-vertice' }]

describe('status e arquivos do documento (F12, PRD 6.1, DF-72)', () => {
  it('os status na ordem do PRD', () => {
    expect(STATUS_DOCUMENTO).toEqual(['Vigente', 'Superado', 'Encerrado'])
  })

  it('os formatos da DF-72, e o accept do campo com todos', () => {
    expect(EXTENSOES_ACEITAS).toEqual(['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.msg', '.eml'])
    expect(ACEITAR_ARQUIVO).toBe(EXTENSOES_ACEITAS.join(','))
    expect(TAMANHO_MAXIMO).toBe(10 * 1024 * 1024)
  })

  it('aceita até 10 MB, sem diferença de maiúsculas (CA-12.2)', () => {
    expect(erroDoArquivo({ nome: 'contrato.pdf', tamanho: TAMANHO_MAXIMO })).toBeNull()
    expect(erroDoArquivo({ nome: 'CONTRATO.PDF', tamanho: 1000 })).toBeNull()
    expect(erroDoArquivo({ nome: 'email.eml', tamanho: 1 })).toBeNull()
  })

  it('recusa com mensagem clara: sem arquivo, vazio, fora do formato, acima de 10 MB', () => {
    expect(erroDoArquivo(null)).toBe(MENSAGENS_ARQUIVO.falta)
    expect(erroDoArquivo({ nome: 'contrato.pdf', tamanho: 0 })).toBe(MENSAGENS_ARQUIVO.vazio)
    expect(erroDoArquivo({ nome: 'relatorio.pdf.exe', tamanho: 10 })).toBe(MENSAGENS_ARQUIVO.formato)
    expect(erroDoArquivo({ nome: 'sem-extensao', tamanho: 10 })).toBe(MENSAGENS_ARQUIVO.formato)
    expect(erroDoArquivo({ nome: 'planilha.csv', tamanho: 10 })).toBe(MENSAGENS_ARQUIVO.formato)
    expect(erroDoArquivo({ nome: 'contrato.pdf', tamanho: TAMANHO_MAXIMO + 1 })).toBe(MENSAGENS_ARQUIVO.tamanho)
    expect(MENSAGENS_ARQUIVO.formato).toContain('.msg')
  })

  it('o nome mostrado é higienizado: sem pasta, sem caracteres proibidos (arquitetura 6)', () => {
    expect(nomeDeArquivoSeguro('..\\pasta/a<b>.pdf')).toBe('ab.pdf')
    expect(nomeDeArquivoSeguro('C:\\Users\\x\\Relatório final.docx')).toBe('Relatório final.docx')
    expect(nomeDeArquivoSeguro('ata\u0000"?.pdf')).toBe('ata.pdf')
    expect(nomeDeArquivoSeguro('  ')).toBe('arquivo')
    expect(nomeDeArquivoSeguro('...')).toBe('arquivo')
  })
})

describe('acesso ao documento (RN-01, RN-16, DF-65)', () => {
  it('com cliente, segue o vínculo; sem cliente, todos os logados veem', () => {
    expect(semCliente({ clienteId: null })).toBe(true)
    expect(podeVerDocumento({ clienteId: 'cli-vertice' }, RAFAEL, VINCULOS)).toBe(true)
    expect(podeVerDocumento({ clienteId: 'cli-montareal' }, RAFAEL, VINCULOS)).toBe(false)
    expect(podeVerDocumento({ clienteId: 'cli-montareal' }, ADMIN, VINCULOS)).toBe(true)
    expect(podeVerDocumento({ clienteId: null }, RAFAEL, VINCULOS)).toBe(true)
  })

  it('alterar: o Administrador sempre; a Equipe só com cliente vinculado', () => {
    expect(podeAlterarDocumento({ clienteId: 'cli-vertice' }, RAFAEL, VINCULOS)).toBe(true)
    expect(podeAlterarDocumento({ clienteId: 'cli-montareal' }, RAFAEL, VINCULOS)).toBe(false)
    expect(podeAlterarDocumento({ clienteId: null }, RAFAEL, VINCULOS)).toBe(false)
    expect(podeAlterarDocumento({ clienteId: null }, ADMIN, VINCULOS)).toBe(true)
  })

  it('as mudanças de status da 6.1: do Vigente, encerrar ou superar; dos outros, voltar a Vigente', () => {
    expect(acoesDeStatus('Vigente')).toEqual(['encerrar', 'marcar-superado'])
    expect(acoesDeStatus('Superado')).toEqual(['voltar-a-vigente'])
    expect(acoesDeStatus('Encerrado')).toEqual(['voltar-a-vigente'])
  })
})
