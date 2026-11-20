import { describe, expect, it } from 'vitest'
import type { EspecialistaDetalhado } from '@/lib/dados/tipos'
import { lerDadosEspecialista, MENSAGENS_ESPECIALISTA, validarEspecialista, type DadosEspecialista } from './validacao'

const NOVO: DadosEspecialista = {
  nome: 'Helena Ribas',
  dataNascimento: '',
  especialidade: 'Financeiro',
  subespecialidade: '',
  email: 'helena.ribas@exemplo.com.br',
  telefone: '(21) 99999-0000',
  cidade: '',
  uf: '',
  empresa: '',
  curriculo: '',
  status: 'Ativo',
  observacoes: '',
}

const ESPECIALIDADES = ['Financeiro', 'Gestão de riscos']

const validar = (dados: Partial<DadosEspecialista>, atual: EspecialistaDetalhado | null = null) =>
  validarEspecialista({ ...NOVO, ...dados }, { atual, especialidades: ESPECIALIDADES })

describe('validarEspecialista (F11, DF-27)', () => {
  it('o cadastro válido não tem erro; data de nascimento, cidade, empresa e currículo são opcionais', () => {
    expect(validar({})).toEqual({})
  })

  it('nome, especialidade, e-mail e telefone são obrigatórios', () => {
    expect(validar({ nome: ' ', especialidade: '', email: '', telefone: '' })).toEqual({
      nome: MENSAGENS_ESPECIALISTA.nome,
      especialidade: MENSAGENS_ESPECIALISTA.especialidade,
      email: MENSAGENS_ESPECIALISTA.email,
      telefone: MENSAGENS_ESPECIALISTA.telefone,
    })
  })

  it('e-mail, link, data e UF com formato válido; especialidade da lista', () => {
    expect(
      validar({ email: 'sem-arroba', curriculo: 'linkedin', dataNascimento: '1990-02-30', uf: 'XX', especialidade: 'Outra' }),
    ).toEqual({
      email: MENSAGENS_ESPECIALISTA.emailInvalido,
      curriculo: MENSAGENS_ESPECIALISTA.curriculo,
      dataNascimento: MENSAGENS_ESPECIALISTA.data,
      uf: MENSAGENS_ESPECIALISTA.uf,
      especialidade: MENSAGENS_ESPECIALISTA.especialidade,
    })
    expect(validar({ curriculo: 'https://www.linkedin.com/in/x', uf: 'RJ' })).toEqual({})
  })

  it('no cadastro interno, Em análise ou Ativo; na edição, os três (6.1)', () => {
    expect(validar({ status: 'Inativo' })).toEqual({ status: MENSAGENS_ESPECIALISTA.status })
    expect(validar({ status: 'Em análise' })).toEqual({})
    expect(validar({ status: 'Inativo' }, { id: 'esp-x', status: 'Ativo' } as EspecialistaDetalhado)).toEqual({})
  })
})

describe('lerDadosEspecialista', () => {
  it('lê os campos sem espaços nas pontas', () => {
    const fd = new FormData()
    fd.set('nome', '  Helena  ')
    fd.set('email', ' h@exemplo.com.br ')
    expect(lerDadosEspecialista(fd)).toMatchObject({ nome: 'Helena', email: 'h@exemplo.com.br', telefone: '' })
  })
})

describe('revisão do código', () => {
  it('o link do currículo segue a mesma regra do site: maiúsculas e endereço sem ponto passam', () => {
    expect(validar({ curriculo: 'HTTPS://linkedin.com/in/x' }).curriculo).toBeUndefined()
    expect(validar({ curriculo: 'https://lnkd' }).curriculo).toBeUndefined()
    expect(validar({ curriculo: 'linkedin.com/in/x' }).curriculo).toBe(MENSAGENS_ESPECIALISTA.curriculo)
  })

  it('a especialidade que saiu da lista continua aceita na edição, sem troca', () => {
    const atual = { especialidade: 'Gestão de contratos' } as EspecialistaDetalhado
    expect(validar({ especialidade: 'Gestão de contratos' }, atual).especialidade).toBeUndefined()
    expect(validar({ especialidade: 'Gestão de contratos' }).especialidade).toBe(MENSAGENS_ESPECIALISTA.especialidade)
  })
})
