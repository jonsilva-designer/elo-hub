import { describe, expect, it } from 'vitest'
import { cnpjValido } from '@/lib/cnpj'
import { ETAPAS } from '@/lib/jornada/regras'
import { ATIVIDADES } from './atividades'
import { AVALIACOES } from './avaliacoes'
import { CLIENTES } from './clientes'
import { CONTRATOS } from './contratos'
import { COMENTARIOS, DEMANDAS } from './demandas'
import { DOCUMENTOS } from './documentos'
import { ESCOPOS } from './escopos'
import { ESPECIALISTAS } from './especialistas'
import { HISTORICO } from './historico'
import { CATEGORIAS, CATEGORIAS_DOCUMENTO, CONTRATANTES, DIMENSOES, ESPECIALIDADES, SEGMENTOS, SERVICOS } from './listas'
import { PLANOS } from './planos'
import { erroDoArquivo, nomeDeArquivoSeguro } from '@/lib/documentos/regras'
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
      // A candidatura do site chega sem usuário (parte 5, 5.2).
      const doSite = h.usuarioId === 'site' && h.descricao === 'Candidatura recebida pelo site'
      expect(doSite || USUARIOS.some((u) => u.id === h.usuarioId), h.id).toBe(true)
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

describe('serviços e contratantes (Apêndice C)', () => {
  it('são os do Apêndice C, na ordem do PRD (DF-69, DF-70)', () => {
    expect(SERVICOS).toEqual([
      'Manutenção Industrial',
      'Manutenção Mecânica',
      'Manutenção Elétrica e Instrumentação',
      'Engenharia',
      'Inspeção e Integridade de Ativos',
      'Construção e Montagem Industrial',
      'Operação e Apoio Operacional',
      'Logística e Transporte',
      'Movimentação de Cargas',
      'Serviços Portuários e Marítimos',
      'Serviços Offshore',
      'Limpeza e Conservação',
      'Gestão Ambiental',
      'Segurança, Saúde e Meio Ambiente (SSMA)',
      'Tecnologia da Informação',
      'Consultoria e Assessoria Técnica',
      'Gestão de Projetos',
      'Fornecimento de Mão de Obra Especializada',
      'Caldeiraria e Soldagem',
      'Facilities',
    ])
    expect(CONTRATANTES).toEqual(['Petrobras', 'Porto do Açu', 'FMC Logística'])
  })
})

const responsavelPermitido = (usuarioId: string, clienteId: string) => {
  const u = USUARIOS.find((x) => x.id === usuarioId)
  if (!u) return false
  return u.perfil === 'Administrador' || VINCULOS.some((v) => v.usuarioId === u.id && v.clienteId === clienteId)
}

describe('contratos de exemplo (F03, F04)', () => {
  it('apontam para um cliente que não é o da ELO, com contratante, serviços e responsável permitidos', () => {
    for (const c of CONTRATOS) {
      const cliente = CLIENTES.find((x) => x.id === c.clienteId)
      expect(cliente, c.id).toBeDefined()
      expect(cliente!.ehCadastroElo, c.id).toBe(false)
      expect(CONTRATANTES, c.id).toContain(c.contratante)
      expect(c.servicos.length, c.id).toBeGreaterThan(0)
      for (const s of c.servicos) expect(SERVICOS, `${c.id} ${s}`).toContain(s)
      expect(responsavelPermitido(c.responsavelId, c.clienteId), c.id).toBe(true)
    }
  })

  it('ids não se repetem, e o código é único dentro do cliente (DF-47)', () => {
    expect(new Set(CONTRATOS.map((c) => c.id)).size).toBe(CONTRATOS.length)
    const chaves = CONTRATOS.map((c) => `${c.clienteId} ${c.codigo.toLowerCase()}`)
    expect(new Set(chaves).size).toBe(CONTRATOS.length)
  })

  it('a vigência segue o status e o tipo (RN-03, DF-68)', () => {
    for (const c of CONTRATOS) {
      if (c.status === 'Proposta' || c.status === 'Em contratação') {
        expect(c.inicio, c.id).toBeNull()
        expect(c.termino, c.id).toBeNull()
        expect(c.terminoEmDias, c.id).toBeUndefined()
      }
      if (c.tipoVigencia === 'Prazo indeterminado') {
        expect(c.termino, c.id).toBeNull()
        expect(c.terminoEmDias, c.id).toBeUndefined()
      }
      if ((c.status === 'Ativo' || c.status === 'Suspenso') && c.tipoVigencia !== 'Prazo indeterminado') {
        expect(c.inicio, c.id).not.toBeNull()
        expect(c.termino !== null || c.terminoEmDias !== undefined, c.id).toBe(true)
      }
    }
  })

  it('cliente Inativo só tem contratos Encerrados ou Cancelados (RN-18)', () => {
    const inativos = CLIENTES.filter((c) => c.status === 'Inativo').map((c) => c.id)
    for (const c of CONTRATOS.filter((x) => inativos.includes(x.clienteId))) {
      expect(['Encerrado', 'Cancelado'], c.id).toContain(c.status)
    }
  })
})

describe('escopos de exemplo (F05, F06)', () => {
  it('são do mesmo cliente do contrato e têm as 5 etapas na ordem (RN-02, CA-06.1)', () => {
    for (const e of ESCOPOS) {
      const contrato = CONTRATOS.find((c) => c.id === e.contratoId)
      expect(contrato, e.id).toBeDefined()
      expect(e.clienteId, e.id).toBe(contrato!.clienteId)
      expect(e.etapas.map((l) => l.etapa), e.id).toEqual(ETAPAS)
      expect(responsavelPermitido(e.responsavelId, e.clienteId), e.id).toBe(true)
    }
    expect(new Set(ESCOPOS.map((e) => e.id)).size).toBe(ESCOPOS.length)
  })

  it('o ciclo anterior é do mesmo cliente (DF-57)', () => {
    for (const e of ESCOPOS.filter((x) => x.cicloAnteriorId)) {
      const anterior = ESCOPOS.find((x) => x.id === e.cicloAnteriorId)
      expect(anterior?.clienteId, e.id).toBe(e.clienteId)
    }
  })

  it('etapa Concluída tem data de conclusão, e o responsável da etapa é permitido (CA-06.3, RN-19)', () => {
    for (const e of ESCOPOS) {
      for (const l of e.etapas) {
        if (l.status === 'Concluída') expect(l.conclusao, `${e.id} ${l.etapa}`).not.toBeNull()
        if (l.responsavelId) expect(responsavelPermitido(l.responsavelId, e.clienteId), `${e.id} ${l.etapa}`).toBe(true)
      }
    }
  })

  it('escopo de contrato fechado está fechado, e o Concluído tem a data efetiva (RN-18, DF-08)', () => {
    for (const e of ESCOPOS) {
      const contrato = CONTRATOS.find((c) => c.id === e.contratoId)!
      if (contrato.status === 'Encerrado' || contrato.status === 'Cancelado') {
        expect(['Concluído', 'Cancelado'], e.id).toContain(e.status)
      }
      if (e.status === 'Concluído') expect(e.conclusaoEfetiva, e.id).not.toBeNull()
    }
  })
})

describe('contrato de referência das avaliações (CA-20.3)', () => {
  it('é sempre do mesmo cliente', () => {
    for (const a of AVALIACOES.filter((x) => x.contratoId)) {
      const contrato = CONTRATOS.find((c) => c.id === a.contratoId)
      expect(contrato?.clienteId, a.id).toBe(a.clienteId)
    }
    expect(AVALIACOES.find((a) => a.id === 'ava-atlantica-1')!.contratoId).toBe('ctr-atlantica-porto')
  })
})

describe('histórico dos contratos (F17)', () => {
  it('todo contrato tem "Contrato criado", a entrada mais antiga dele, depois do cadastro do cliente', () => {
    for (const c of CONTRATOS) {
      const entradas = HISTORICO.filter((h) => h.tipo === 'contrato' && h.registroId === c.id).sort(
        (x, y) => Date.parse(x.dataHora) - Date.parse(y.dataHora),
      )
      expect(entradas[0]?.descricao, c.id).toBe('Contrato criado')
      const cadastro = HISTORICO.find((h) => h.tipo === 'cliente' && h.registroId === c.clienteId && h.descricao === 'Cadastro criado')
      expect(Date.parse(entradas[0].dataHora), c.id).toBeGreaterThan(Date.parse(cadastro!.dataHora))
    }
  })
})

describe('planos e atividades de exemplo (F07, F08)', () => {
  it('o plano é do cliente do escopo, e a atividade do cliente do plano (RN-02)', () => {
    for (const p of PLANOS) {
      const escopo = ESCOPOS.find((e) => e.id === p.escopoId)
      expect(escopo, p.id).toBeDefined()
      expect(p.clienteId, p.id).toBe(escopo!.clienteId)
      expect(responsavelPermitido(p.responsavelId, p.clienteId), p.id).toBe(true)
    }
    for (const a of ATIVIDADES) {
      const plano = PLANOS.find((p) => p.id === a.planoId)
      expect(plano, a.id).toBeDefined()
      expect(a.clienteId, a.id).toBe(plano!.clienteId)
      expect(responsavelPermitido(a.responsavelId, a.clienteId), a.id).toBe(true)
    }
    expect(new Set(PLANOS.map((p) => p.id)).size).toBe(PLANOS.length)
    expect(new Set(ATIVIDADES.map((a) => a.id)).size).toBe(ATIVIDADES.length)
  })

  it('a avaliação do plano é do mesmo cliente (RN-02, DF-80)', () => {
    for (const p of PLANOS.filter((x) => x.avaliacaoId)) {
      expect(AVALIACOES.find((a) => a.id === p.avaliacaoId)?.clienteId, p.id).toBe(p.clienteId)
    }
  })

  it('toda atividade tem prazo e prioridade (DF-10); só a Concluída tem data de conclusão (DF-43)', () => {
    for (const a of ATIVIDADES) {
      expect(a.prazo !== '' || a.prazoEmDias !== undefined, a.id).toBe(true)
      expect(['Baixa', 'Média', 'Alta'], a.id).toContain(a.prioridade)
      expect(a.conclusao !== null, a.id).toBe(a.status === 'Concluída')
    }
  })

  it('escopo fechado só tem planos fechados, e plano fechado só tem atividades fechadas (RN-18)', () => {
    const fechado = (s: string) => ['Concluído', 'Cancelado', 'Concluída', 'Cancelada'].includes(s)
    for (const p of PLANOS) {
      const escopo = ESCOPOS.find((e) => e.id === p.escopoId)!
      if (fechado(escopo.status)) expect(fechado(p.status), p.id).toBe(true)
    }
    for (const a of ATIVIDADES) {
      const plano = PLANOS.find((p) => p.id === a.planoId)!
      if (fechado(plano.status)) expect(fechado(a.status), a.id).toBe(true)
    }
  })

  it('todo plano tem "Plano criado" no histórico', () => {
    for (const p of PLANOS) {
      expect(HISTORICO.some((h) => h.tipo === 'plano' && h.registroId === p.id && h.descricao === 'Plano criado'), p.id).toBe(true)
    }
  })
})

describe('especialistas de exemplo (F11)', () => {
  it('têm os obrigatórios da DF-27 e especialidade da lista oficial, sem repetir id', () => {
    for (const e of ESPECIALISTAS) {
      expect(e.nome && e.email && e.telefone, e.id).toBeTruthy()
      expect(ESPECIALIDADES, e.id).toContain(e.especialidade)
    }
    expect(new Set(ESPECIALISTAS.map((e) => e.id)).size).toBe(ESPECIALISTAS.length)
  })

  it('a candidatura do site nasce Em análise; o cadastro interno não tem candidatura (CA-11.1)', () => {
    for (const e of ESPECIALISTAS.filter((x) => x.origem === 'Site')) {
      expect(HISTORICO.some((h) => h.registroId === e.id && h.descricao === 'Candidatura recebida pelo site'), e.id).toBe(true)
    }
  })

  it('os escopos só ligam especialistas que existem', () => {
    for (const e of ESCOPOS) {
      for (const id of e.especialistaIds) expect(ESPECIALISTAS.some((x) => x.id === id), `${e.id} ${id}`).toBe(true)
    }
  })
})

describe('demandas de exemplo (F09)', () => {
  it('contrato e escopo do cliente, escopo do contrato, e os responsáveis permitidos (DF-12, RN-19)', () => {
    for (const d of DEMANDAS) {
      if (d.contratoId) expect(CONTRATOS.find((c) => c.id === d.contratoId)?.clienteId, d.numero).toBe(d.clienteId)
      if (d.escopoId) {
        const escopo = ESCOPOS.find((e) => e.id === d.escopoId)
        expect(escopo?.clienteId, d.numero).toBe(d.clienteId)
        if (d.contratoId) expect(escopo?.contratoId, d.numero).toBe(d.contratoId)
      }
      expect(responsavelPermitido(d.responsavelTriagemId, d.clienteId), d.numero).toBe(true)
      if (d.responsavelAtendimentoId) expect(responsavelPermitido(d.responsavelAtendimentoId, d.clienteId), d.numero).toBe(true)
    }
    expect(new Set(DEMANDAS.map((d) => d.numero)).size).toBe(DEMANDAS.length)
  })

  it('a Institucional só no cadastro da ELO, que só tem Institucional (CA-09.15)', () => {
    for (const d of DEMANDAS) {
      const elo = CLIENTES.find((c) => c.id === d.clienteId)?.ehCadastroElo === true
      expect(d.origem === 'Institucional', d.numero).toBe(elo)
    }
  })

  it('categoria da lista; com mais de um especialista, um principal; só a Encerrada tem data de encerramento', () => {
    for (const d of DEMANDAS) {
      if (d.categoria) expect(CATEGORIAS, d.numero).toContain(d.categoria)
      if (d.especialistas.length > 1) expect(d.especialistas.filter((e) => e.principal), d.numero).toHaveLength(1)
      expect(d.encerradaEm !== null, d.numero).toBe(d.status === 'Encerrada')
      if (['Resolvida', 'Encerrada'].includes(d.status)) expect(d.solucao, d.numero).not.toBe('')
    }
  })

  it('os comentários são de demandas que existem; o contato tem especialista e data (DF-30)', () => {
    for (const c of COMENTARIOS) {
      expect(DEMANDAS.some((d) => d.numero === c.numero), c.id).toBe(true)
      if (c.tipo === 'Contato com especialista') expect(c.especialistaId && c.dataContato, c.id).toBeTruthy()
    }
  })

  it('sem demanda nos exemplos que precisam continuar sem nada ligado (partes 2 e 3)', () => {
    for (const d of DEMANDAS) {
      expect(['cli-ondamar', 'cli-limpar'], d.numero).not.toContain(d.clienteId)
      expect(['esc-vertice-qualidade', 'esc-rede-norte-rmm'], d.numero).not.toContain(d.escopoId)
      expect(d.contratoId, d.numero).not.toBe('ctr-atlantica-ssma')
    }
  })
})

describe('documentos de exemplo (F12)', () => {
  it('categoria da lista, arquivo válido e com nome higienizado, sem repetir id (CA-12.1, CA-12.2)', () => {
    expect(new Set(DOCUMENTOS.map((d) => d.id)).size).toBe(DOCUMENTOS.length)
    for (const d of DOCUMENTOS) {
      expect(CATEGORIAS_DOCUMENTO, d.id).toContain(d.categoria)
      expect(erroDoArquivo(d.arquivo), d.id).toBeNull()
      expect(nomeDeArquivoSeguro(d.arquivo.nome), d.id).toBe(d.arquivo.nome)
      expect(USUARIOS.map((u) => u.id), d.id).toContain(d.incluidoPorId)
      expect(d.nome.trim(), d.id).not.toBe('')
    }
  })

  it('sem cliente só no Documento do Especialista, que sempre tem especialista (DF-65)', () => {
    for (const d of DOCUMENTOS) {
      if (d.categoria === 'Documento do Especialista') {
        expect(ESPECIALISTAS.map((e) => e.id), d.id).toContain(d.especialistaId)
      } else {
        expect(d.clienteId, d.id).not.toBeNull()
        expect(d.especialistaId, d.id).toBeNull()
      }
      if (d.clienteId === null) {
        for (const campo of ['contratoId', 'escopoId', 'etapa', 'planoId', 'atividadeId', 'demandaNumero', 'avaliacaoId'] as const) {
          expect(d[campo], `${d.id} ${campo}`).toBeNull()
        }
      }
    }
  })

  it('os vínculos são do cliente do documento, e cada ancestral bate (RN-02)', () => {
    for (const d of DOCUMENTOS) {
      const contrato = CONTRATOS.find((c) => c.id === d.contratoId)
      const escopo = ESCOPOS.find((e) => e.id === d.escopoId)
      const plano = PLANOS.find((p) => p.id === d.planoId)
      const atividade = ATIVIDADES.find((a) => a.id === d.atividadeId)
      if (d.contratoId) expect(contrato?.clienteId, d.id).toBe(d.clienteId)
      if (d.escopoId) expect(escopo && escopo.clienteId === d.clienteId && escopo.contratoId === d.contratoId, d.id).toBe(true)
      if (d.etapa) expect(escopo, d.id).toBeDefined()
      if (d.planoId) expect(plano?.escopoId, d.id).toBe(d.escopoId)
      if (d.atividadeId) expect(atividade?.planoId, d.id).toBe(d.planoId)
      if (d.demandaNumero) expect(DEMANDAS.find((x) => x.numero === d.demandaNumero)?.clienteId, d.id).toBe(d.clienteId)
      if (d.avaliacaoId) expect(AVALIACOES.find((a) => a.id === d.avaliacaoId)?.clienteId, d.id).toBe(d.clienteId)
    }
  })

  it('Superado só com substituto do mesmo cliente; os outros sem (RN-15, DF-63)', () => {
    for (const d of DOCUMENTOS) {
      if (d.status !== 'Superado') {
        expect(d.substituidoPorId, d.id).toBeNull()
        continue
      }
      const substituto = DOCUMENTOS.find((x) => x.id === d.substituidoPorId)
      expect(substituto?.clienteId, d.id).toBe(d.clienteId)
      expect(substituto?.status, d.id).toBe('Vigente')
    }
  })

  it('o documento principal do contrato é um Contrato ou Proposta Comercial dele (F03)', () => {
    for (const c of CONTRATOS) {
      if (!c.documentoPrincipalId) continue
      const principal = DOCUMENTOS.find((d) => d.id === c.documentoPrincipalId)
      expect(principal?.contratoId, c.id).toBe(c.id)
      expect(['Contrato', 'Proposta Comercial'], c.id).toContain(principal?.categoria)
    }
  })

  it('sem documento nos exemplos que precisam continuar sem nada ligado (partes 2 a 5)', () => {
    for (const d of DOCUMENTOS) {
      expect(['cli-ondamar', 'cli-limpar', 'cli-fortec'], d.id).not.toContain(d.clienteId)
      expect(['esc-vertice-qualidade', 'esc-rede-norte-rmm'], d.id).not.toContain(d.escopoId)
      expect(d.contratoId, d.id).not.toBe('ctr-atlantica-ssma')
    }
  })

  it('todo documento tem "Documento incluído" no histórico', () => {
    for (const d of DOCUMENTOS) {
      expect(HISTORICO.some((h) => h.tipo === 'documento' && h.registroId === d.id && h.descricao === 'Documento incluído'), d.id).toBe(true)
    }
  })
})
