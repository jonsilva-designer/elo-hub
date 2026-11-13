import type { Usuario, Vinculo } from '../tipos'

// Dados fictícios. As telas nunca importam esta pasta: leem tudo por `lib/dados` (regra do lint).
// A pasta `mock` é apagada na Etapa 3, quando entram os dados reais.
export const USUARIOS: Usuario[] = [
  {
    id: 'usr-helena',
    nome: 'Helena Prado',
    email: 'helena.prado@elogovernance.com.br',
    perfil: 'Administrador',
    status: 'Ativo',
  },
  {
    id: 'usr-rafael',
    nome: 'Rafael Souza',
    email: 'rafael.souza@elogovernance.com.br',
    perfil: 'Equipe',
    status: 'Ativo',
  },
  {
    id: 'usr-marcos',
    nome: 'Marcos Lima',
    email: 'marcos.lima@elogovernance.com.br',
    perfil: 'Equipe',
    status: 'Inativo',
  },
]

// O Administrador não precisa de vínculo: vê todos os clientes (RN-01).
export const VINCULOS: Vinculo[] = [
  { usuarioId: 'usr-rafael', clienteId: 'cli-vertice' },
  { usuarioId: 'usr-rafael', clienteId: 'cli-atlantica' },
  { usuarioId: 'usr-rafael', clienteId: 'cli-rede-norte' },
  { usuarioId: 'usr-marcos', clienteId: 'cli-montareal' },
]
