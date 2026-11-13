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
