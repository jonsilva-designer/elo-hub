'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { BarraFiltros } from '@/components/elo/barra-filtros'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaPlanejamento, EtiquetaStatus } from '@/components/elo/etiquetas'
import { IndicadorVigencia } from '@/components/elo/indicador-vigencia'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { SelecaoMultipla } from '@/components/elo/selecao-multipla'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  CHAVE_FILTROS_DOS_CONTRATOS,
  escreverFiltrosContratos,
  filtrarContratos,
  type FiltrosContratos,
} from '@/lib/contratos/filtros'
import { ehPlanejamento, STATUS_CONTRATO } from '@/lib/contratos/regras'
import { destaqueDaVigencia } from '@/lib/contratos/vigencia'
import type { ContratoDetalhado, StatusContrato, StatusVigencia } from '@/lib/dados/tipos'

const TODOS = 'todos'
const SEM_FILTRO: FiltrosContratos = { busca: '', cliente: null, contratante: null, servico: null, status: [], vigencia: [] }
const OPCOES_DE_STATUS = STATUS_CONTRATO.map((s) => ({ valor: s, rotulo: s }))
const OPCOES_DE_VIGENCIA = (['Vigente', 'Próximo do vencimento', 'Vencido', 'Encerrado'] as const).map((s) => ({
  valor: s,
  rotulo: s,
}))

// Larguras fixas: a busca e os filtros não mexem no tamanho das colunas. O Responsável fica com o resto.
const COLUNAS: Coluna<ContratoDetalhado>[] = [
  {
    id: 'contrato',
    titulo: 'Contrato',
    largura: 'w-1/4',
    ordenarPor: (c) => c.codigo,
    celula: (c) => (
      <span className="flex min-w-0 flex-col items-start gap-1">
        <Num className="font-medium text-foreground">{c.codigo}</Num>
        <span className="text-xs text-muted-foreground">{c.objeto}</span>
        {ehPlanejamento(c.status) ? <EtiquetaPlanejamento /> : null}
      </span>
    ),
  },
  { id: 'cliente', titulo: 'Cliente', largura: 'w-1/6', ordenarPor: (c) => c.nomeCliente, celula: (c) => c.nomeCliente },
  { id: 'contratante', titulo: 'Contratante', largura: 'w-1/8', ordenarPor: (c) => c.contratante, celula: (c) => c.contratante },
  {
    id: 'status',
    titulo: 'Status',
    largura: 'w-1/8',
    ordenarPor: (c) => c.status,
    celula: (c) => <EtiquetaStatus status={c.status} />,
  },
  {
    id: 'vigencia',
    titulo: 'Vigência',
    largura: 'w-1/5',
    ordenarPor: (c) => c.termino,
    celula: (c) => <IndicadorVigencia vigencia={c.vigencia} termino={c.termino} tipoVigencia={c.tipoVigencia} />,
  },
  { id: 'responsavel', titulo: 'Responsável', ordenarPor: (c) => c.nomeResponsavel, celula: (c) => c.nomeResponsavel },
]


/** Grava no navegador sem quebrar a tela quando ele recusa (aba anônima, dados bloqueados). */
function guardar(texto: string) {
  try {
    sessionStorage.setItem(CHAVE_FILTROS_DOS_CONTRATOS, texto)
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

const comoOpcoes = (lista: string[]) => lista.map((s) => ({ valor: s, rotulo: s }))

/**
 * Lista de contratos (F03, F04, F16). Filtra no navegador; a cada mudança, os filtros vão para o endereço
 * (sem ir ao servidor) e ficam guardados para o caminho de volta da página do contrato (CA-16.2).
 */
export function ListaContratos({
  contratos,
  clientes,
  contratantes,
  servicos,
  filtrosIniciais,
  ehAdmin,
}: {
  contratos: ContratoDetalhado[]
  clientes: { valor: string; rotulo: string }[]
  contratantes: string[]
  servicos: string[]
  filtrosIniciais: FiltrosContratos
  ehAdmin: boolean
}) {
  const router = useRouter()
  const [filtros, setFiltros] = useState(filtrosIniciais)
  const linhas = useMemo(() => filtrarContratos(contratos, filtros), [contratos, filtros])
  const texto = escreverFiltrosContratos(filtros)

  // Quem chega pelo endereço com filtros também tem a volta garantida.
  useEffect(() => guardar(escreverFiltrosContratos(filtrosIniciais)), [filtrosIniciais])

  function mudar(novos: FiltrosContratos) {
    setFiltros(novos)
    const q = escreverFiltrosContratos(novos)
    window.history.replaceState(null, '', q ? `/contratos?${q}` : '/contratos')
    guardar(q)
  }

  const semVinculo = clientes.length === 0 && !ehAdmin
  const vazio = semVinculo ? (
    <EstadoVazio titulo="Você ainda não tem clientes vinculados." descricao="Fale com o Administrador da ELO." />
  ) : (
    <EstadoVazio
      titulo="Nenhum contrato com esses filtros."
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
        titulo="Contratos"
        contexto={
          <>
            <Num>{linhas.length}</Num> {linhas.length === 1 ? 'contrato' : 'contratos'}
          </>
        }
        acoes={
          ehAdmin ? (
            <Button asChild>
              <Link href="/contratos/novo">
                <Plus aria-hidden="true" />
                Novo contrato
              </Link>
            </Button>
          ) : null
        }
      />
      <div className="space-y-4">
        <BarraFiltros
          busca={filtros.busca}
          aoBuscar={(busca) => mudar({ ...filtros, busca })}
          aoExportar={ehAdmin ? () => baixar(`/api/exportar/contratos${texto ? `?${texto}` : ''}`) : undefined}
          filtros={
            <>
              <FiltroUnico
                rotulo="Cliente"
                todos="Todos os clientes"
                valor={filtros.cliente}
                opcoes={clientes}
                aoMudar={(cliente) => mudar({ ...filtros, cliente })}
              />
              <FiltroUnico
                rotulo="Contratante"
                todos="Todos os contratantes"
                valor={filtros.contratante}
                opcoes={comoOpcoes(contratantes)}
                aoMudar={(contratante) => mudar({ ...filtros, contratante })}
              />
              <FiltroUnico
                rotulo="Serviço"
                todos="Todos os serviços"
                valor={filtros.servico}
                opcoes={comoOpcoes(servicos)}
                aoMudar={(servico) => mudar({ ...filtros, servico })}
              />
              <div className="w-full sm:w-48">
                <SelecaoMultipla
                  aria-label="Status"
                  opcoes={OPCOES_DE_STATUS}
                  valores={filtros.status}
                  onChange={(status) => mudar({ ...filtros, status: status as StatusContrato[] })}
                  placeholder="Todos os status"
                />
              </div>
              <div className="w-full sm:w-48">
                <SelecaoMultipla
                  aria-label="Vigência"
                  opcoes={OPCOES_DE_VIGENCIA}
                  valores={filtros.vigencia}
                  onChange={(vigencia) => mudar({ ...filtros, vigencia: vigencia as StatusVigencia[] })}
                  placeholder="Todas as vigências"
                />
              </div>
            </>
          }
        />
        <Painel titulo="Lista de contratos" semRespiro>
          <TabelaDados
            colunas={COLUNAS}
            linhas={linhas}
            chave={(c) => c.id}
            aoClicarLinha={(c) => router.push(`/contratos/${c.id}`)}
            destaque={destaqueDaVigencia}
            vazio={vazio}
          />
        </Painel>
      </div>
    </>
  )
}
