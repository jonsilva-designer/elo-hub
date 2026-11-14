import { describe, expect, it } from 'vitest'
import { cnpjValido } from '@/lib/cnpj'
import { AVALIACOES } from './avaliacoes'
import { CLIENTES } from './clientes'
import { HISTORICO } from './historico'
import { DIMENSOES, SEGMENTOS } from './listas'
import { USUARIOS, VINCULOS } from './usuarios'

const digitos = (cnpj: string) => cnpj.replace(/\D/g, '')

describe('clientes de exemplo', () => {
  it('têm CNPJ válido e sem repetição (DF-05)', () => {
    for (const c of CLIENTES) expect(cnpjValido(c.cnpj), `${c.id} ${c.cnpj}`).toBe(true)
    expect(new Set(CLIENTES.map((c) => digitos(c.cnpj))).size).toBe(CLIENTES.length)
  })

  it('só o cadastro da ELO tem a marca DF-40, com o CNPJ do Apêndice C', () => {
    const marcados = CLIENTES.filter((c) => c.ehCadastroElo)
    expect(marcados.map((c) => c.id)).toEqual(['cli-elo'])
    expect(marcados[0]).toMatchObject({
      razaoSocial: 'ELO HUB Governança Inteligente LTDA',
      cnpj: '68.308.773/0001-73',
      status: 'Ativo',
    })
  })

  it('usam só segmentos da lista oficial', () => {
    for (const c of CLIENTES) if (c.segmento) expect(SEGMENTOS, c.id).toContain(c.segmento)
  })
})

describe('segmentos', () => {
  it('são os 11 do Apêndice C, na ordem do PRD (DF-70)', () => {
    expect(SEGMENTOS).toEqual([
      'Óleo e gás',
      'Portuário e logística',
      'Indústria',
      'Construção e montagem',
      'Manutenção e serviços industriais',
      'Serviços gerais',
      'Offshore e Serviços Marítimos',
      'Infraestrutura',
      'Energia',
      'Mineração',
      'Tecnologia',
    ])
  })
})

describe('usuários e vínculos de exemplo', () => {
  it('todo vínculo aponta para um usuário e um cliente que existem', () => {
    for (const v of VINCULOS) {
      expect(USUARIOS.some((u) => u.id === v.usuarioId), v.usuarioId).toBe(true)
      expect(CLIENTES.some((c) => c.id === v.clienteId), v.clienteId).toBe(true)
    }
  })

  it('o Rafael tem três vínculos e o Marcos está inativo', () => {
    const doRafael = VINCULOS.filter((v) => v.usuarioId === 'usr-rafael').map((v) => v.clienteId)
    expect(doRafael).toEqual(['cli-vertice', 'cli-atlantica', 'cli-rede-norte'])
    expect(USUARIOS.find((u) => u.id === 'usr-marcos')?.status).toBe('Inativo')
  })

  it('os e-mails são do domínio da ELO, em minúsculas e sem repetição', () => {
    for (const u of USUARIOS) {
      expect(u.email).toBe(u.email.toLowerCase())
      expect(u.email).toMatch(/@elogovernance\.com\.br$/)
    }
    expect(new Set(USUARIOS.map((u) => u.email)).size).toBe(USUARIOS.length)
  })
})

describe('dimensões de maturidade', () => {
  it('são as 8 do Apêndice C, na ordem do PRD (DF-70)', () => {
    expect(DIMENSOES).toEqual([
      'Regularidade e documentação',
      'Capacidade técnica',
      'Capacidade operacional',
      'Gestão e qualidade',
      'Saúde, segurança e ambiente',
      'Sustentação financeira',
      'Gestão comercial e contratual',
      'Integridade e informação',
    ])
  })
})

describe('avaliações de exemplo', () => {
  it('usam só dimensões da lista, sem repetir na mesma avaliação', () => {
    for (const a of AVALIACOES) {
      const nomes = a.dimensoes.map((d) => d.dimensao)
      for (const n of nomes) expect(DIMENSOES, `${a.id} ${n}`).toContain(n)
      expect(new Set(nomes).size, a.id).toBe(nomes.length)
    }
  })

  it('a inicial da Vértice não tem Integridade e informação, que entrou na lista depois', () => {
    const inicial = AVALIACOES.find((a) => a.id === 'ava-vertice-1')!
    expect(inicial.dimensoes.map((d) => d.dimensao)).not.toContain('Integridade e informação')
    expect(inicial.dimensoes).toHaveLength(7)
  })

  it('toda concluída tem nível em todas as dimensões, maturidade geral, prontidão e o parecer', () => {
    for (const a of AVALIACOES.filter((x) => x.status === 'Concluída')) {
      for (const d of a.dimensoes) expect(d.nivel, `${a.id} ${d.dimensao}`).not.toBeNull()
      expect(a.maturidadeGeral, a.id).not.toBeNull()
      expect(a.prontidao, a.id).not.toBeNull()
      for (const texto of [a.pontosFortes, a.lacunasPrioritarias, a.recomendacao, a.observacoesInternas]) {
        expect(texto.trim(), a.id).not.toBe('')
      }
    }
  })

  it('as médias, quando há, vão de 1 a 5', () => {
    for (const a of AVALIACOES) {
      for (const d of a.dimensoes) {
        if (d.media !== null) {
          expect(d.media, `${a.id} ${d.dimensao}`).toBeGreaterThanOrEqual(1)
          expect(d.media, `${a.id} ${d.dimensao}`).toBeLessThanOrEqual(5)
        }
      }
    }
  })

  it('ids e ordens de criação não se repetem', () => {
    expect(new Set(AVALIACOES.map((a) => a.id)).size).toBe(AVALIACOES.length)
    expect(new Set(AVALIACOES.map((a) => a.ordem)).size).toBe(AVALIACOES.length)
  })

  it('apontam para um cliente que não é o da ELO e para um avaliador permitido (RN-19)', () => {
    for (const a of AVALIACOES) {
      const cliente = CLIENTES.find((c) => c.id === a.clienteId)
      expect(cliente, a.id).toBeDefined()
      expect(cliente!.ehCadastroElo, a.id).toBe(false)
      const avaliador = USUARIOS.find((u) => u.id === a.avaliadorId)!
      const vinculado = VINCULOS.some((v) => v.usuarioId === avaliador.id && v.clienteId === a.clienteId)
      expect(avaliador.perfil === 'Administrador' || vinculado, a.id).toBe(true)
    }
  })

  it('a Montareal tem pelo menos duas dimensões Não avaliada', () => {
    const montareal = AVALIACOES.find((a) => a.id === 'ava-montareal-1')!
    expect(montareal.dimensoes.filter((d) => d.nivel === 'Não avaliada').length).toBeGreaterThanOrEqual(2)
  })
})

describe('histórico de exemplo (F17, DF-16)', () => {
  it('todo cliente e toda avaliação têm a entrada de criação, e ela é a mais antiga do registro', () => {
    const registros = [
      ...CLIENTES.map((c) => ({ tipo: 'cliente', id: c.id, criacao: 'Cadastro criado' })),
      ...AVALIACOES.map((a) => ({ tipo: 'avaliacao', id: a.id, criacao: 'Avaliação criada' })),
    ]
    for (const r of registros) {
      const entradas = HISTORICO.filter((h) => h.tipo === r.tipo && h.registroId === r.id).sort((x, y) =>
        Date.parse(x.dataHora) - Date.parse(y.dataHora),
      )
      expect(entradas[0]?.descricao, `${r.tipo} ${r.id}`).toBe(r.criacao)
    }
  })

  it('aponta para usuários que existem, com data e hora no fuso de Brasília', () => {
    for (const h of HISTORICO) {
      expect(USUARIOS.some((u) => u.id === h.usuarioId), h.id).toBe(true)
      expect(h.dataHora, h.id).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/)
    }
    expect(new Set(HISTORICO.map((h) => h.id)).size).toBe(HISTORICO.length)
  })

  it('o telefone da Vértice no histórico é o mesmo do cadastro', () => {
    const vertice = CLIENTES.find((c) => c.id === 'cli-vertice')!
    const entrada = HISTORICO.find((h) => h.registroId === 'cli-vertice' && h.descricao === 'Telefone')!
    expect(entrada.valorNovo).toBe('(22) 2765-4310')
    expect(vertice.telefone).toBe('(22) 2765-4310')
  })
})
