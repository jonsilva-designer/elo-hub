'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { BarraFiltros } from '@/components/elo/barra-filtros'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { SelecaoMultipla } from '@/components/elo/selecao-multipla'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { Apagado, LinkTexto, TextoComDetalhe } from '@/components/elo/textos'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { DocumentoDetalhado } from '@/lib/dados/tipos'
import {
  CHAVE_FILTROS_DOS_DOCUMENTOS,
  escreverFiltrosDocumentos,
  filtrarDocumentos,
  SITUACOES_DO_FILTRO,
  type FiltrosDocumentos,
  type SituacaoDocumento,
} from '@/lib/documentos/filtros'
import { formatarData } from '@/lib/formato'
import { NomeDoDocumento, StatusDoDocumento } from './tabela-documentos'
import { TextoComNumeros } from './texto-com-numeros'

const TODOS = 'todos'
const SEM_FILTRO: FiltrosDocumentos = { busca: '', cliente: null, categoria: null, status: [] }

/** Grava no navegador sem quebrar a tela quando ele recusa (aba anônima, dados bloqueados). */
function guardar(texto: string) {
  try {
    sessionStorage.setItem(CHAVE_FILTROS_DOS_DOCUMENTOS, texto)
  } catch {
    // Sem armazenamento, a volta só não recupera os filtros.
  }
}


const COLUNAS: Coluna<DocumentoDetalhado>[] = [
  {
    id: 'documento',
    titulo: 'Documento',
    largura: 'w-1/3',
    ordenarPor: (d) => d.nome,
    celula: (d) => <NomeDoDocumento documento={d} />,
  },
  {
    id: 'cliente',
    titulo: 'Cliente',
    ordenarPor: (d) => d.nomeCliente ?? '',
    celula: (d) => d.nomeCliente ?? <Apagado>Sem cliente</Apagado>,
  },
  {
    id: 'vinculo',
    titulo: 'Vínculo',
    largura: 'w-1/4',
    ordenarPor: (d) => d.vinculo?.rotulo ?? '',
    celula: (d) =>
      d.vinculo ? (
        <TextoComDetalhe
          texto={
            <LinkTexto href={d.vinculo.href} className="font-medium">
              <TextoComNumeros texto={d.vinculo.rotulo} />
            </LinkTexto>
          }
          destaque={false}
          detalhes={[d.vinculo.tipo]}
        />
      ) : (
        <Apagado>Só o cliente</Apagado>
      ),
  },
  { id: 'data', titulo: 'Data', ordenarPor: (d) => d.data, celula: (d) => <Num>{formatarData(d.data)}</Num> },
  { id: 'status', titulo: 'Status', ordenarPor: (d) => d.status, celula: (d) => <StatusDoDocumento documento={d} /> },
]

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
      <SelectTrigger aria-label={rotulo} className="w-full sm:w-52">
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
 * Lista de documentos (parte 6, 4.4; F12, UC-15). Os documentos chegam já recortados pelo acesso (RN-16, DF-65).
 * Filtra no navegador; a cada mudança, os filtros vão para o endereço e ficam guardados para a volta (CA-16.2). Os
 * inativos só aparecem com o filtro (CA-18.2). "Incluir documento" para os dois perfis; sem exportação (DF-75).
 */
export function ListaDocumentos({
  documentos,
  clientes,
  categorias,
  filtrosIniciais,
  semVinculo,
}: {
  documentos: DocumentoDetalhado[]
  clientes: { valor: string; rotulo: string }[]
  categorias: string[]
  filtrosIniciais: FiltrosDocumentos
  semVinculo: boolean
}) {
  const router = useRouter()
  const [filtros, setFiltros] = useState(filtrosIniciais)
  const linhas = useMemo(() => filtrarDocumentos(documentos, filtros), [documentos, filtros])

  // Quem chega pelo endereço com filtros também tem a volta garantida.
  useEffect(() => guardar(escreverFiltrosDocumentos(filtrosIniciais)), [filtrosIniciais])

  function mudar(novos: FiltrosDocumentos) {
    setFiltros(novos)
    const q = escreverFiltrosDocumentos(novos)
    window.history.replaceState(null, '', q ? `/documentos?${q}` : '/documentos')
    guardar(q)
  }

  const vazio = semVinculo ? (
    <EstadoVazio titulo="Você ainda não tem clientes vinculados." descricao="Fale com o Administrador da ELO." />
  ) : documentos.length === 0 ? (
    <EstadoVazio titulo="Nenhum documento incluído." />
  ) : (
    <EstadoVazio
      titulo="Nenhum documento com esses filtros."
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
        titulo="Documentos"
        contexto={
          <>
            <Num>{linhas.length}</Num> {linhas.length === 1 ? 'documento' : 'documentos'}
          </>
        }
        acoes={
          <Button asChild>
            <Link href="/documentos/novo">
              <Plus aria-hidden="true" />
              Incluir documento
            </Link>
          </Button>
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
                aoMudar={(cliente) => mudar({ ...filtros, cliente })}
              />
              <FiltroUnico
                rotulo="Categoria"
                todos="Todas as categorias"
                valor={filtros.categoria}
                opcoes={categorias.map((c) => ({ valor: c, rotulo: c }))}
                aoMudar={(categoria) => mudar({ ...filtros, categoria })}
              />
              <div className="w-full sm:w-48">
                <SelecaoMultipla
                  aria-label="Status"
                  opcoes={SITUACOES_DO_FILTRO.map((s) => ({ valor: s, rotulo: s }))}
                  valores={filtros.status}
                  onChange={(status) => mudar({ ...filtros, status: status as SituacaoDocumento[] })}
                  placeholder="Todos os status"
                />
              </div>
            </>
          }
        />
        <Painel titulo="Documentos e evidências" semRespiro>
          <TabelaDados
            colunas={COLUNAS}
            linhas={linhas}
            chave={(d) => d.id}
            aoClicarLinha={(d) => router.push(`/documentos/${d.id}`)}
            vazio={vazio}
          />
        </Painel>
      </div>
    </>
  )
}
