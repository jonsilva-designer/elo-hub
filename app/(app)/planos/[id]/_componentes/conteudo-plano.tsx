import { Pencil, Plus } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { BotaoBloqueado } from '@/components/elo/botao-bloqueado'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaPlanejamento, EtiquetaStatus } from '@/components/elo/etiquetas'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { ListaCampos } from '@/components/elo/lista-campos'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { LinhaAutoria, PainelHistorico } from '@/components/elo/painel-historico'
import { ResumoAtividades } from '@/components/elo/resumo-atividades'
import { Button } from '@/components/ui/button'
import { listarAtividadesDoPlano } from '@/lib/dados/atividades'
import { listarHistorico } from '@/lib/dados/historico'
import { atividadesQueImpedemFechar, obterPlano } from '@/lib/dados/planos'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import type { PlanoDetalhado } from '@/lib/dados/tipos'
import { formatarData } from '@/lib/formato'
import { planoFechado } from '@/lib/planos/regras'
import { TabelaAtividades } from '../../../atividades/_componentes/tabela-atividades'
import { AcoesPlano } from './acoes-plano'

const CLASSE_LINK = 'rounded-sm text-primary underline-offset-4 hover:underline'

const naoInformado = <span className="font-normal text-muted-foreground">Não informado</span>

const ou = (valor: string) => (valor.trim() ? valor : naoInformado)

const data = (valor: string | null) => (valor ? <Num>{formatarData(valor)}</Num> : naoInformado)

/** Os campos do painel Dados do plano (F07). A avaliação de origem, com link, quando o plano saiu dela (DF-80). */
function camposDoPlano(plano: PlanoDetalhado): { rotulo: string; valor: ReactNode }[] {
  return [
    { rotulo: 'Descrição', valor: ou(plano.descricao) },
    { rotulo: 'Responsável ELO', valor: ou(plano.nomeResponsavel) },
    { rotulo: 'Criado em', valor: data(plano.criadoEm) },
    { rotulo: 'Prazo', valor: data(plano.prazo) },
    {
      rotulo: 'Avaliação de origem',
      valor: plano.avaliacao ? (
        <Link href={`/avaliacoes/${plano.avaliacao.id}`} className={CLASSE_LINK}>
          Avaliação de <Num>{formatarData(plano.avaliacao.data)}</Num>
        </Link>
      ) : (
        <span className="font-normal text-muted-foreground">Sem avaliação</span>
      ),
    },
    { rotulo: 'Observações', valor: ou(plano.observacoes) },
  ]
}

/** "Nova atividade", para o Administrador e a Equipe vinculada; bloqueada no plano fechado (RN-23). */
function NovaAtividade({ plano }: { plano: PlanoDetalhado }) {
  if (planoFechado(plano.status)) {
    return (
      <BotaoBloqueado variant="outline" motivo="Plano fechado: não recebe atividades novas">
        <Plus aria-hidden="true" />
        Nova atividade
      </BotaoBloqueado>
    )
  }
  return (
    <Button asChild variant="outline">
      <Link href={`/atividades/nova?plano=${plano.id}`}>
        <Plus aria-hidden="true" />
        Nova atividade
      </Link>
    </Button>
  )
}

/**
 * Página do plano de ação (parte 4, 5.5). Fora do vínculo ou com id que não existe, "não encontrado", sem revelar que
 * o plano existe. O Administrador e a Equipe vinculada criam atividades; a Equipe edita só o plano aberto (RN-17).
 */
export async function ConteudoPlano({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [usuario, plano] = await Promise.all([obterUsuarioAtual(), obterPlano(id)])
  if (!plano) notFound()
  const [atividades, historico, impedimentos] = await Promise.all([
    listarAtividadesDoPlano(plano.id),
    listarHistorico('plano', plano.id),
    atividadesQueImpedemFechar(plano.id),
  ])
  const admin = ehAdmin(usuario)
  const podeEditar = admin || !planoFechado(plano.status)

  return (
    <>
      <div className="mb-3">
        <LinkVoltar href={`/escopos/${plano.escopoId}`} rotulo={plano.nomeEscopo} />
      </div>
      <CabecalhoPagina
        titulo={plano.nome}
        contexto={
          <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <Link href={`/clientes/${plano.clienteId}`} className={CLASSE_LINK}>
              {plano.nomeCliente}
            </Link>
            <span aria-hidden="true">·</span>
            <Link href={`/escopos/${plano.escopoId}`} className={CLASSE_LINK}>
              {plano.nomeEscopo}
            </Link>
            <span aria-hidden="true">·</span>
            <EtiquetaStatus status={plano.status} />
            {plano.planejamento ? <EtiquetaPlanejamento /> : null}
          </span>
        }
        acoes={
          <>
            {podeEditar ? (
              <Button asChild variant="outline">
                <Link href={`/planos/${plano.id}/editar`}>
                  <Pencil aria-hidden="true" />
                  Editar
                </Link>
              </Button>
            ) : null}
            {/* Excluir só no plano sem atividades (RN-13, DF-33); o menu some quando o perfil não tem item. */}
            <AcoesPlano
              plano={plano}
              perfil={usuario.perfil}
              impedimentos={impedimentos}
              podeExcluir={admin && plano.resumo.total === 0}
            />
          </>
        }
      />
      <div className="space-y-5">
        <Painel titulo="Dados do plano">
          <ListaCampos itens={camposDoPlano(plano)} />
        </Painel>
        <Painel titulo="Atividades" acao={<NovaAtividade plano={plano} />} semRespiro>
          <div className="border-b border-divisoria px-5 py-3">
            <ResumoAtividades resumo={plano.resumo} />
          </div>
          <TabelaAtividades
            atividades={atividades}
            perfil={usuario.perfil}
            vazio={<EstadoVazio titulo="Nenhuma atividade neste plano." />}
          />
        </Painel>
        <Painel titulo="Documentos">
          <EstadoVazio titulo="Nenhum documento ligado a este plano." />
        </Painel>
        <PainelHistorico entradas={historico} />
        <LinhaAutoria entradas={historico} />
      </div>
    </>
  )
}
