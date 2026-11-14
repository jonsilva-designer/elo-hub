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

export type TipoRegistro = 'cliente' | 'avaliacao'

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
