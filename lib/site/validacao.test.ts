import { describe, expect, it } from 'vitest'
import { dentroDoLimite, ehRobo, LIMITE_DE_ENVIOS, reiniciarLimite } from './protecao'
import { TEXTOS_SITE } from './textos'
import { lerDiagnostico, lerCandidatura, MENSAGENS_SITE, validarCandidatura, validarDiagnostico } from './validacao'

function formulario(campos: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [chave, valor] of Object.entries(campos)) fd.set(chave, valor)
  return fd
}

const DIAGNOSTICO = {
  nome: 'Paula Reis',
  empresa: 'Navalis Serviços Ltda',
  cnpj: '11.222.333/0001-81',
  email: 'paula@navalis.com.br',
  telefone: '(22) 99999-0000',
  consentimento: 'sim',
}

const CANDIDATURA = {
  nome: 'Otávio Lins',
  especialidade: 'Gestão de contratos',
  email: 'otavio@exemplo.com.br',
  telefone: '(21) 98888-1111',
  aviso: 'sim',
  consentimento: 'sim',
}

const ESPECIALIDADES = ['Gestão de contratos', 'Financeiro']
const SEGMENTOS = ['Óleo e gás']

describe('textos do Apêndice E (versão 1)', () => {
  it('a versão e os textos das confirmações', () => {
    expect(TEXTOS_SITE.versao).toBe(1)
    expect(TEXTOS_SITE.especialista.confirmacao).toMatch(/^Recebemos a sua candidatura\./)
    expect(TEXTOS_SITE.diagnostico.confirmacao).toMatch(/^Recebemos o seu pedido de diagnóstico\./)
    expect(TEXTOS_SITE.especialista.aviso).toMatch(/não garante contratação nem demanda/)
  })
})

describe('validação do diagnóstico (DF-76, DF-56, CA-19.2)', () => {
  it('aceita os obrigatórios com o consentimento; os opcionais da lista são conferidos', () => {
    expect(validarDiagnostico(lerDiagnostico(formulario(DIAGNOSTICO)), SEGMENTOS)).toEqual({})
    expect(validarDiagnostico(lerDiagnostico(formulario({ ...DIAGNOSTICO, cnpj: '11222333000181', uf: 'RJ', segmento: 'Óleo e gás' })), SEGMENTOS)).toEqual({})
  })

  it('recusa sem os obrigatórios, com CNPJ inválido, UF e segmento fora da lista e sem consentimento', () => {
    expect(validarDiagnostico(lerDiagnostico(formulario({})), SEGMENTOS)).toEqual({
      nome: MENSAGENS_SITE.nome,
      empresa: MENSAGENS_SITE.empresa,
      cnpj: MENSAGENS_SITE.cnpj,
      email: MENSAGENS_SITE.email,
      telefone: MENSAGENS_SITE.telefoneDiagnostico,
      consentimento: MENSAGENS_SITE.consentimento,
    })
    expect(
      validarDiagnostico(lerDiagnostico(formulario({ ...DIAGNOSTICO, cnpj: '11.222.333/0001-82', uf: 'XX', segmento: 'Outro' })), SEGMENTOS),
    ).toEqual({ cnpj: MENSAGENS_SITE.cnpj, uf: MENSAGENS_SITE.uf, segmento: MENSAGENS_SITE.segmento })
  })
})

describe('validação da candidatura (F11, DF-27, CA-19.2)', () => {
  it('aceita os obrigatórios com o aviso e o consentimento', () => {
    expect(validarCandidatura(lerCandidatura(formulario(CANDIDATURA)), ESPECIALIDADES)).toEqual({})
  })

  it('recusa sem os obrigatórios, sem o aviso e o consentimento, com data e link inválidos', () => {
    expect(validarCandidatura(lerCandidatura(formulario({})), ESPECIALIDADES)).toEqual({
      nome: MENSAGENS_SITE.nome,
      especialidade: MENSAGENS_SITE.especialidade,
      email: MENSAGENS_SITE.email,
      telefone: MENSAGENS_SITE.telefone,
      aviso: MENSAGENS_SITE.aviso,
      consentimento: MENSAGENS_SITE.consentimento,
    })
    expect(
      validarCandidatura(lerCandidatura(formulario({ ...CANDIDATURA, dataNascimento: '1990-02-30', curriculo: 'linkedin.com/in/otavio' })), ESPECIALIDADES),
    ).toEqual({ dataNascimento: MENSAGENS_SITE.data, curriculo: MENSAGENS_SITE.curriculo })
  })
})

describe('proteção contra envio automatizado (CA-19.4, DA-03)', () => {
  it('o campo armadilha preenchido é de robô', () => {
    expect(ehRobo(formulario({ site: '' }))).toBe(false)
    expect(ehRobo(formulario({}))).toBe(false)
    expect(ehRobo(formulario({ site: 'http://spam.example' }))).toBe(true)
  })

  it('até 5 envios por IP em 10 minutos; depois da janela, de novo', () => {
    reiniciarLimite()
    const agora = Date.parse('2026-11-18T10:00:00Z')
    for (let i = 0; i < LIMITE_DE_ENVIOS; i++) expect(dentroDoLimite('1.2.3.4', agora + i)).toBe(true)
    expect(dentroDoLimite('1.2.3.4', agora + 10)).toBe(false)
    expect(dentroDoLimite('5.6.7.8', agora + 10)).toBe(true)
    expect(dentroDoLimite('1.2.3.4', agora + 10 * 60 * 1000 + 1)).toBe(true)
  })
})
