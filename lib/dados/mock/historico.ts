import type { RegistroAlteracao } from '../tipos'

// Histórico fictício (F17, DF-16): a criação de cada cliente, avaliação, contrato e escopo e algumas alterações
// relevantes. Como salvar só simula, o histórico não cresce no protótipo.

type Entrada = [
  registro: string,
  dataHora: string,
  usuarioId: string,
  descricao: string,
  anterior?: string,
  novo?: string,
  justificativa?: string,
]

const cliente = (...e: Entrada) => ({ tipo: 'cliente' as const, e })
const avaliacao = (...e: Entrada) => ({ tipo: 'avaliacao' as const, e })
const contrato = (...e: Entrada) => ({ tipo: 'contrato' as const, e })
const escopo = (...e: Entrada) => ({ tipo: 'escopo' as const, e })

const ENTRADAS = [
  cliente('cli-elo', '2026-01-05T09:00:00-03:00', 'usr-helena', 'Cadastro criado'),
  cliente('cli-fortec', '2026-01-20T10:00:00-03:00', 'usr-helena', 'Cadastro criado'),
  cliente('cli-vertice', '2026-02-02T09:15:00-03:00', 'usr-helena', 'Cadastro criado'),
  cliente('cli-atlantica', '2026-02-10T10:20:00-03:00', 'usr-helena', 'Cadastro criado'),
  cliente('cli-montareal', '2026-02-18T14:00:00-03:00', 'usr-helena', 'Cadastro criado'),
  cliente('cli-atlantica', '2026-03-02T11:05:00-03:00', 'usr-helena', 'Vínculo incluído', undefined, 'Rafael Souza'),
  avaliacao('ava-vertice-1', '2026-03-09T10:00:00-03:00', 'usr-helena', 'Avaliação criada'),
  avaliacao('ava-vertice-1', '2026-03-11T17:00:00-03:00', 'usr-helena', 'Status da avaliação', 'Em elaboração', 'Concluída'),
  cliente('cli-vertice', '2026-03-12T16:40:00-03:00', 'usr-helena', 'Status do cliente', 'Prospect', 'Ativo'),
  cliente('cli-vertice', '2026-03-12T16:45:00-03:00', 'usr-helena', 'Vínculo incluído', undefined, 'Rafael Souza'),
  cliente('cli-rede-norte', '2026-04-08T15:00:00-03:00', 'usr-helena', 'Cadastro criado'),
  cliente('cli-rede-norte', '2026-04-08T15:10:00-03:00', 'usr-helena', 'Vínculo incluído', undefined, 'Rafael Souza'),
  cliente('cli-montareal', '2026-05-04T09:40:00-03:00', 'usr-helena', 'Vínculo incluído', undefined, 'Marcos Lima'),
  cliente('cli-ondamar', '2026-06-01T09:30:00-03:00', 'usr-helena', 'Cadastro criado'),
  cliente('cli-ondamar', '2026-06-15T14:10:00-03:00', 'usr-helena', 'Status do cliente', 'Prospect', 'Ativo'),
  cliente('cli-fortec', '2026-08-05T11:00:00-03:00', 'usr-helena', 'Status do cliente', 'Ativo', 'Inativo'),
  avaliacao('ava-atlantica-1', '2026-08-18T09:00:00-03:00', 'usr-helena', 'Avaliação criada'),
  avaliacao('ava-atlantica-1', '2026-08-21T15:30:00-03:00', 'usr-helena', 'Status da avaliação', 'Em elaboração', 'Concluída'),
  avaliacao('ava-vertice-2', '2026-09-10T10:00:00-03:00', 'usr-helena', 'Avaliação criada'),
  avaliacao('ava-vertice-2', '2026-09-11T08:30:00-03:00', 'usr-helena', 'Avaliador', 'Helena Prado', 'Rafael Souza'),
  avaliacao('ava-vertice-2', '2026-09-18T17:10:00-03:00', 'usr-helena', 'Status da avaliação', 'Em elaboração', 'Concluída'),
  cliente('cli-vertice', '2026-09-20T14:32:00-03:00', 'usr-helena', 'Telefone', undefined, '(22) 2765-4310'),
  avaliacao('ava-montareal-1', '2026-10-01T10:00:00-03:00', 'usr-helena', 'Avaliação criada'),
  avaliacao('ava-montareal-1', '2026-10-03T16:20:00-03:00', 'usr-helena', 'Status da avaliação', 'Em elaboração', 'Concluída'),
  avaliacao('ava-ondamar-1', '2026-10-13T09:00:00-03:00', 'usr-helena', 'Avaliação criada'),
  avaliacao('ava-ondamar-1', '2026-10-15T11:45:00-03:00', 'usr-helena', 'Status da avaliação', 'Em elaboração', 'Concluída'),
  cliente('cli-limpar', '2026-10-20T16:00:00-03:00', 'usr-helena', 'Cadastro criado'),
  avaliacao('ava-vertice-3', '2026-11-05T14:20:00-03:00', 'usr-rafael', 'Avaliação criada'),
  // Parte 3: os contratos, registrados na plataforma depois do cadastro do cliente.
  contrato('ctr-fortec-subestacoes', '2026-01-21T10:00:00-03:00', 'usr-helena', 'Contrato criado'),
  contrato('ctr-vertice-manutencao', '2026-02-03T10:00:00-03:00', 'usr-helena', 'Contrato criado'),
  contrato('ctr-vertice-mobilizacao', '2026-02-10T09:30:00-03:00', 'usr-helena', 'Contrato criado'),
  contrato('ctr-atlantica-porto', '2026-02-11T09:00:00-03:00', 'usr-helena', 'Contrato criado'),
  contrato('ctr-montareal-montagem', '2026-02-19T10:00:00-03:00', 'usr-helena', 'Contrato criado'),
  contrato('ctr-atlantica-ssma', '2026-02-20T15:00:00-03:00', 'usr-helena', 'Contrato criado'),
  contrato('ctr-montareal-pintura', '2026-02-20T11:00:00-03:00', 'usr-helena', 'Contrato criado'),
  contrato('ctr-vertice-mobilizacao', '2026-02-26T16:00:00-03:00', 'usr-helena', 'Status do contrato', 'Proposta', 'Ativo'),
  contrato('ctr-vertice-mobilizacao', '2026-02-26T16:01:00-03:00', 'usr-helena', 'Início da vigência', undefined, '01/03/2026'),
  contrato('ctr-montareal-pintura', '2026-03-16T17:00:00-03:00', 'usr-helena', 'Status do contrato', 'Proposta', 'Cancelado'),
  contrato('ctr-atlantica-ssma', '2026-03-25T10:00:00-03:00', 'usr-helena', 'Status do contrato', 'Proposta', 'Ativo'),
  contrato('ctr-rede-norte-rmm', '2026-04-09T10:00:00-03:00', 'usr-helena', 'Contrato criado'),
  contrato('ctr-ondamar-apoio', '2026-06-02T09:00:00-03:00', 'usr-helena', 'Contrato criado'),
  contrato('ctr-atlantica-ssma', '2026-09-15T11:20:00-03:00', 'usr-helena', 'Status do contrato', 'Ativo', 'Suspenso'),
  contrato('ctr-rede-norte-glpi', '2026-10-05T14:00:00-03:00', 'usr-helena', 'Contrato criado'),
  contrato('ctr-vertice-proposta', '2026-10-21T11:00:00-03:00', 'usr-helena', 'Contrato criado'),
  contrato('ctr-rede-norte-glpi', '2026-10-28T09:15:00-03:00', 'usr-helena', 'Status do contrato', 'Proposta', 'Em contratação'),
  // Parte 3B: os escopos, criados no dia da classificação da criticidade, depois do cadastro do contrato.
  escopo('esc-vertice-documental', '2026-02-04T10:00:00-03:00', 'usr-helena', 'Escopo criado'),
  escopo('esc-vertice-qualidade', '2026-02-04T10:30:00-03:00', 'usr-helena', 'Escopo criado'),
  escopo('esc-atlantica-2025', '2026-02-12T09:00:00-03:00', 'usr-helena', 'Escopo criado'),
  escopo('esc-atlantica-2026', '2026-02-12T09:30:00-03:00', 'usr-helena', 'Escopo criado'),
  escopo('esc-montareal-montagem', '2026-02-19T10:30:00-03:00', 'usr-helena', 'Escopo criado'),
  escopo('esc-vertice-mobilizacao', '2026-02-27T14:00:00-03:00', 'usr-helena', 'Escopo criado'),
  escopo('esc-vertice-mobilizacao', '2026-03-02T09:00:00-03:00', 'usr-helena', 'Contrato', 'CT-2025-031', 'CT-2026-044'),
  escopo('esc-atlantica-ssma', '2026-03-26T10:00:00-03:00', 'usr-helena', 'Escopo criado'),
  escopo('esc-rede-norte-rmm', '2026-04-09T10:30:00-03:00', 'usr-helena', 'Escopo criado'),
  escopo('esc-vertice-documental', '2026-04-30T16:00:00-03:00', 'usr-rafael', 'Etapa Diagnosticar', 'Em andamento', 'Concluída'),
  escopo('esc-atlantica-ssma', '2026-09-15T11:30:00-03:00', 'usr-helena', 'Status do escopo', 'Em andamento', 'Cancelado'),
  escopo(
    'esc-vertice-documental',
    '2026-10-02T10:15:00-03:00',
    'usr-helena',
    'Criticidade',
    'Moderada',
    'Alta',
    'Três certidões vencem antes da próxima medição, e o contratante pode reter o pagamento sem elas.',
  ),
  escopo('esc-vertice-diagnostico', '2026-10-22T09:00:00-03:00', 'usr-helena', 'Escopo criado'),
]

export const HISTORICO: RegistroAlteracao[] = ENTRADAS.map(({ tipo, e }, i) => {
  const [registroId, dataHora, usuarioId, descricao, valorAnterior, valorNovo, justificativa] = e
  return {
    id: `his-${String(i + 1).padStart(2, '0')}`,
    tipo,
    registroId,
    dataHora,
    usuarioId,
    descricao,
    ...(valorAnterior === undefined ? {} : { valorAnterior }),
    ...(valorNovo === undefined ? {} : { valorNovo }),
    ...(justificativa === undefined ? {} : { justificativa }),
  }
})
