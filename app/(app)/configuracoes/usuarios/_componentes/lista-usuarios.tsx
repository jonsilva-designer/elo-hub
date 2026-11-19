'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { BarraFiltros } from '@/components/elo/barra-filtros'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { SelecaoMultipla } from '@/components/elo/selecao-multipla'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { TextoComDetalhe } from '@/components/elo/textos'
import { Button } from '@/components/ui/button'
import type { StatusUsuario } from '@/lib/dados/tipos'
import type { UsuarioDetalhado } from '@/lib/dados/usuarios-configuracao'
import { filtrarUsuarios, STATUS_USUARIO, type FiltrosUsuarios } from '@/lib/usuarios/filtros'

const COLUNAS: Coluna<UsuarioDetalhado>[] = [
  {
    id: 'nome',
    titulo: 'Usuário',
    largura: 'w-1/3',
    ordenarPor: (u) => u.nome,
    celula: (u) => (
      <TextoComDetalhe texto={u.nome} detalhes={[u.email]} />
    ),
  },
  { id: 'perfil', titulo: 'Perfil', ordenarPor: (u) => u.perfil, celula: (u) => u.perfil },
  {
    id: 'clientes',
    titulo: 'Clientes',
    ordenarPor: (u) => (u.perfil === 'Administrador' ? Number.MAX_SAFE_INTEGER : u.clientes.length),
    // O Administrador não tem vínculo: vê todos os clientes (RN-01).
    celula: (u) =>
      u.perfil === 'Administrador' ? (
        'Todos os clientes'
      ) : (
        <>
          <Num>{u.clientes.length}</Num> {u.clientes.length === 1 ? 'cliente' : 'clientes'}
        </>
      ),
  },
  { id: 'status', titulo: 'Status', ordenarPor: (u) => u.status, celula: (u) => <EtiquetaStatus status={u.status} /> },
]

/** A lista de usuários (parte 8, 4.1), com a busca e o filtro de status; os inativos só com o filtro (CA-18.2). */
export function ListaUsuarios({ usuarios }: { usuarios: UsuarioDetalhado[] }) {
  const router = useRouter()
  const [filtros, setFiltros] = useState<FiltrosUsuarios>({ busca: '', status: [] })
  const linhas = useMemo(() => filtrarUsuarios(usuarios, filtros), [usuarios, filtros])
  return (
    <div className="space-y-4">
      <BarraFiltros
        busca={filtros.busca}
        aoBuscar={(busca) => setFiltros({ ...filtros, busca })}
        filtros={
          <div className="w-full sm:w-48">
            <SelecaoMultipla
              aria-label="Status"
              opcoes={STATUS_USUARIO.map((s) => ({ valor: s, rotulo: s }))}
              valores={filtros.status}
              onChange={(status) => setFiltros({ ...filtros, status: status as StatusUsuario[] })}
              placeholder="Ativos"
            />
          </div>
        }
      />
      <Painel
        titulo="Usuários"
        acao={
          <Button asChild>
            <Link href="/configuracoes/usuarios/novo">
              <Plus aria-hidden="true" />
              Novo usuário
            </Link>
          </Button>
        }
        semRespiro
      >
        <TabelaDados
          colunas={COLUNAS}
          linhas={linhas}
          chave={(u) => u.id}
          aoClicarLinha={(u) => router.push(`/configuracoes/usuarios/${u.id}`)}
          vazio={<EstadoVazio titulo="Nenhum usuário com esses filtros." />}
        />
      </Painel>
    </div>
  )
}
