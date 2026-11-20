import type { Criticidade, Prioridade } from '@/lib/design/status'

export type Perfil = 'Administrador' | 'Equipe'

export type StatusUsuario = 'Ativo' | 'Inativo'

export type Usuario = { id: string; nome: string; email: string; perfil: Perfil; status: StatusUsuario }

export type StatusCliente = 'Prospect' | 'Ativo' | 'Inativo'

/** Campos de F02. Os opcionais podem ficar vazios; a parte 2 completa o que as telas de cliente pedirem. */
export type Cliente = {
  id: string
  razaoSocial: string
  nomeFantasia?: string
  cnpj: string
  segmento?: string
  cidade?: string
  uf?: string
  contatoPrincipal?: string
  cargo?: string
  telefone?: string
  email?: string
  status: StatusCliente
  observacoes?: string
  /** O cadastro da própria ELO, só para as demandas institucionais. Fica fora do total de clientes ativos (DF-40). */
  ehCadastroElo: boolean
}

export type Vinculo = { usuarioId: string; clienteId: string }

/** Os perfis de exemplo do bloco "Protótipo" do login. */
export type ExemplosDoPrototipo = {
  administrador: Usuario
  equipe: Usuario
  clientesDaEquipe: number
  emailInativo: string
}

// Avaliação de maturidade (F20, PRD 6.1). O avaliador informa os níveis, a média e a prontidão:
// a plataforma não calcula nada (RN-25).

export type NivelMaturidade = 'Inicial' | 'Básica' | 'Em estruturação' | 'Consistente' | 'Avançada'

export type NivelDimensao = NivelMaturidade | 'Não avaliada'

export type MaturidadeGeral = NivelMaturidade | 'Inconclusiva'

export type Prontidao = 'Pronto' | 'Pronto com condições' | 'Não pronto no momento' | 'Inconclusivo'

export type StatusAvaliacao = 'Em elaboração' | 'Concluída'

/** Uma dimensão da avaliação. O nível fica vazio (`null`) só enquanto a avaliação está Em elaboração. */
export type LinhaDimensao = { dimensao: string; nivel: NivelDimensao | null; media: number | null; lacuna: string }

export type AvaliacaoMaturidade = {
  id: string
  clienteId: string
  /** Ordem de criação: desempata duas avaliações da mesma data (RN-25). */
  ordem: number
  /** AAAA-MM-DD */
  data: string
  avaliadorId: string
  contratoId: string | null
  status: StatusAvaliacao
  maturidadeGeral: MaturidadeGeral | null
  prontidao: Prontidao | null
  dimensoes: LinhaDimensao[]
  pontosFortes: string
  lacunasPrioritarias: string
  recomendacao: string
  /** Uso interno: nunca sai na Visão Executiva nem no PDF (DF-52). */
  observacoesInternas: string
}

export type AvaliacaoDetalhada = AvaliacaoMaturidade & { nomeAvaliador: string }

// Histórico de alterações (F17, DF-16): só leitura. Na Etapa 3, o banco grava sozinho (arquitetura 4.4).

export type TipoRegistro =
  | 'cliente'
  | 'avaliacao'
  | 'contrato'
  | 'escopo'
  | 'plano'
  | 'atividade'
  | 'especialista'
  | 'demanda'
  | 'documento'

export type RegistroAlteracao = {
  id: string
  tipo: TipoRegistro
  registroId: string
  /** ISO com fuso, por exemplo 2026-09-20T14:32:00-03:00 */
  dataHora: string
  usuarioId: string
  descricao: string
  valorAnterior?: string
  valorNovo?: string
  /** A justificativa da correção, da reabertura ou da criticidade (RN-22, CA-05.2). */
  justificativa?: string
}

/** Uma linha do histórico como a tela mostra, com o nome do usuário. */
export type EntradaHistorico = {
  id: string
  dataHora: string
  usuario: string
  descricao: string
  valorAnterior?: string
  valorNovo?: string
  /** A justificativa da correção, da reabertura ou da criticidade (RN-22, CA-05.2). */
  justificativa?: string
}

/** Item aberto que impede inativar o cliente (RN-18, CA-18.3). */
export type ItemQueImpede = { tipo: string; descricao: string; status: string; responsavel: string; href: string }

// Contrato ou proposta do cliente com o grande contratante (F03, F04, DF-66). Proposta e contrato são o mesmo
// registro, que evolui de status (DF-07). A vigência é calculada a cada consulta (RN-04).

export type StatusContrato = 'Proposta' | 'Em contratação' | 'Ativo' | 'Suspenso' | 'Encerrado' | 'Cancelado'

export type TipoVigencia = 'Prazo determinado' | 'Prazo indeterminado' | 'Renovação automática'

export type StatusVigencia = 'Vigente' | 'Próximo do vencimento' | 'Vencido' | 'Encerrado'

/** `diasRestantes`: null no Prazo indeterminado e no Encerrado; negativo depois do término. */
export type Vigencia = { status: StatusVigencia; diasRestantes: number | null }

export type Contrato = {
  id: string
  clienteId: string
  codigo: string
  contratante: string
  objeto: string
  servicos: string[]
  /** AAAA-MM-DD, como as outras datas do contrato. */
  dataProposta: string | null
  tipoVigencia: TipoVigencia
  inicio: string | null
  termino: string | null
  valor: number | null
  responsavelId: string
  status: StatusContrato
  observacoes: string
}

export type ContratoDetalhado = Contrato & { nomeCliente: string; nomeResponsavel: string; vigencia: Vigencia | null }

// Escopo Contratado e Jornada ELO (F05, F06). A etapa atual e o progresso são calculados (RN-08, DF-28).

export type StatusEscopo = 'Planejado' | 'Em andamento' | 'Em espera' | 'Concluído' | 'Cancelado'

export type EtapaJornada = 'Diagnosticar' | 'Estruturar' | 'Implementar' | 'Monitorar' | 'Evoluir'

export type StatusEtapa = 'Não iniciada' | 'Em andamento' | 'Concluída' | 'Não aplicável'

export type LinhaEtapa = {
  etapa: EtapaJornada
  status: StatusEtapa
  responsavelId: string | null
  inicio: string | null
  conclusao: string | null
  observacoes: string
}

export type Escopo = {
  id: string
  contratoId: string
  clienteId: string
  nome: string
  descricao: string
  responsavelId: string
  inicio: string | null
  conclusaoPrevista: string | null
  conclusaoEfetiva: string | null
  status: StatusEscopo
  prioridade: Prioridade
  criticidade: Criticidade
  justificativaCriticidade: string
  classificadoPorId: string
  /** AAAA-MM-DD: a primeira classificação e a última alteração da criticidade (F05, CA-05.2). */
  classificadoEm: string
  criticidadeAlteradaEm: string
  cicloAnteriorId: string | null
  observacoes: string
  /** As 5 etapas, na ordem de ETAPAS. */
  etapas: LinhaEtapa[]
  /** Os especialistas ligados ao escopo (UC-14, DF-32). O Inativo continua, sinalizado para troca (DF-51). */
  especialistaIds: string[]
}

/** A etapa com o nome do responsável; '' sem responsável. */
export type LinhaEtapaDetalhada = LinhaEtapa & { nomeResponsavel: string }

export type EscopoDetalhado = Omit<Escopo, 'etapas'> & {
  etapas: LinhaEtapaDetalhada[]
  nomeResponsavel: string
  codigoContrato: string
  statusContrato: StatusContrato
  nomeCliente: string
  nomeClassificadoPor: string
  etapaAtual: EtapaJornada | 'Não iniciada'
  progresso: { concluidas: number; aplicaveis: number }
  /** Contrato em Proposta ou Em contratação (DF-48). */
  planejamento: boolean
  /** Os ciclos do contrato recorrente (DF-46): o seguinte é o escopo que aponta para este como anterior. */
  cicloAnterior: { id: string; nome: string } | null
  cicloSeguinte: { id: string; nome: string } | null
  especialistas: EspecialistaLigado[]
}

// Planos de ação e atividades (F07, F08). O atraso e a proximidade do prazo são calculados (RN-09, RN-10).

export type StatusPlano = 'Aberto' | 'Em andamento' | 'Concluído' | 'Cancelado'

export type StatusAtividade = 'Não iniciada' | 'Em andamento' | 'Concluída' | 'Cancelada'

/** Indicador calculado, não é status (RN-09, RN-10). */
export type SituacaoPrazo = 'Atrasada' | 'Próxima do prazo'

export type Plano = {
  id: string
  escopoId: string
  /** Herdado do escopo (RN-02). */
  clienteId: string
  nome: string
  descricao: string
  responsavelId: string
  /** AAAA-MM-DD, como as outras datas do plano. */
  criadoEm: string
  prazo: string | null
  status: StatusPlano
  /** A avaliação de maturidade da qual o plano saiu, do mesmo cliente (DF-80). */
  avaliacaoId: string | null
  observacoes: string
}

export type Atividade = {
  id: string
  planoId: string
  /** Herdado do plano (RN-02). */
  clienteId: string
  nome: string
  descricao: string
  responsavelId: string
  /** Quem executa, quando não é o responsável: só o nome, sem acesso à plataforma (DF-71). '' sem executor. */
  executor: string
  criadaEm: string
  /** Obrigatório (DF-10). */
  prazo: string
  prioridade: Prioridade
  status: StatusAtividade
  /** Registrada ao concluir e apagada na reabertura (DF-43). */
  conclusao: string | null
  observacoes: string
}

/** O total, as concluídas e as atrasadas do plano (CA-07.2). */
export type ResumoAtividades = { total: number; concluidas: number; atrasadas: number }

export type AtividadeDetalhada = Atividade & {
  nomeResponsavel: string
  nomePlano: string
  statusPlano: StatusPlano
  escopoId: string
  nomeEscopo: string
  nomeCliente: string
  situacao: SituacaoPrazo | null
}

export type PlanoDetalhado = Plano & {
  nomeResponsavel: string
  nomeEscopo: string
  statusEscopo: StatusEscopo
  contratoId: string
  codigoContrato: string
  nomeCliente: string
  /** Contrato em Proposta ou Em contratação (DF-48, CA-05.9). */
  planejamento: boolean
  avaliacao: { id: string; data: string; status: StatusAvaliacao } | null
  /** O término do contrato que conta para a RN-21: null sem vigência ou em Prazo indeterminado. */
  terminoDoContrato: string | null
  resumo: ResumoAtividades
}

// Especialistas (F11). Todos os usuários logados leem (DF-02); só o Administrador cadastra e edita.

export type StatusEspecialista = 'Em análise' | 'Ativo' | 'Inativo'

export type OrigemEspecialista = 'Site' | 'Cadastro interno'

export type Especialista = {
  id: string
  nome: string
  /** AAAA-MM-DD; opcional (DF-27). */
  dataNascimento: string | null
  especialidade: string
  subespecialidade: string
  email: string
  telefone: string
  cidade: string
  uf: string
  empresa: string
  /** Link do currículo ou do LinkedIn, sem arquivo (DF-27). */
  curriculo: string
  origem: OrigemEspecialista
  status: StatusEspecialista
  /** Uso interno. */
  observacoes: string
  /** AAAA-MM-DD: a data da candidatura ou do cadastro. */
  cadastradoEm: string
}

/** O especialista com a marca da candidatura repetida (DF-50). */
export type EspecialistaDetalhado = Especialista & { emailRepetido: boolean }

/** O especialista como aparece ligado a um escopo ou a uma demanda. */
export type EspecialistaLigado = { id: string; nome: string; especialidade: string; status: StatusEspecialista }

// Demandas da Central ELO (F09). Registradas pela equipe da ELO, por qualquer canal; o cliente não acessa.

export type StatusDemanda = 'Nova' | 'Em triagem' | 'Em atendimento' | 'Aguardando retorno' | 'Resolvida' | 'Encerrada'

export type OrigemDemanda =
  | 'Cliente'
  | 'Interna'
  | 'Institucional'
  | 'Especialista'
  | 'Reunião'
  | 'E-mail'
  | 'Telefone/WhatsApp'
  | 'Outro'

export type Demanda = {
  /** ELO-AAAA-NNNN, sequencial por ano (DF-11). */
  numero: string
  /** AAAA-MM-DD */
  abertaEm: string
  clienteId: string
  /** Opcionais, do cliente (DF-12). */
  contratoId: string | null
  escopoId: string | null
  origem: OrigemDemanda
  assunto: string
  descricao: string
  /** Definidos na triagem. */
  categoria: string | null
  criticidade: Criticidade | null
  responsavelTriagemId: string
  responsavelAtendimentoId: string | null
  /** Com mais de um, um é o principal (DF-32). */
  especialistas: { id: string; principal: boolean }[]
  prazo: string | null
  status: StatusDemanda
  solucao: string
  /** O retorno dado ao cliente, para encerrar a Resolvida (RN-12, DF-29). */
  retornoCliente: string
  encerradaEm: string | null
  registradaPorId: string
}

export type DemandaDetalhada = Demanda & {
  nomeCliente: string
  codigoContrato: string | null
  nomeEscopo: string | null
  nomeTriagem: string
  nomeAtendimento: string
  nomeRegistradaPor: string
  especialistasLigados: (EspecialistaLigado & { principal: boolean })[]
  /** Prazo antes de hoje, sem estar Resolvida nem Encerrada (CA-09.5). */
  vencida: boolean
}

export type ComentarioDemanda = {
  id: string
  numero: string
  autorId: string
  /** ISO com fuso. */
  dataHora: string
  tipo: 'Comentário' | 'Contato com especialista'
  texto: string
  /** No contato com especialista: quem e quando (DF-30). */
  especialistaId: string | null
  dataContato: string | null
}

export type ComentarioDetalhado = ComentarioDemanda & { autor: string; nomeEspecialista: string }

// Documentos e evidências (F12). O acesso segue o cliente (RN-16); o Documento do Especialista sem cliente, o acesso a
// especialistas (DF-65). A inativação é um sinal à parte do status (RN-24).

export type StatusDocumento = 'Vigente' | 'Superado' | 'Encerrado'

/** O arquivo como foi recebido: o nome higienizado, o tipo informado e o tamanho em bytes. */
export type ArquivoDocumento = { nome: string; tipo: string; tamanho: number }

export type Documento = {
  id: string
  nome: string
  categoria: string
  /** Opcional só no Documento do Especialista (DF-65). */
  clienteId: string | null
  /** Obrigatório no Documento do Especialista. */
  especialistaId: string | null
  /** Os vínculos opcionais, todos do cliente do documento (RN-02). */
  contratoId: string | null
  escopoId: string | null
  etapa: EtapaJornada | null
  planoId: string | null
  atividadeId: string | null
  demandaNumero: string | null
  avaliacaoId: string | null
  /** AAAA-MM-DD */
  data: string
  incluidoEm: string
  incluidoPorId: string
  status: StatusDocumento
  /** Quando Superado (DF-13, RN-15). */
  substituidoPorId: string | null
  inativo: boolean
  observacoes: string
  arquivo: ArquivoDocumento
}

/** Um registro ligado ao documento, como a tela mostra, com o link. */
export type VinculoDocumento = { tipo: string; rotulo: string; href: string }

export type DocumentoDetalhado = Documento & {
  nomeCliente: string | null
  nomeEspecialista: string | null
  codigoContrato: string | null
  nomeEscopo: string | null
  nomePlano: string | null
  nomeAtividade: string | null
  assuntoDemanda: string | null
  dataAvaliacao: string | null
  nomeIncluidoPor: string
  substituidoPor: { id: string; nome: string } | null
  /** Os documentos que este substituiu. */
  substitui: { id: string; nome: string }[]
  /** O registro mais específico: atividade, plano, etapa, escopo, demanda, avaliação, contrato ou especialista. */
  vinculo: VinculoDocumento | null
}

// Visão Executiva do cliente (F14; arquitetura 3.5). Os tipos só têm o que pode ir para o cliente: nunca o valor do
// contrato, observações internas, comentários, justificativa da criticidade nem dados de especialistas (DF-52, CA-14.5).

export type CampoTexto = 'principaisResultados' | 'observacoesExecutivas' | 'proximosPassos'

/** Um dos três textos do cliente (DF-73, DF-82). Nunca escrito: texto vazio, sem data nem autor. */
export type TextoExecutivo = { campo: CampoTexto; titulo: string; texto: string; atualizadoEm: string | null; atualizadoPor: string }

export type EscopoDaVisao = {
  id: string
  nome: string
  codigoContrato: string
  contratante: string
  status: StatusEscopo
  prioridade: Prioridade
  criticidade: Criticidade
  /** Contrato em Proposta ou Em contratação (DF-48). */
  planejamento: boolean
  etapaAtual: EtapaJornada | 'Não iniciada'
  etapas: { etapa: EtapaJornada; status: StatusEtapa }[]
}

export type AtividadePendente = {
  id: string
  nome: string
  prazo: string
  responsavel: string
  /** Escrito para aparecer aqui (DF-71). */
  executor: string
  status: StatusAtividade
  situacao: SituacaoPrazo | null
}

export type PlanoDaVisao = {
  id: string
  nome: string
  escopo: string
  status: StatusPlano
  total: number
  concluidas: number
  atrasadas: number
  pendentes: AtividadePendente[]
}

export type DemandaDaVisao = {
  numero: string
  assunto: string
  criticidade: Criticidade | null
  prazo: string | null
  status: StatusDemanda
  vencida: boolean
}

/** Uma linha das entregas, dos próximos prazos e das pendências. */
export type ItemDaVisao = { id: string; tipo: 'Atividade' | 'Etapa' | 'Demanda' | 'Contrato'; descricao: string; data: string }

export type AvaliacaoDaVisao = {
  data: string
  maturidadeGeral: MaturidadeGeral | null
  prontidao: Prontidao | null
  dimensoes: { dimensao: string; nivel: NivelDimensao }[]
}

export type VisaoExecutiva = {
  cliente: { id: string; nome: string }
  /** O contrato do filtro (CA-14.6), ou null sem filtro. */
  contrato: { id: string; codigo: string } | null
  /** Os contratos do cliente, para o filtro. */
  contratos: { id: string; codigo: string; contratante: string }[]
  hoje: string
  /** A última atualização dos três textos (CA-14.3), ou null se nenhum foi escrito. */
  textosAtualizadosEm: string | null
  escopos: EscopoDaVisao[]
  planos: PlanoDaVisao[]
  demandas: { porStatus: { status: StatusDemanda; total: number }[]; abertas: DemandaDaVisao[] }
  entregas: ItemDaVisao[]
  proximosPrazos: ItemDaVisao[]
  pendencias: ItemDaVisao[]
  /** As dimensões vêm na ordem da comparação do cliente (a da atual; as que só a inicial tem, no fim). */
  maturidade: {
    inicial: AvaliacaoDaVisao
    atual: AvaliacaoDaVisao
    dimensoes: { dimensao: string; inicial: NivelDimensao; atual: NivelDimensao }[]
  } | null
  textos: TextoExecutivo[]
}
