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

export type TipoRegistro = 'cliente' | 'avaliacao' | 'contrato'

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
}

/** Uma linha do histórico como a tela mostra, com o nome do usuário. */
export type EntradaHistorico = {
  id: string
  dataHora: string
  usuario: string
  descricao: string
  valorAnterior?: string
  valorNovo?: string
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
}

export type EscopoDetalhado = Escopo & {
  nomeResponsavel: string
  codigoContrato: string
  nomeCliente: string
  etapaAtual: EtapaJornada | 'Não iniciada'
  progresso: { concluidas: number; aplicaveis: number }
  /** Contrato em Proposta ou Em contratação (DF-48). */
  planejamento: boolean
}
