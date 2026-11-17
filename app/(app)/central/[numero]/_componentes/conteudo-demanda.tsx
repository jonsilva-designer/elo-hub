import { Pencil } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaCriticidade, EtiquetaSinal, EtiquetaStatus } from '@/components/elo/etiquetas'
import { ListaCampos } from '@/components/elo/lista-campos'
import { ListaComentarios } from '@/components/elo/lista-comentarios'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { Button } from '@/components/ui/button'
import { LinhaAutoria, PainelHistorico } from '@/components/elo/painel-historico'
import { listarComentarios, obterDemanda } from '@/lib/dados/demandas'
import { listarHistorico } from '@/lib/dados/historico'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import type { DemandaDetalhada } from '@/lib/dados/tipos'
import { acoesDaDemanda, demandaFechada, faltaParaAtendimento } from '@/lib/demandas/regras'
import { formatarData } from '@/lib/formato'
import { VoltarParaCentral } from '../../_componentes/voltar-para-central'
import { AcoesDemanda } from './acoes-demanda'
import { FormularioComentario } from './formulario-comentario'

const CLASSE_LINK = 'rounded-sm text-primary underline-offset-4 hover:underline'

const apagado = (texto: string) => <span className="font-normal text-muted-foreground">{texto}</span>

const ou = (valor: string, vazio: string) => (valor.trim() ? valor : apagado(vazio))

const data = (valor: string | null, vazio: string) => (valor ? <Num>{formatarData(valor)}</Num> : apagado(vazio))

function camposDosDados(d: DemandaDetalhada): { rotulo: string; valor: ReactNode }[] {
  return [
    { rotulo: 'Origem', valor: d.origem },
    { rotulo: 'Aberta em', valor: <Num>{formatarData(d.abertaEm)}</Num> },
    {
      rotulo: 'Contrato',
      valor: d.contratoId ? (
        <Link href={`/contratos/${d.contratoId}`} className={CLASSE_LINK}>
          <Num>{d.codigoContrato}</Num>
        </Link>
      ) : (
        apagado('Sem contrato')
      ),
    },
    {
      rotulo: 'Escopo',
      valor: d.escopoId ? (
        <Link href={`/escopos/${d.escopoId}`} className={CLASSE_LINK}>
          {d.nomeEscopo}
        </Link>
      ) : (
        apagado('Sem escopo')
      ),
    },
    { rotulo: 'Descrição', valor: d.descricao },
    { rotulo: 'Registrada por', valor: d.nomeRegistradaPor },
  ]
}

/** Os especialistas da demanda, com o principal marcado e o Inativo sinalizado para troca (DF-32, DF-51). */
function Especialistas({ demanda }: { demanda: DemandaDetalhada }) {
  if (demanda.especialistasLigados.length === 0) return apagado('Nenhum especialista')
  return (
    <ul className="space-y-1.5">
      {demanda.especialistasLigados.map((e) => (
        <li key={e.id} className="flex flex-wrap items-center gap-1.5">
          <Link href={`/especialistas/${e.id}`} className={CLASSE_LINK}>
            {e.nome}
          </Link>
          {e.principal && demanda.especialistasLigados.length > 1 ? (
            <span className="text-xs text-muted-foreground">Principal</span>
          ) : null}
          {e.status === 'Ativo' ? null : <EtiquetaSinal texto="Trocar especialista" tom="problema" />}
        </li>
      ))}
    </ul>
  )
}

function camposDaTriagem(d: DemandaDetalhada): { rotulo: string; valor: ReactNode }[] {
  return [
    { rotulo: 'Categoria', valor: d.categoria ?? apagado('Na triagem') },
    { rotulo: 'Criticidade', valor: d.criticidade ? <EtiquetaCriticidade criticidade={d.criticidade} /> : apagado('Na triagem') },
    { rotulo: 'Responsável pela triagem', valor: d.nomeTriagem },
    { rotulo: 'Responsável pelo atendimento', valor: ou(d.nomeAtendimento, 'Na triagem') },
    {
      rotulo: 'Prazo',
      valor: d.prazo ? (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <Num>{formatarData(d.prazo)}</Num>
          {d.vencida ? <EtiquetaSinal texto="Vencida" tom="problema" /> : null}
        </span>
      ) : (
        apagado('Sem prazo')
      ),
    },
    { rotulo: 'Especialistas', valor: <Especialistas demanda={d} /> },
  ]
}

function camposDoAtendimento(d: DemandaDetalhada): { rotulo: string; valor: ReactNode }[] {
  return [
    { rotulo: 'Solução', valor: ou(d.solucao, 'Ainda não registrada') },
    { rotulo: 'Retorno ao cliente', valor: ou(d.retornoCliente, 'Ainda não registrado') },
    { rotulo: 'Encerrada em', valor: data(d.encerradaEm, 'Em aberto') },
  ]
}

/**
 * Página da demanda (parte 5, 5.10). Fora do vínculo ou com número que não existe, "não encontrado", sem revelar que
 * a demanda existe: vale também para quem a registrou para cliente fora dos vínculos (CA-09.9).
 */
export async function ConteudoDemanda({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params
  const [usuario, demanda] = await Promise.all([obterUsuarioAtual(), obterDemanda(numero)])
  if (!demanda) notFound()
  const [comentarios, historico] = await Promise.all([listarComentarios(demanda.numero), listarHistorico('demanda', demanda.numero)])

  return (
    <>
      <div className="mb-3">
        <VoltarParaCentral />
      </div>
      <CabecalhoPagina
        titulo={demanda.assunto}
        contexto={
          <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <Num>{demanda.numero}</Num>
            <span aria-hidden="true">·</span>
            <Link href={`/clientes/${demanda.clienteId}`} className={CLASSE_LINK}>
              {demanda.nomeCliente}
            </Link>
            <span aria-hidden="true">·</span>
            <EtiquetaStatus status={demanda.status} />
            {demanda.criticidade ? <EtiquetaCriticidade criticidade={demanda.criticidade} /> : null}
          </span>
        }
        acoes={
          <>
            {/* A Equipe edita a demanda aberta; a Encerrada, só o Administrador (RN-17). */}
            {ehAdmin(usuario) || !demandaFechada(demanda.status) ? (
              <Button asChild variant="outline">
                <Link href={`/central/${demanda.numero}/editar`}>
                  <Pencil aria-hidden="true" />
                  Editar
                </Link>
              </Button>
            ) : null}
            <AcoesDemanda
              numero={demanda.numero}
              acoes={acoesDaDemanda(demanda, usuario)}
              falta={faltaParaAtendimento(demanda)}
            />
          </>
        }
      />
      <div className="space-y-5">
        <Painel titulo="Dados">
          <ListaCampos itens={camposDosDados(demanda)} />
        </Painel>
        <Painel titulo="Triagem">
          <ListaCampos itens={camposDaTriagem(demanda)} />
        </Painel>
        <Painel titulo="Atendimento">
          <ListaCampos itens={camposDoAtendimento(demanda)} />
        </Painel>
        <Painel titulo="Comentários">
          <div className="space-y-4">
            <ListaComentarios comentarios={comentarios} />
            {/* Comentário só na demanda aberta (escolha da Result, parte 5, seção 10). */}
            {demandaFechada(demanda.status) ? null : (
              <FormularioComentario
                numero={demanda.numero}
                especialistas={demanda.especialistasLigados.map((e) => ({ valor: e.id, rotulo: e.nome }))}
              />
            )}
          </div>
        </Painel>
        <Painel titulo="Anexos">
          <EstadoVazio titulo="Nenhum anexo nesta demanda." />
        </Painel>
        <PainelHistorico entradas={historico} />
        <LinhaAutoria entradas={historico} />
      </div>
    </>
  )
}
