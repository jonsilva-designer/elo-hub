import { Pencil, Plus } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { BotaoBloqueado } from '@/components/elo/botao-bloqueado'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaCriticidade, EtiquetaPlanejamento, EtiquetaSinal, EtiquetaStatus, IndicadorPrioridade } from '@/components/elo/etiquetas'
import { Jornada } from '@/components/elo/jornada'
import { ListaCampos } from '@/components/elo/lista-campos'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { LinhaAutoria, PainelHistorico } from '@/components/elo/painel-historico'
import { Button } from '@/components/ui/button'
import { opcoesDeContrato } from '@/lib/contratos/filtros'
import { contratoFechado } from '@/lib/contratos/regras'
import { listarContratosDoCliente } from '@/lib/dados/contratos'
import { escopoTemItensLigados, etapasQueImpedemFechar, obterEscopo } from '@/lib/dados/escopos'
import { listarHistorico } from '@/lib/dados/historico'
import { listarPlanosDoEscopo, planosQueImpedemFechar } from '@/lib/dados/planos'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import type { EscopoDetalhado, EtapaJornada, Usuario } from '@/lib/dados/tipos'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { escopoFechado } from '@/lib/escopos/regras'
import { formatarData } from '@/lib/formato'
import { mudancasDaEtapa, podeAtualizarEtapa } from '@/lib/jornada/regras'
import { TabelaPlanos } from '../../../planos/_componentes/tabela-planos'
import { VoltarParaEscopos } from '../../_componentes/voltar-para-escopos'
import { AcoesEscopo } from './acoes-escopo'
import { AtualizarEtapa } from './atualizar-etapa'
import { ReclassificarCriticidade } from './reclassificar-criticidade'

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
 * Quem classificou a criticidade e quando (F05). O responsável muda a cada reclassificação (CA-05.2), então ele fica
 * junto da última alteração; sem alteração, junto da classificação.
 */
function AutoriaDaCriticidade({ escopo }: { escopo: EscopoDetalhado }) {
  const classificada = <Num>{formatarData(escopo.classificadoEm)}</Num>
  return (
    <p className="text-secundario text-muted-foreground">
      {escopo.criticidadeAlteradaEm === escopo.classificadoEm ? (
        <>
          Classificada por {escopo.nomeClassificadoPor} em {classificada}
        </>
      ) : (
        <>
          Classificada em {classificada}
          <span aria-hidden="true"> · </span>
          Última alteração por {escopo.nomeClassificadoPor} em <Num>{formatarData(escopo.criticidadeAlteradaEm)}</Num>
        </>
      )}
    </p>
  )
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
 * Os dados do menu de ações do Administrador: as etapas Em andamento e os planos abertos que impedem concluir e
 * cancelar (RN-18, DF-59), se o escopo pode ser excluído (RN-13) e os outros contratos abertos do cliente, para onde
 * ele pode ser movido (DF-45).
 */
async function dadosDoMenu(escopo: EscopoDetalhado) {
  const [etapas, planos, ligados, contratos] = await Promise.all([
    etapasQueImpedemFechar(escopo.id),
    planosQueImpedemFechar(escopo.id),
    escopoTemItensLigados(escopo.id),
    listarContratosDoCliente(escopo.clienteId),
  ])
  const destinos = contratos.filter((c) => c.id !== escopo.contratoId && !contratoFechado(c.status))
  return { impedimentos: [...etapas, ...planos], contratosDestino: opcoesDeContrato(destinos), podeExcluir: !ligados }
}

/** "Novo plano", para o Administrador e a Equipe vinculada; bloqueado no escopo fechado (RN-23). */
function NovoPlano({ escopo }: { escopo: EscopoDetalhado }) {
  if (escopoFechado(escopo.status)) {
    return (
      <BotaoBloqueado variant="outline" motivo="Escopo fechado: não recebe planos novos">
        <Plus aria-hidden="true" />
        Novo plano
      </BotaoBloqueado>
    )
  }
  return (
    <Button asChild variant="outline">
      <Link href={`/planos/novo?escopo=${escopo.id}`}>
        <Plus aria-hidden="true" />
        Novo plano
      </Link>
    </Button>
  )
}

/**
 * Página do escopo (parte 3, 5.9). Fora do vínculo ou com id que não existe, "não encontrado", sem revelar que o
 * escopo existe. Só o Administrador edita, reclassifica e tem o menu de ações; a Equipe vinculada lê e atualiza as
 * etapas que pode.
 */
export async function ConteudoEscopo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [usuario, escopo] = await Promise.all([obterUsuarioAtual(), obterEscopo(id)])
  if (!escopo) notFound()
  const admin = ehAdmin(usuario)
  const [historico, acoes, menu, planos] = await Promise.all([
    listarHistorico('escopo', escopo.id),
    acoesDaJornada(escopo, usuario),
    admin ? dadosDoMenu(escopo) : null,
    listarPlanosDoEscopo(escopo.id),
  ])

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
            <>
              <Button asChild variant="outline">
                <Link href={`/escopos/${escopo.id}/editar`}>
                  <Pencil aria-hidden="true" />
                  Editar
                </Link>
              </Button>
              {menu ? <AcoesEscopo escopo={escopo} {...menu} /> : null}
            </>
          ) : null
        }
      />
      <div className="space-y-5">
        <Painel titulo="Dados do escopo">
          <ListaCampos itens={camposDoEscopo(escopo)} />
        </Painel>
        <Painel
          titulo="Criticidade"
          acao={admin && !escopoFechado(escopo.status) ? <ReclassificarCriticidade escopo={escopo} /> : null}
        >
          <div className="space-y-3">
            <EtiquetaCriticidade criticidade={escopo.criticidade} />
            <p className="text-sm text-foreground">{escopo.justificativaCriticidade}</p>
            <AutoriaDaCriticidade escopo={escopo} />
          </div>
        </Painel>
        <Jornada
          etapas={escopo.etapas}
          etapaAtual={escopo.etapaAtual}
          progresso={escopo.progresso}
          fechado={escopoFechado(escopo.status)}
          acoes={acoes}
        />
        <Painel titulo="Planos e atividades" acao={<NovoPlano escopo={escopo} />} semRespiro>
          <TabelaPlanos planos={planos} onde="escopo" vazio={<EstadoVazio titulo="Nenhum plano neste escopo." />} />
        </Painel>
        <Painel titulo="Especialistas">
          {escopo.especialistas.length === 0 ? (
            <EstadoVazio titulo="Nenhum especialista vinculado." />
          ) : (
            // O Inativo continua ligado até a troca, sinalizado (DF-51).
            <ul className="divide-y divide-divisoria">
              {escopo.especialistas.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <Link href={`/especialistas/${e.id}`} className={CLASSE_LINK}>
                      {e.nome}
                    </Link>
                    <span className="text-xs text-muted-foreground">{e.especialidade}</span>
                  </span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <EtiquetaStatus status={e.status} />
                    {e.status === 'Ativo' ? null : <EtiquetaSinal texto="Trocar especialista" tom="problema" />}
                  </span>
                </li>
              ))}
            </ul>
          )}
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
