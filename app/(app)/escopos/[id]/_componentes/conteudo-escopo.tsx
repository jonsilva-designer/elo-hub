import { Pencil } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaCriticidade, EtiquetaPlanejamento, EtiquetaStatus, IndicadorPrioridade } from '@/components/elo/etiquetas'
import { Jornada } from '@/components/elo/jornada'
import { ListaCampos } from '@/components/elo/lista-campos'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { LinhaAutoria, PainelHistorico } from '@/components/elo/painel-historico'
import { Button } from '@/components/ui/button'
import { obterEscopo } from '@/lib/dados/escopos'
import { listarHistorico } from '@/lib/dados/historico'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import type { EscopoDetalhado, EtapaJornada, Usuario } from '@/lib/dados/tipos'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { escopoFechado } from '@/lib/escopos/regras'
import { formatarData } from '@/lib/formato'
import { mudancasDaEtapa, podeAtualizarEtapa } from '@/lib/jornada/regras'
import { VoltarParaEscopos } from '../../_componentes/voltar-para-escopos'
import { AtualizarEtapa } from './atualizar-etapa'

const CLASSE_LINK = 'rounded-sm text-primary underline-offset-4 hover:underline'

const naoInformado = <span className="font-normal text-muted-foreground">Não informado</span>

const ou = (valor: string) => (valor.trim() ? valor : naoInformado)

const data = (valor: string | null) => (valor ? <Num>{formatarData(valor)}</Num> : naoInformado)

/** O link para outro ciclo do contrato recorrente (DF-46). */
const linkDoCiclo = (ciclo: { id: string; nome: string }) => (
  <Link href={`/escopos/${ciclo.id}`} className={CLASSE_LINK}>
    {ciclo.nome}
  </Link>
)

/** Os campos do painel Dados do escopo. A conclusão efetiva só no Concluído; os ciclos, só quando existem. */
function camposDoEscopo(escopo: EscopoDetalhado): { rotulo: string; valor: ReactNode }[] {
  return [
    { rotulo: 'Descrição', valor: ou(escopo.descricao) },
    { rotulo: 'Responsável ELO', valor: ou(escopo.nomeResponsavel) },
    { rotulo: 'Prioridade', valor: <IndicadorPrioridade prioridade={escopo.prioridade} /> },
    { rotulo: 'Início', valor: data(escopo.inicio) },
    { rotulo: 'Conclusão prevista', valor: data(escopo.conclusaoPrevista) },
    ...(escopo.status === 'Concluído' ? [{ rotulo: 'Conclusão efetiva', valor: data(escopo.conclusaoEfetiva) }] : []),
    { rotulo: 'Observações', valor: ou(escopo.observacoes) },
    ...(escopo.cicloAnterior ? [{ rotulo: 'Ciclo anterior', valor: linkDoCiclo(escopo.cicloAnterior) }] : []),
    ...(escopo.cicloSeguinte ? [{ rotulo: 'Ciclo seguinte', valor: linkDoCiclo(escopo.cicloSeguinte) }] : []),
  ]
}

/**
 * O "Atualizar" de cada etapa que o perfil pode mudar (RN-23, DF-24), com os destinos e o motivo calculados aqui,
 * no servidor. O Administrador escolhe o responsável entre quem tem vínculo com o cliente (RN-19).
 */
async function acoesDaJornada(escopo: EscopoDetalhado, usuario: Usuario): Promise<Partial<Record<EtapaJornada, ReactNode>>> {
  const atualizaveis = escopo.etapas.filter((l) => podeAtualizarEtapa(l, usuario.perfil, escopo.status))
  if (atualizaveis.length === 0) return {}
  const responsaveis = ehAdmin(usuario)
    ? (await listarResponsaveis(escopo.clienteId)).map((u) => ({ valor: u.id, rotulo: u.nome }))
    : []
  return Object.fromEntries(
    atualizaveis.map((l) => {
      const { destinos, motivo } = mudancasDaEtapa(l, escopo.etapas, usuario.perfil, escopo.status)
      return [
        l.etapa,
        <AtualizarEtapa
          key={l.etapa}
          escopoId={escopo.id}
          etapa={l}
          perfil={usuario.perfil}
          destinos={destinos}
          motivo={motivo}
          responsaveis={responsaveis}
        />,
      ]
    }),
  )
}

/**
 * Página do escopo (parte 3, 5.9). Fora do vínculo ou com id que não existe, "não encontrado", sem revelar que o
 * escopo existe. Só o Administrador edita; a Equipe vinculada lê. A Tarefa 7 do plano 3B acrescenta o menu de ações
 * e o Reclassificar.
 */
export async function ConteudoEscopo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [usuario, escopo] = await Promise.all([obterUsuarioAtual(), obterEscopo(id)])
  if (!escopo) notFound()
  const [historico, acoes] = await Promise.all([listarHistorico('escopo', escopo.id), acoesDaJornada(escopo, usuario)])
  const admin = ehAdmin(usuario)

  return (
    <>
      <div className="mb-3">
        <VoltarParaEscopos />
      </div>
      <CabecalhoPagina
        titulo={escopo.nome}
        contexto={
          <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <Link href={`/clientes/${escopo.clienteId}`} className={CLASSE_LINK}>
              {escopo.nomeCliente}
            </Link>
            <span aria-hidden="true">·</span>
            <Link href={`/contratos/${escopo.contratoId}`} className={CLASSE_LINK}>
              <Num>{escopo.codigoContrato}</Num>
            </Link>
            <span aria-hidden="true">·</span>
            <EtiquetaStatus status={escopo.status} />
            {escopo.planejamento ? <EtiquetaPlanejamento /> : null}
          </span>
        }
        acoes={
          admin ? (
            <Button asChild variant="outline">
              <Link href={`/escopos/${escopo.id}/editar`}>
                <Pencil aria-hidden="true" />
                Editar
              </Link>
            </Button>
          ) : null
        }
      />
      <div className="space-y-5">
        <Painel titulo="Dados do escopo">
          <ListaCampos itens={camposDoEscopo(escopo)} />
        </Painel>
        <Painel titulo="Criticidade">
          <div className="space-y-3">
            <EtiquetaCriticidade criticidade={escopo.criticidade} />
            <p className="text-sm text-foreground">{escopo.justificativaCriticidade}</p>
            <p className="text-secundario text-muted-foreground">
              Classificada por {escopo.nomeClassificadoPor} em <Num>{formatarData(escopo.classificadoEm)}</Num>
              <span aria-hidden="true"> · </span>
              Última alteração em <Num>{formatarData(escopo.criticidadeAlteradaEm)}</Num>
            </p>
          </div>
        </Painel>
        <Jornada
          etapas={escopo.etapas}
          etapaAtual={escopo.etapaAtual}
          progresso={escopo.progresso}
          fechado={escopoFechado(escopo.status)}
          acoes={acoes}
        />
        <Painel titulo="Planos e atividades">
          <EstadoVazio titulo="Nenhum plano neste escopo." />
        </Painel>
        <Painel titulo="Especialistas">
          <EstadoVazio titulo="Nenhum especialista vinculado." />
        </Painel>
        <Painel titulo="Documentos">
          <EstadoVazio titulo="Nenhum documento ligado a este escopo." />
        </Painel>
        <Painel titulo="Demandas">
          <EstadoVazio titulo="Nenhuma demanda ligada a este escopo." />
        </Painel>
        <PainelHistorico entradas={historico} />
        <LinhaAutoria entradas={historico} />
      </div>
    </>
  )
}
