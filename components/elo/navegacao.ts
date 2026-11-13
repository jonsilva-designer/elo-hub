import {
  FileText,
  Folder,
  House,
  Inbox,
  Layers,
  Settings,
  SquareCheck,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { Perfil } from '@/lib/dados/tipos'

export type ItemMenu = {
  rotulo: string
  href: string
  icone: LucideIcon
  grupo: 'Carteira' | 'Apoio' | null
  somenteAdmin?: boolean
}

export const ITENS_MENU: ItemMenu[] = [
  { rotulo: 'Início', href: '/inicio', icone: House, grupo: null },
  { rotulo: 'Minhas atividades', href: '/minhas-atividades', icone: SquareCheck, grupo: null },
  { rotulo: 'Clientes', href: '/clientes', icone: Users, grupo: 'Carteira' },
  { rotulo: 'Contratos', href: '/contratos', icone: FileText, grupo: 'Carteira' },
  { rotulo: 'Escopos', href: '/escopos', icone: Layers, grupo: 'Carteira' },
  { rotulo: 'Central ELO', href: '/central', icone: Inbox, grupo: 'Carteira' },
  { rotulo: 'Especialistas', href: '/especialistas', icone: UserRound, grupo: 'Apoio' },
  { rotulo: 'Documentos', href: '/documentos', icone: Folder, grupo: 'Apoio' },
  {
    rotulo: 'Configurações',
    href: '/configuracoes/usuarios',
    icone: Settings,
    grupo: 'Apoio',
    somenteAdmin: true,
  },
]

/** Ativo na rota exata ou em qualquer subrota. Todo `/configuracoes/*` ativa Configurações. */
export function itemAtivo(pathname: string, href: string): boolean {
  const base = href.startsWith('/configuracoes') ? '/configuracoes' : href
  return pathname === base || pathname.startsWith(`${base}/`)
}

/** Sem perfil (`null`, enquanto o usuário não chegou), só os itens comuns aos dois perfis. */
export function itensDoPerfil(perfil: Perfil | null): typeof ITENS_MENU {
  return ITENS_MENU.filter((i) => !i.somenteAdmin || perfil === 'Administrador')
}
