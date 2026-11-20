import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cnpjJaCadastrado, emailDeEspecialistaJaCadastrado } from '@/lib/dados/site'
import { enviarCandidatura, enviarDiagnostico } from './acoes'
import { ESTADO_INICIAL_SITE } from './estados'
import { CAMPO_ARMADILHA, MENSAGEM_LIMITE, reiniciarLimite } from './protecao'
import { TEXTOS_SITE } from './textos'
import { MENSAGENS_SITE } from './validacao'

const { ip } = vi.hoisted(() => ({ ip: { valor: '9.9.9.9' } }))
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': `${ip.valor}, 10.0.0.1` }),
  cookies: async () => ({ get: () => undefined, has: () => false }),
}))

beforeEach(() => {
  reiniciarLimite()
  ip.valor = '9.9.9.9'
})

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

const semData = (estado: Awaited<ReturnType<typeof enviarDiagnostico>>) => ({
  ...estado,
  consentimento: estado.consentimento ? { ...estado.consentimento, aceitoEm: '' } : undefined,
})

describe('as consultas do site respondem só sim ou não, sem sessão', () => {
  it('CNPJ e e-mail já cadastrados', async () => {
    expect(await cnpjJaCadastrado('21473509000121')).toBe(true)
    expect(await cnpjJaCadastrado('11.222.333/0001-81')).toBe(false)
    expect(await emailDeEspecialistaJaCadastrado(' BEATRIZ.FONTES@exemplo.com.br ')).toBe(true)
    expect(await emailDeEspecialistaJaCadastrado('otavio@exemplo.com.br')).toBe(false)
  })
})

describe('enviarDiagnostico (F19, DF-56, DF-76; CA-19.3)', () => {
  it('confirma com o texto do Apêndice E e devolve o consentimento com a versão e a hora (RNF-05)', async () => {
    const estado = await enviarDiagnostico(ESTADO_INICIAL_SITE, formulario(DIAGNOSTICO))
    expect(estado.confirmacao).toBe(TEXTOS_SITE.diagnostico.confirmacao)
    expect(estado.consentimento?.versao).toBe(1)
    expect(Number.isNaN(Date.parse(estado.consentimento!.aceitoEm))).toBe(false)
  })

  it('o CNPJ já cadastrado recebe exatamente a mesma resposta (DF-56)', async () => {
    const novo = await enviarDiagnostico(ESTADO_INICIAL_SITE, formulario(DIAGNOSTICO))
    const conhecido = await enviarDiagnostico(ESTADO_INICIAL_SITE, formulario({ ...DIAGNOSTICO, cnpj: '21.473.509/0001-21' }))
    expect(semData(conhecido)).toEqual(semData(novo))
  })

  it('sem o consentimento, nada sai (CA-19.2)', async () => {
    const estado = await enviarDiagnostico(ESTADO_INICIAL_SITE, formulario({ ...DIAGNOSTICO, consentimento: '' }))
    expect(estado.erros).toEqual({ consentimento: MENSAGENS_SITE.consentimento })
    expect(estado.confirmacao).toBeUndefined()
  })

  it('o campo armadilha preenchido recebe a confirmação, sem consentimento gravado (CA-19.4)', async () => {
    const estado = await enviarDiagnostico(ESTADO_INICIAL_SITE, formulario({ ...DIAGNOSTICO, [CAMPO_ARMADILHA]: 'http://spam' }))
    expect(estado.confirmacao).toBe(TEXTOS_SITE.diagnostico.confirmacao)
    expect(estado.consentimento).toBeUndefined()
  })

  it('o envio recusado pela validação não gasta o limite: quem errou alguns campos ainda envia (revisão do código)', async () => {
    for (let i = 0; i < 5; i++) {
      expect((await enviarDiagnostico(ESTADO_INICIAL_SITE, formulario({ ...DIAGNOSTICO, cnpj: '123' }))).erros.cnpj).toBeDefined()
    }
    expect((await enviarDiagnostico(ESTADO_INICIAL_SITE, formulario(DIAGNOSTICO))).confirmacao).toBeDefined()
  })

  it('sem o IP de quem envia, não há um balde só para todos os visitantes (revisão do código)', async () => {
    ip.valor = ''
    for (let i = 0; i < 6; i++) expect((await enviarDiagnostico(ESTADO_INICIAL_SITE, formulario(DIAGNOSTICO))).confirmacao).toBeDefined()
  })

  it('o sexto envio do mesmo IP em 10 minutos é recusado (CA-19.4)', async () => {
    for (let i = 0; i < 5; i++) expect((await enviarDiagnostico(ESTADO_INICIAL_SITE, formulario(DIAGNOSTICO))).confirmacao).toBeDefined()
    expect((await enviarDiagnostico(ESTADO_INICIAL_SITE, formulario(DIAGNOSTICO))).erroGeral).toBe(MENSAGEM_LIMITE)
    ip.valor = '8.8.8.8'
    expect((await enviarDiagnostico(ESTADO_INICIAL_SITE, formulario(DIAGNOSTICO))).confirmacao).toBeDefined()
  })
})

describe('enviarCandidatura (F19, F11, DF-50; CA-19.1, CA-19.6)', () => {
  it('confirma com o texto do Apêndice E', async () => {
    const estado = await enviarCandidatura(ESTADO_INICIAL_SITE, formulario(CANDIDATURA))
    expect(estado.confirmacao).toBe(TEXTOS_SITE.especialista.confirmacao)
    expect(estado.consentimento?.versao).toBe(1)
  })

  it('o e-mail já cadastrado entra como candidatura nova, com a mesma resposta (DF-50)', async () => {
    const nova = await enviarCandidatura(ESTADO_INICIAL_SITE, formulario(CANDIDATURA))
    const repetida = await enviarCandidatura(ESTADO_INICIAL_SITE, formulario({ ...CANDIDATURA, email: 'beatriz.fontes@exemplo.com.br' }))
    expect(semData(repetida)).toEqual(semData(nova))
  })

  it('sem o aviso ou sem o consentimento, nada sai (CA-19.2)', async () => {
    const estado = await enviarCandidatura(ESTADO_INICIAL_SITE, formulario({ ...CANDIDATURA, aviso: '', consentimento: '' }))
    expect(estado.erros).toEqual({ aviso: MENSAGENS_SITE.aviso, consentimento: MENSAGENS_SITE.consentimento })
    expect(estado.confirmacao).toBeUndefined()
  })
})
