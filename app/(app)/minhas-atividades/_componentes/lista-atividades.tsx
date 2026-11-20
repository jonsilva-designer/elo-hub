'use client'

import { useEffect, useMemo, type ReactNode } from 'react'
import { BarraFiltros } from '@/components/elo/barra-filtros'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { useFiltrosDaLista } from '@/components/elo/filtros-da-lista'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { SelecaoMultipla } from '@/components/elo/selecao-multipla'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  CHAVE_FILTROS_DAS_ATIVIDADES,
  escreverFiltrosAtividades,
  filtrarAtividades,
  PRAZOS_FILTRO,
  type FiltrosAtividades,
  type PrazoFiltro,
} from '@/lib/atividades/filtros'
import { STATUS_ATIVIDADE } from '@/lib/atividades/regras'
import type { AtividadeDetalhada, Perfil, StatusAtividade } from '@/lib/dados/tipos'
import { TabelaAtividades } from '../../atividades/_componentes/tabela-atividades'

const TODOS = 'todos'
/** "Limpar filtros" tira todos os filtros, também o do responsável. */
const SEM_FILTRO: FiltrosAtividades = { busca: '', responsavel: null, status: [], prazo: [], escopo: null }
const comoOpcoes = (lista: readonly string[]) => lista.map((s) => ({ valor: s, rotulo: s }))

/** Grava no navegador sem quebrar a tela quando ele recusa (aba anônima, dados bloqueados). */
function guardar(texto: string) {
  try {
    sessionStorage.setItem(CHAVE_FILTROS_DAS_ATIVIDADES, texto)
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
 * Minhas atividades (parte 4, 5.8; F08, F16). Abre com as da pessoa que entrou, e o filtro de responsável mostra as
 * dos outros, dentro dos vínculos (RN-01). Filtra no navegador; a cada mudança, os filtros vão para o endereço e
 * ficam guardados para a volta da edição (CA-16.2). Exportar é só do Administrador (CA-16.3).
 */
export function ListaAtividades({
  atividades,
  responsaveis,
  escopos,
  filtrosIniciais,
  usuarioId,
  perfil,
  semVinculo,
}: {
  atividades: AtividadeDetalhada[]
  responsaveis: { valor: string; rotulo: string }[]
  escopos: { valor: string; rotulo: string; cliente: string }[]
  filtrosIniciais: FiltrosAtividades
  usuarioId: string
  perfil: Perfil
  semVinculo: boolean
}) {
  // Acompanha os filtros do endereço quando só a busca muda (revisão do código).
  const [filtros, setFiltros] = useFiltrosDaLista(filtrosIniciais, (f) => escreverFiltrosAtividades(f, usuarioId))
  const linhas = useMemo(() => filtrarAtividades(atividades, filtros), [atividades, filtros])
  const texto = escreverFiltrosAtividades(filtros, usuarioId)

  // Quem chega pelo endereço com filtros também tem a volta garantida.
  useEffect(() => guardar(escreverFiltrosAtividades(filtrosIniciais, usuarioId)), [filtrosIniciais, usuarioId])

  function mudar(novos: FiltrosAtividades) {
    setFiltros(novos)
    const q = escreverFiltrosAtividades(novos, usuarioId)
    window.history.replaceState(null, '', q ? `/minhas-atividades?${q}` : '/minhas-atividades')
    guardar(q)
  }

  // Sem nenhuma atividade para ver, limpar os filtros não traz nada: o aviso diz que não há atividade.
  const vazio = semVinculo ? (
    <EstadoVazio titulo="Você ainda não tem clientes vinculados." descricao="Fale com o Administrador da ELO." />
  ) : atividades.length === 0 ? (
    <EstadoVazio titulo="Nenhuma atividade cadastrada." />
  ) : (
    <EstadoVazio
      titulo="Nenhuma atividade com esses filtros."
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
        titulo="Minhas atividades"
        contexto={
          <>
            <Num>{linhas.length}</Num> {linhas.length === 1 ? 'atividade' : 'atividades'}
          </>
        }
      />
      <div className="space-y-4">
        <BarraFiltros
          busca={filtros.busca}
          aoBuscar={(busca) => mudar({ ...filtros, busca })}
          aoExportar={
            perfil === 'Administrador' ? () => baixar(`/api/exportar/atividades${texto ? `?${texto}` : ''}`) : undefined
          }
          filtros={
            <>
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
                  opcoes={comoOpcoes(STATUS_ATIVIDADE)}
                  valores={filtros.status}
                  onChange={(status) => mudar({ ...filtros, status: status as StatusAtividade[] })}
                  placeholder="Todos os status"
                />
              </div>
              <div className="w-full sm:w-48">
                <SelecaoMultipla
                  aria-label="Prazo"
                  opcoes={comoOpcoes(PRAZOS_FILTRO)}
                  valores={filtros.prazo}
                  onChange={(prazo) => mudar({ ...filtros, prazo: prazo as PrazoFiltro[] })}
                  placeholder="Todos os prazos"
                />
              </div>
              <FiltroUnico
                rotulo="Escopo"
                todos="Todos os escopos"
                valor={filtros.escopo}
                opcoes={escopos.map((e) => ({
                  valor: e.valor,
                  rotulo: (
                    <>
                      {e.rotulo}
                      <span aria-hidden="true"> · </span>
                      {e.cliente}
                    </>
                  ),
                }))}
                aoMudar={(escopo) => mudar({ ...filtros, escopo })}
              />
            </>
          }
        />
        <Painel titulo="Lista de atividades" semRespiro>
          <TabelaAtividades atividades={linhas} perfil={perfil} origem="minhas-atividades" vazio={vazio} />
        </Painel>
      </div>
    </>
  )
}
