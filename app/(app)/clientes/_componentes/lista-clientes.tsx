'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { BarraFiltros } from '@/components/elo/barra-filtros'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { useFiltrosDaLista } from '@/components/elo/filtros-da-lista'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { SelecaoMultipla } from '@/components/elo/selecao-multipla'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { TextoComDetalhe } from '@/components/elo/textos'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  CHAVE_FILTROS_DA_LISTA,
  escreverFiltros,
  filtrarClientes,
  nomeDoCliente,
  type FiltrosClientes,
} from '@/lib/clientes/filtros'
import type { Cliente, StatusCliente } from '@/lib/dados/tipos'
import { VAZIO } from '@/lib/formato'

const TODOS_OS_SEGMENTOS = 'todos'
const SEM_FILTRO: FiltrosClientes = { busca: '', status: [], segmento: null }
const OPCOES_DE_STATUS = (['Prospect', 'Ativo', 'Inativo'] as const).map((s) => ({ valor: s, rotulo: s }))

const cidadeUf = (c: Cliente) => [c.cidade, c.uf].filter(Boolean).join('/') || VAZIO

// Larguras fixas: a busca e os filtros não mexem no tamanho das colunas. O Status fica com o resto (cerca de 18%).
const COLUNAS: Coluna<Cliente>[] = [
  {
    id: 'cliente',
    titulo: 'Cliente',
    largura: 'w-3/10',
    ordenarPor: nomeDoCliente,
    celula: (c) => (
      <TextoComDetalhe
        texto={nomeDoCliente(c)}
        detalhes={[c.nomeFantasia?.trim() ? c.razaoSocial : null, c.ehCadastroElo && 'Cadastro da ELO']}
      />
    ),
  },
  { id: 'cnpj', titulo: 'CNPJ', largura: 'w-1/6', ordenarPor: (c) => c.cnpj, celula: (c) => <Num className="whitespace-nowrap">{c.cnpj}</Num> },
  { id: 'segmento', titulo: 'Segmento', largura: 'w-1/5', ordenarPor: (c) => c.segmento, celula: (c) => c.segmento || VAZIO },
  { id: 'cidade', titulo: 'Cidade/UF', largura: 'w-3/20', ordenarPor: (c) => c.cidade, celula: cidadeUf },
  { id: 'status', titulo: 'Status', ordenarPor: (c) => c.status, celula: (c) => <EtiquetaStatus status={c.status} /> },
]

/** Grava no navegador sem quebrar a tela quando ele recusa (aba anônima, dados bloqueados). */
function guardar(texto: string) {
  try {
    sessionStorage.setItem(CHAVE_FILTROS_DA_LISTA, texto)
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

/**
 * Lista de clientes (F16). Filtra no navegador; a cada mudança, os filtros vão para o endereço
 * (sem ir ao servidor) e ficam guardados para o caminho de volta da página do cliente (CA-16.2).
 */
export function ListaClientes({
  clientes,
  segmentos,
  filtrosIniciais,
  ehAdmin,
}: {
  clientes: Cliente[]
  segmentos: string[]
  filtrosIniciais: FiltrosClientes
  ehAdmin: boolean
}) {
  const router = useRouter()
  // Acompanha os filtros do endereço quando só a busca muda (revisão do código).
  const [filtros, setFiltros] = useFiltrosDaLista(filtrosIniciais, escreverFiltros)
  const linhas = useMemo(() => filtrarClientes(clientes, filtros), [clientes, filtros])
  const texto = escreverFiltros(filtros)

  // Quem chega pelo endereço com filtros também tem a volta garantida.
  useEffect(() => guardar(escreverFiltros(filtrosIniciais)), [filtrosIniciais])

  function mudar(novos: FiltrosClientes) {
    setFiltros(novos)
    const q = escreverFiltros(novos)
    window.history.replaceState(null, '', q ? `/clientes?${q}` : '/clientes')
    guardar(q)
  }

  const semVinculo = clientes.length === 0 && !ehAdmin
  const vazio = semVinculo ? (
    <EstadoVazio titulo="Você ainda não tem clientes vinculados." descricao="Fale com o Administrador da ELO." />
  ) : (
    <EstadoVazio
      titulo="Nenhum cliente com esses filtros."
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
        titulo="Clientes"
        contexto={
          <>
            <Num>{linhas.length}</Num> {linhas.length === 1 ? 'cliente' : 'clientes'}
          </>
        }
        acoes={
          ehAdmin ? (
            <Button asChild>
              <Link href="/clientes/novo">
                <Plus aria-hidden="true" />
                Novo cliente
              </Link>
            </Button>
          ) : null
        }
      />
      <div className="space-y-4">
        <BarraFiltros
          busca={filtros.busca}
          aoBuscar={(busca) => mudar({ ...filtros, busca })}
          aoExportar={ehAdmin ? () => baixar(`/api/exportar/clientes${texto ? `?${texto}` : ''}`) : undefined}
          filtros={
            <>
              <div className="w-full sm:w-64">
                <SelecaoMultipla
                  aria-label="Status"
                  opcoes={OPCOES_DE_STATUS}
                  valores={filtros.status}
                  onChange={(status) => mudar({ ...filtros, status: status as StatusCliente[] })}
                  placeholder="Prospect e Ativo"
                />
              </div>
              <Select
                value={filtros.segmento ?? TODOS_OS_SEGMENTOS}
                onValueChange={(v) => mudar({ ...filtros, segmento: v === TODOS_OS_SEGMENTOS ? null : v })}
              >
                <SelectTrigger aria-label="Segmento" className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS_OS_SEGMENTOS}>Todos os segmentos</SelectItem>
                  {segmentos.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* A carteira, sem o cadastro da ELO, é a lista que o total de clientes ativos do painel abre (CA-13.4). */}
              <Select
                value={filtros.carteira ? 'carteira' : 'todos'}
                onValueChange={(v) => mudar({ ...filtros, carteira: v === 'carteira' })}
              >
                <SelectTrigger aria-label="Cadastros" className="w-full sm:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Com o cadastro da ELO</SelectItem>
                  <SelectItem value="carteira">Só a carteira</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
        />
        <Painel titulo="Lista de clientes" semRespiro>
          <TabelaDados
            colunas={COLUNAS}
            linhas={linhas}
            chave={(c) => c.id}
            aoClicarLinha={(c) => router.push(`/clientes/${c.id}`)}
            vazio={vazio}
          />
        </Painel>
      </div>
    </>
  )
}
