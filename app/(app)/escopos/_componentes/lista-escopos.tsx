'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { BarraFiltros } from '@/components/elo/barra-filtros'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaCriticidade, EtiquetaPlanejamento, EtiquetaStatus, IndicadorPrioridade } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { SelecaoMultipla } from '@/components/elo/selecao-multipla'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { EscopoDetalhado, StatusEscopo } from '@/lib/dados/tipos'
import type { Criticidade, Prioridade } from '@/lib/design/status'
import {
  CHAVE_FILTROS_DOS_ESCOPOS,
  contratosDosEscopos,
  escreverFiltrosEscopos,
  ETAPAS_ATUAIS,
  filtrarEscopos,
  responsaveisDosEscopos,
  type EtapaAtual,
  type FiltrosEscopos,
} from '@/lib/escopos/filtros'
import { CRITICIDADES, PRIORIDADES, STATUS_ESCOPO } from '@/lib/escopos/regras'

const TODOS = 'todos'
const SEM_FILTRO: FiltrosEscopos = {
  busca: '',
  cliente: null,
  contrato: null,
  responsavel: null,
  status: [],
  criticidade: [],
  prioridade: [],
  etapa: [],
}
const comoOpcoes = (lista: readonly string[]) => lista.map((s) => ({ valor: s, rotulo: s }))

// Larguras fixas: a busca e os filtros não mexem no tamanho das colunas. As sem largura dividem o resto.
const COLUNAS: Coluna<EscopoDetalhado>[] = [
  {
    id: 'escopo',
    titulo: 'Escopo',
    largura: 'w-1/4',
    ordenarPor: (e) => e.nome,
    celula: (e) => (
      <span className="flex min-w-0 flex-col items-start gap-1">
        <span data-slot="nome-escopo" className="font-medium text-foreground">
          {e.nome}
        </span>
        <span className="flex flex-wrap items-center gap-2">
          <Num className="text-xs text-muted-foreground">{e.codigoContrato}</Num>
          {e.planejamento ? <EtiquetaPlanejamento /> : null}
        </span>
      </span>
    ),
  },
  { id: 'cliente', titulo: 'Cliente', largura: 'w-1/8', ordenarPor: (e) => e.nomeCliente, celula: (e) => e.nomeCliente },
  {
    id: 'status',
    titulo: 'Status',
    largura: 'w-1/8',
    ordenarPor: (e) => e.status,
    celula: (e) => <EtiquetaStatus status={e.status} />,
  },
  {
    id: 'criticidade',
    titulo: 'Criticidade',
    ordenarPor: (e) => CRITICIDADES.indexOf(e.criticidade),
    celula: (e) => <EtiquetaCriticidade criticidade={e.criticidade} />,
  },
  {
    id: 'prioridade',
    titulo: 'Prioridade',
    ordenarPor: (e) => PRIORIDADES.indexOf(e.prioridade),
    celula: (e) => <IndicadorPrioridade prioridade={e.prioridade} />,
  },
  {
    id: 'etapa',
    titulo: 'Etapa atual',
    largura: 'w-1/5',
    celula: (e) => (
      <span>
        {e.etapaAtual}
        <span aria-hidden="true"> · </span>
        <Num>{e.progresso.concluidas}</Num> de <Num>{e.progresso.aplicaveis}</Num>
      </span>
    ),
  },
  { id: 'responsavel', titulo: 'Responsável', ordenarPor: (e) => e.nomeResponsavel, celula: (e) => e.nomeResponsavel },
]

/** Grava no navegador sem quebrar a tela quando ele recusa (aba anônima, dados bloqueados). */
function guardar(texto: string) {
  try {
    sessionStorage.setItem(CHAVE_FILTROS_DOS_ESCOPOS, texto)
  } catch {
    // Sem armazenamento, a volta só não recupera os filtros.
  }
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
  opcoes: { valor: string; rotulo: ReactNode }[]
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
 * Lista de escopos (parte 3, 5.7; F05). Sem Novo escopo, que nasce na página do contrato, e sem Exportar. Filtra no
 * navegador; a cada mudança, os filtros vão para o endereço e ficam guardados para o caminho de volta (CA-16.2).
 */
export function ListaEscopos({
  escopos,
  clientes,
  filtrosIniciais,
  semVinculo,
}: {
  escopos: EscopoDetalhado[]
  clientes: { valor: string; rotulo: string }[]
  filtrosIniciais: FiltrosEscopos
  semVinculo: boolean
}) {
  const router = useRouter()
  const [filtros, setFiltros] = useState(filtrosIniciais)
  const linhas = useMemo(() => filtrarEscopos(escopos, filtros), [escopos, filtros])
  const contratos = useMemo(() => contratosDosEscopos(escopos), [escopos])
  const responsaveis = useMemo(() => responsaveisDosEscopos(escopos), [escopos])

  // O filtro Contrato mostra só os contratos do cliente escolhido. Sem cliente, o nome dele separa os códigos
  // repetidos, que são únicos só dentro do cliente.
  const opcoesDeContrato = contratos
    .filter((c) => !filtros.cliente || c.clienteId === filtros.cliente)
    .map((c) => ({
      valor: c.valor,
      rotulo: filtros.cliente ? (
        <Num>{c.codigo}</Num>
      ) : (
        <>
          <Num>{c.codigo}</Num>
          <span aria-hidden="true"> · </span>
          {c.nomeCliente}
        </>
      ),
    }))

  // Quem chega pelo endereço com filtros também tem a volta garantida.
  useEffect(() => guardar(escreverFiltrosEscopos(filtrosIniciais)), [filtrosIniciais])

  function mudar(novos: FiltrosEscopos) {
    setFiltros(novos)
    const q = escreverFiltrosEscopos(novos)
    window.history.replaceState(null, '', q ? `/escopos?${q}` : '/escopos')
    guardar(q)
  }

  /** Trocar o cliente limpa o contrato que não é dele. */
  function mudarCliente(cliente: string | null) {
    const doCliente = !cliente || contratos.find((c) => c.valor === filtros.contrato)?.clienteId === cliente
    mudar({ ...filtros, cliente, contrato: doCliente ? filtros.contrato : null })
  }

  // Sem nenhum escopo para ver, limpar os filtros não traz nada: o aviso diz que não há escopo.
  const vazio = semVinculo ? (
    <EstadoVazio titulo="Você ainda não tem clientes vinculados." descricao="Fale com o Administrador da ELO." />
  ) : escopos.length === 0 ? (
    <EstadoVazio titulo="Nenhum escopo cadastrado." />
  ) : (
    <EstadoVazio
      titulo="Nenhum escopo com esses filtros."
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
        titulo="Escopos"
        contexto={
          <>
            <Num>{linhas.length}</Num> {linhas.length === 1 ? 'escopo' : 'escopos'}
          </>
        }
      />
      <div className="space-y-4">
        <BarraFiltros
          busca={filtros.busca}
          aoBuscar={(busca) => mudar({ ...filtros, busca })}
          filtros={
            <>
              <FiltroUnico
                rotulo="Cliente"
                todos="Todos os clientes"
                valor={filtros.cliente}
                opcoes={clientes}
                aoMudar={mudarCliente}
              />
              <FiltroUnico
                rotulo="Contrato"
                todos="Todos os contratos"
                valor={filtros.contrato}
                opcoes={opcoesDeContrato}
                aoMudar={(contrato) => mudar({ ...filtros, contrato })}
              />
              <FiltroUnico
                rotulo="Responsável"
                todos="Todos os responsáveis"
                valor={filtros.responsavel}
                opcoes={responsaveis}
                aoMudar={(responsavel) => mudar({ ...filtros, responsavel })}
              />
              <div className="w-full sm:w-48">
                <SelecaoMultipla
                  aria-label="Status"
                  opcoes={comoOpcoes(STATUS_ESCOPO)}
                  valores={filtros.status}
                  onChange={(status) => mudar({ ...filtros, status: status as StatusEscopo[] })}
                  placeholder="Todos os status"
                />
              </div>
              <div className="w-full sm:w-48">
                <SelecaoMultipla
                  aria-label="Criticidade"
                  opcoes={comoOpcoes(CRITICIDADES)}
                  valores={filtros.criticidade}
                  onChange={(criticidade) => mudar({ ...filtros, criticidade: criticidade as Criticidade[] })}
                  placeholder="Todas as criticidades"
                />
              </div>
              <div className="w-full sm:w-48">
                <SelecaoMultipla
                  aria-label="Prioridade"
                  opcoes={comoOpcoes(PRIORIDADES)}
                  valores={filtros.prioridade}
                  onChange={(prioridade) => mudar({ ...filtros, prioridade: prioridade as Prioridade[] })}
                  placeholder="Todas as prioridades"
                />
              </div>
              <div className="w-full sm:w-48">
                <SelecaoMultipla
                  aria-label="Etapa atual"
                  opcoes={comoOpcoes(ETAPAS_ATUAIS)}
                  valores={filtros.etapa}
                  onChange={(etapa) => mudar({ ...filtros, etapa: etapa as EtapaAtual[] })}
                  placeholder="Todas as etapas"
                />
              </div>
            </>
          }
        />
        <Painel titulo="Lista de escopos" semRespiro>
          <TabelaDados
            colunas={COLUNAS}
            linhas={linhas}
            chave={(e) => e.id}
            aoClicarLinha={(e) => router.push(`/escopos/${e.id}`)}
            vazio={vazio}
          />
        </Painel>
      </div>
    </>
  )
}
