'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { BarraFiltros } from '@/components/elo/barra-filtros'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Campo } from '@/components/elo/campo'
import { CampoData } from '@/components/elo/campo-data'
import { EstadoVazio } from '@/components/elo/estados'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { SelecaoMultipla } from '@/components/elo/selecao-multipla'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { DemandaDetalhada, StatusDemanda } from '@/lib/dados/tipos'
import type { Criticidade } from '@/lib/design/status'
import {
  CHAVE_FILTROS_DAS_DEMANDAS,
  escreverFiltrosDemandas,
  filtrarDemandas,
  type FiltrosDemandas,
  type opcoesDasDemandas,
} from '@/lib/demandas/filtros'
import { STATUS_DEMANDA } from '@/lib/demandas/regras'
import { CRITICIDADES } from '@/lib/escopos/regras'
import { TabelaDemandas } from './tabela-demandas'

const TODOS = 'todos'
const SEM_FILTRO: FiltrosDemandas = {
  busca: '',
  cliente: null,
  contrato: null,
  escopo: null,
  responsavel: null,
  status: [],
  criticidade: [],
  de: null,
  ate: null,
}

/** Grava no navegador sem quebrar a tela quando ele recusa (aba anônima, dados bloqueados). */
function guardar(texto: string) {
  try {
    sessionStorage.setItem(CHAVE_FILTROS_DAS_DEMANDAS, texto)
  } catch {
    // Sem armazenamento, a volta só não recupera os filtros.
  }
}

/** Baixa o arquivo da rota de exportação. Não é uma página: a navegação do Next não serve aqui. */
function baixar(endereco: string) {
  const link = document.createElement('a')
  link.href = endereco
  link.download = ''
  link.click()
}

/** Seleção única de um filtro, com o item "Todos …" que limpa a escolha. */
function FiltroUnico({
  rotulo,
  todos,
  valor,
  opcoes,
  aoMudar,
}: {
  rotulo: string
  todos: string
  valor: string | null
  opcoes: { valor: string; rotulo: string }[]
  aoMudar: (valor: string | null) => void
}) {
  return (
    <Select value={valor ?? TODOS} onValueChange={(v) => aoMudar(v === TODOS ? null : v)}>
      <SelectTrigger aria-label={rotulo} className="w-full sm:w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TODOS}>{todos}</SelectItem>
        {opcoes.map((o) => (
          <SelectItem key={o.valor} value={o.valor}>
            {o.rotulo}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * Fila de demandas da Central ELO (parte 5, 5.8; F09, CA-09.7). As demandas chegam já recortadas pelo vínculo
 * (RN-01). Filtra no navegador; a cada mudança, os filtros vão para o endereço e ficam guardados para a volta
 * (CA-16.2). Nova demanda para os dois perfis; Exportar só para o Administrador (CA-16.3).
 */
export function FilaDemandas({
  demandas,
  opcoes,
  filtrosIniciais,
  ehAdmin,
  semVinculo,
}: {
  demandas: DemandaDetalhada[]
  opcoes: ReturnType<typeof opcoesDasDemandas>
  filtrosIniciais: FiltrosDemandas
  ehAdmin: boolean
  semVinculo: boolean
}) {
  const [filtros, setFiltros] = useState(filtrosIniciais)
  const linhas = useMemo(() => filtrarDemandas(demandas, filtros), [demandas, filtros])
  const texto = escreverFiltrosDemandas(filtros)

  // Quem chega pelo endereço com filtros também tem a volta garantida.
  useEffect(() => guardar(escreverFiltrosDemandas(filtrosIniciais)), [filtrosIniciais])

  function mudar(novos: FiltrosDemandas) {
    setFiltros(novos)
    const q = escreverFiltrosDemandas(novos)
    window.history.replaceState(null, '', q ? `/central?${q}` : '/central')
    guardar(q)
  }

  /** Trocar o cliente limpa o contrato e o escopo que não são dele; trocar o contrato, o escopo de outro contrato. */
  function mudarCliente(cliente: string | null) {
    const contrato = opcoes.contratos.find((c) => c.valor === filtros.contrato)
    const escopo = opcoes.escopos.find((e) => e.valor === filtros.escopo)
    mudar({
      ...filtros,
      cliente,
      contrato: !cliente || contrato?.clienteId === cliente ? filtros.contrato : null,
      escopo: !cliente || escopo?.clienteId === cliente ? filtros.escopo : null,
    })
  }

  function mudarContrato(contrato: string | null) {
    const escopo = opcoes.escopos.find((e) => e.valor === filtros.escopo)
    mudar({ ...filtros, contrato, escopo: !contrato || escopo?.contratoId === contrato ? filtros.escopo : null })
  }

  const contratos = opcoes.contratos.filter((c) => !filtros.cliente || c.clienteId === filtros.cliente)
  const escopos = opcoes.escopos.filter(
    (e) => (!filtros.cliente || e.clienteId === filtros.cliente) && (!filtros.contrato || e.contratoId === filtros.contrato),
  )

  const vazio = semVinculo ? (
    <EstadoVazio titulo="Você ainda não tem clientes vinculados." descricao="Fale com o Administrador da ELO." />
  ) : demandas.length === 0 ? (
    <EstadoVazio titulo="Nenhuma demanda registrada." />
  ) : (
    <EstadoVazio
      titulo="Nenhuma demanda com esses filtros."
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
        titulo="Central ELO"
        contexto={
          <>
            <Num>{linhas.length}</Num> {linhas.length === 1 ? 'demanda' : 'demandas'}
          </>
        }
        acoes={
          <Button asChild>
            <Link href="/central/nova">
              <Plus aria-hidden="true" />
              Nova demanda
            </Link>
          </Button>
        }
      />
      <div className="space-y-4">
        <BarraFiltros
          busca={filtros.busca}
          aoBuscar={(busca) => mudar({ ...filtros, busca })}
          aoExportar={ehAdmin ? () => baixar(`/api/exportar/demandas${texto ? `?${texto}` : ''}`) : undefined}
          filtros={
            <>
              <FiltroUnico rotulo="Cliente" todos="Todos os clientes" valor={filtros.cliente} opcoes={opcoes.clientes} aoMudar={mudarCliente} />
              <FiltroUnico rotulo="Contrato" todos="Todos os contratos" valor={filtros.contrato} opcoes={contratos} aoMudar={mudarContrato} />
              <FiltroUnico
                rotulo="Escopo"
                todos="Todos os escopos"
                valor={filtros.escopo}
                opcoes={escopos}
                aoMudar={(escopo) => mudar({ ...filtros, escopo })}
              />
              <FiltroUnico
                rotulo="Responsável"
                todos="Todos os responsáveis"
                valor={filtros.responsavel}
                opcoes={opcoes.responsaveis}
                aoMudar={(responsavel) => mudar({ ...filtros, responsavel })}
              />
              <div className="w-full sm:w-48">
                <SelecaoMultipla
                  aria-label="Status"
                  opcoes={STATUS_DEMANDA.map((s) => ({ valor: s, rotulo: s }))}
                  valores={filtros.status}
                  onChange={(status) => mudar({ ...filtros, status: status as StatusDemanda[] })}
                  placeholder="Todos os status"
                />
              </div>
              <div className="w-full sm:w-48">
                <SelecaoMultipla
                  aria-label="Criticidade"
                  opcoes={CRITICIDADES.map((c) => ({ valor: c, rotulo: c }))}
                  valores={filtros.criticidade}
                  onChange={(criticidade) => mudar({ ...filtros, criticidade: criticidade as Criticidade[] })}
                  placeholder="Todas as criticidades"
                />
              </div>
              <div className="w-full sm:w-40">
                <Campo rotulo="Aberta de">
                  {(p) => <CampoData {...p} valor={filtros.de} onChange={(de) => mudar({ ...filtros, de })} />}
                </Campo>
              </div>
              <div className="w-full sm:w-40">
                <Campo rotulo="Até">
                  {(p) => <CampoData {...p} valor={filtros.ate} onChange={(ate) => mudar({ ...filtros, ate })} />}
                </Campo>
              </div>
            </>
          }
        />
        <Painel titulo="Fila de demandas" semRespiro>
          <TabelaDemandas demandas={linhas} daFila vazio={vazio} />
        </Painel>
      </div>
    </>
  )
}
