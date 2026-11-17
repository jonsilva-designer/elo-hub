'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { BarraFiltros } from '@/components/elo/barra-filtros'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaSinal, EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { SelecaoMultipla } from '@/components/elo/selecao-multipla'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { EspecialistaDetalhado, OrigemEspecialista, StatusEspecialista } from '@/lib/dados/tipos'
import {
  CHAVE_FILTROS_DOS_ESPECIALISTAS,
  escreverFiltrosEspecialistas,
  filtrarEspecialistas,
  type FiltrosEspecialistas,
} from '@/lib/especialistas/filtros'
import { ORIGENS_ESPECIALISTA, STATUS_ESPECIALISTA } from '@/lib/especialistas/regras'

const TODOS = 'todos'
const SEM_FILTRO: FiltrosEspecialistas = { busca: '', status: [], especialidade: null, origem: null }

const COLUNAS: Coluna<EspecialistaDetalhado>[] = [
  {
    id: 'nome',
    titulo: 'Nome',
    largura: 'w-1/4',
    ordenarPor: (e) => e.nome,
    celula: (e) => (
      <span className="flex min-w-0 flex-col items-start gap-1">
        <span className="font-medium text-foreground">{e.nome}</span>
        {e.emailRepetido ? <EtiquetaSinal texto="E-mail já cadastrado" tom="atencao" /> : null}
      </span>
    ),
  },
  {
    id: 'especialidade',
    titulo: 'Especialidade',
    largura: 'w-1/3',
    ordenarPor: (e) => e.especialidade,
    celula: (e) => (
      <span className="flex min-w-0 flex-col gap-0.5">
        <span>{e.especialidade}</span>
        {e.subespecialidade ? <span className="text-xs text-muted-foreground">{e.subespecialidade}</span> : null}
      </span>
    ),
  },
  {
    id: 'cidade',
    titulo: 'Cidade/UF',
    ordenarPor: (e) => e.cidade,
    celula: (e) =>
      e.cidade ? `${e.cidade}${e.uf ? `/${e.uf}` : ''}` : <span className="text-muted-foreground">Não informada</span>,
  },
  { id: 'origem', titulo: 'Origem', ordenarPor: (e) => e.origem, celula: (e) => e.origem },
  { id: 'status', titulo: 'Status', ordenarPor: (e) => e.status, celula: (e) => <EtiquetaStatus status={e.status} /> },
]

/** Grava no navegador sem quebrar a tela quando ele recusa (aba anônima, dados bloqueados). */
function guardar(texto: string) {
  try {
    sessionStorage.setItem(CHAVE_FILTROS_DOS_ESPECIALISTAS, texto)
  } catch {
    // Sem armazenamento, a volta só não recupera os filtros.
  }
}

/**
 * Lista de especialistas (parte 5, 5.4; F11). Todos os usuários consultam (DF-02); só o Administrador cadastra. O
 * filtro de origem acha as candidaturas do site, e as Em análise ficam no topo. Filtra no navegador; a cada mudança,
 * os filtros vão para o endereço e ficam guardados para o caminho de volta (CA-16.2).
 */
export function ListaEspecialistas({
  especialistas,
  especialidades,
  filtrosIniciais,
  ehAdmin,
}: {
  especialistas: EspecialistaDetalhado[]
  especialidades: string[]
  filtrosIniciais: FiltrosEspecialistas
  ehAdmin: boolean
}) {
  const router = useRouter()
  const [filtros, setFiltros] = useState(filtrosIniciais)
  const linhas = useMemo(() => filtrarEspecialistas(especialistas, filtros), [especialistas, filtros])

  // Quem chega pelo endereço com filtros também tem a volta garantida.
  useEffect(() => guardar(escreverFiltrosEspecialistas(filtrosIniciais)), [filtrosIniciais])

  function mudar(novos: FiltrosEspecialistas) {
    setFiltros(novos)
    const q = escreverFiltrosEspecialistas(novos)
    window.history.replaceState(null, '', q ? `/especialistas?${q}` : '/especialistas')
    guardar(q)
  }

  const vazio =
    especialistas.length === 0 ? (
      <EstadoVazio titulo="Nenhum especialista cadastrado." />
    ) : (
      <EstadoVazio
        titulo="Nenhum especialista com esses filtros."
        acao={
          <Button type="button" variant="outline" onClick={() => mudar(SEM_FILTRO)}>
            Limpar filtros
          </Button>
        }
      />
    )

  return (
    <>
      <CabecalhoPagina
        titulo="Especialistas"
        contexto={
          <>
            <Num>{linhas.length}</Num> {linhas.length === 1 ? 'especialista' : 'especialistas'}
          </>
        }
        acoes={
          ehAdmin ? (
            <Button asChild>
              <Link href="/especialistas/novo">
                <Plus aria-hidden="true" />
                Novo especialista
              </Link>
            </Button>
          ) : null
        }
      />
      <div className="space-y-4">
        <BarraFiltros
          busca={filtros.busca}
          aoBuscar={(busca) => mudar({ ...filtros, busca })}
          filtros={
            <>
              <div className="w-full sm:w-48">
                <SelecaoMultipla
                  aria-label="Status"
                  opcoes={STATUS_ESPECIALISTA.map((s) => ({ valor: s, rotulo: s }))}
                  valores={filtros.status}
                  onChange={(status) => mudar({ ...filtros, status: status as StatusEspecialista[] })}
                  placeholder="Em análise e Ativo"
                />
              </div>
              <Select
                value={filtros.especialidade ?? TODOS}
                onValueChange={(v) => mudar({ ...filtros, especialidade: v === TODOS ? null : v })}
              >
                <SelectTrigger aria-label="Especialidade" className="w-full sm:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todas as especialidades</SelectItem>
                  {especialidades.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filtros.origem ?? TODOS}
                onValueChange={(v) => mudar({ ...filtros, origem: v === TODOS ? null : (v as OrigemEspecialista) })}
              >
                <SelectTrigger aria-label="Origem" className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todas as origens</SelectItem>
                  {ORIGENS_ESPECIALISTA.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          }
        />
        <Painel titulo="Lista de especialistas" semRespiro>
          <TabelaDados
            colunas={COLUNAS}
            linhas={linhas}
            chave={(e) => e.id}
            aoClicarLinha={(e) => router.push(`/especialistas/${e.id}`)}
            vazio={vazio}
          />
        </Painel>
      </div>
    </>
  )
}
