import type { Atividade } from '../tipos'

// Atividades fictícias (F08). Os prazos das abertas que mostram atraso e proximidade são calculados a partir de hoje
// (`prazoEmDias`), para continuarem atrasadas e próximas do prazo em qualquer dia em que a Cleo navegar. Nelas, o
// `prazo` fica vazio. As fechadas usam datas fixas.

export type AtividadeFicticia = Atividade & { prazoEmDias?: number }

type Base = Pick<AtividadeFicticia, 'id' | 'planoId' | 'clienteId' | 'nome' | 'responsavelId' | 'criadaEm' | 'prioridade'>

const atividade = (
  base: Base,
  resto: Partial<Pick<AtividadeFicticia, 'descricao' | 'executor' | 'prazo' | 'prazoEmDias' | 'status' | 'conclusao' | 'observacoes'>>,
): AtividadeFicticia => ({
  descricao: '',
  executor: '',
  prazo: '',
  status: 'Não iniciada',
  conclusao: null,
  observacoes: '',
  ...base,
  ...resto,
})

export const ATIVIDADES: AtividadeFicticia[] = [
  atividade(
    {
      id: 'atv-licencas-protocolo',
      planoId: 'pla-vertice-licencas',
      clienteId: 'cli-vertice',
      nome: 'Protocolar a renovação da licença de operação',
      responsavelId: 'usr-rafael',
      criadaEm: '2026-05-04',
      prioridade: 'Alta',
    },
    { status: 'Em andamento', prazoEmDias: -6, descricao: 'Protocolo no órgão ambiental estadual, com as certidões em dia.' },
  ),
  atividade(
    {
      id: 'atv-licencas-vistoria',
      planoId: 'pla-vertice-licencas',
      clienteId: 'cli-vertice',
      nome: 'Agendar a vistoria do órgão ambiental',
      responsavelId: 'usr-rafael',
      criadaEm: '2026-05-04',
      prioridade: 'Média',
    },
    { prazoEmDias: 2, executor: 'Ana Ribeiro (SSMA do cliente)' },
  ),
  atividade(
    {
      id: 'atv-licencas-auditoria',
      planoId: 'pla-vertice-licencas',
      clienteId: 'cli-vertice',
      nome: 'Preparar a auditoria interna dos documentos',
      responsavelId: 'usr-rafael',
      criadaEm: '2026-05-04',
      prioridade: 'Baixa',
    },
    { prazoEmDias: 45, observacoes: 'O prazo passa do prazo do plano: a auditoria pode ficar para o ciclo seguinte.' },
  ),
  atividade(
    {
      id: 'atv-licencas-levantamento',
      planoId: 'pla-vertice-licencas',
      clienteId: 'cli-vertice',
      nome: 'Levantar as licenças vencidas',
      responsavelId: 'usr-rafael',
      criadaEm: '2026-05-04',
      prioridade: 'Alta',
    },
    { status: 'Concluída', prazo: '2026-05-15', conclusao: '2026-05-20' },
  ),
  atividade(
    {
      id: 'atv-licencas-alvara',
      planoId: 'pla-vertice-licencas',
      clienteId: 'cli-vertice',
      nome: 'Renovar o alvará da base antiga',
      responsavelId: 'usr-rafael',
      criadaEm: '2026-05-04',
      prioridade: 'Baixa',
    },
    { status: 'Cancelada', prazo: '2026-06-30', observacoes: 'A base antiga foi desativada.' },
  ),
  atividade(
    {
      id: 'atv-desenvolvimento-indicadores',
      planoId: 'pla-vertice-desenvolvimento',
      clienteId: 'cli-vertice',
      nome: 'Definir os indicadores de desempenho da operação',
      responsavelId: 'usr-helena',
      criadaEm: '2026-10-26',
      prioridade: 'Média',
    },
    { prazoEmDias: 4, executor: 'Equipe de gestão do cliente' },
  ),
  atividade(
    {
      id: 'atv-desenvolvimento-capacitacao',
      planoId: 'pla-vertice-desenvolvimento',
      clienteId: 'cli-vertice',
      nome: 'Montar o calendário de capacitação técnica',
      responsavelId: 'usr-rafael',
      criadaEm: '2026-10-26',
      prioridade: 'Baixa',
    },
    { prazoEmDias: 20, executor: 'RH do cliente' },
  ),
  atividade(
    {
      id: 'atv-mobilizacao-asos',
      planoId: 'pla-vertice-mobilizacao',
      clienteId: 'cli-vertice',
      nome: 'Emitir os ASOs da equipe embarcada',
      responsavelId: 'usr-helena',
      criadaEm: '2026-03-03',
      prioridade: 'Alta',
    },
    { status: 'Em andamento', prazoEmDias: -2 },
  ),
  atividade(
    {
      id: 'atv-mobilizacao-treinamento',
      planoId: 'pla-vertice-mobilizacao',
      clienteId: 'cli-vertice',
      nome: 'Concluir os treinamentos de segurança offshore',
      responsavelId: 'usr-helena',
      criadaEm: '2026-03-03',
      prioridade: 'Alta',
    },
    { prazoEmDias: 35 },
  ),
  atividade(
    {
      id: 'atv-fechamento-relatorio',
      planoId: 'pla-atlantica-fechamento',
      clienteId: 'cli-atlantica',
      nome: 'Entregar o relatório de resultados do ciclo',
      responsavelId: 'usr-rafael',
      criadaEm: '2026-02-12',
      prioridade: 'Média',
    },
    { status: 'Concluída', prazo: '2025-12-10', conclusao: '2025-12-09' },
  ),
  atividade(
    {
      id: 'atv-implantacao-agentes',
      planoId: 'pla-rede-norte-implantacao',
      clienteId: 'cli-rede-norte',
      nome: 'Instalar os agentes nas estações',
      responsavelId: 'usr-rafael',
      criadaEm: '2026-04-13',
      prioridade: 'Alta',
    },
    { status: 'Cancelada', prazo: '2026-07-31' },
  ),
  atividade(
    {
      id: 'atv-estruturas-inspecao',
      planoId: 'pla-montareal-estruturas',
      clienteId: 'cli-montareal',
      nome: 'Inspecionar as soldas do módulo 3',
      responsavelId: 'usr-helena',
      criadaEm: '2026-03-02',
      prioridade: 'Alta',
    },
    { status: 'Em andamento', prazoEmDias: -1 },
  ),
]
