import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { ListaCampos } from '@/components/elo/lista-campos'
import { NivelMaturidade } from '@/components/elo/nivel-maturidade'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { LinhaAutoria, PainelHistorico } from '@/components/elo/painel-historico'
import { Apagado, LinkTexto } from '@/components/elo/textos'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { nomeDoCliente } from '@/lib/clientes/filtros'
import { obterCliente } from '@/lib/dados/clientes'
import { obterContrato } from '@/lib/dados/contratos'
import { listarHistorico } from '@/lib/dados/historico'
import { obterAvaliacao } from '@/lib/dados/maturidade'
import { listarPlanosDaAvaliacao } from '@/lib/dados/planos'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import type { ContratoDetalhado, LinhaDimensao } from '@/lib/dados/tipos'
import { formatarData, VAZIO } from '@/lib/formato'
import { formatarMedia, oQueFaltaParaConcluir } from '@/lib/maturidade/regras'
import { TabelaPlanos } from '../../../planos/_componentes/tabela-planos'
import { AcoesAvaliacao } from './acoes-avaliacao'
import { PainelDocumentos } from '../../../documentos/_componentes/painel-documentos'
import { listarDocumentosLigados } from '@/lib/dados/documentos'

const apagado = (texto: string) => <Apagado>{texto}</Apagado>

/** O texto informado, ou o traço apagado. */
const ouTraco = (texto: string) => (texto.trim() ? texto : apagado(VAZIO))

/** Dimensão, nível, média e principal lacuna. A tabela rola dentro do painel em tela estreita (padrão 5). */
function TabelaNiveis({ dimensoes }: { dimensoes: LinhaDimensao[] }) {
  return (
    <Table className="table-fixed min-w-3xl">
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/4">Dimensão</TableHead>
          <TableHead className="w-1/4">Nível</TableHead>
          <TableHead className="w-1/8">Média</TableHead>
          <TableHead>Principal lacuna</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dimensoes.map((d) => (
          <TableRow key={d.dimensao}>
            <TableCell className="font-medium whitespace-normal break-words">{d.dimensao}</TableCell>
            <TableCell>
              <NivelMaturidade nivel={d.nivel} />
            </TableCell>
            <TableCell>{d.media === null ? apagado(VAZIO) : <Num>{formatarMedia(d.media)}</Num>}</TableCell>
            <TableCell className="whitespace-normal break-words">{ouTraco(d.lacuna)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/** O contrato de referência (F20): o código com link para o contrato, o contratante e os serviços. */
function ContratoDeReferencia({ contrato }: { contrato: ContratoDetalhado | null }) {
  if (!contrato) return apagado('Sem contrato de referência')
  return (
    <span>
      <LinkTexto href={`/contratos/${contrato.id}`}>
        <Num>{contrato.codigo}</Num>
      </LinkTexto>
      {` · ${contrato.contratante} · ${contrato.servicos.join(', ')}`}
    </span>
  )
}

/**
 * Página da avaliação de maturidade (parte 2, 5.9). Fora do vínculo ou com id que não existe, "não encontrado",
 * sem revelar que a avaliação existe. O que falta para concluir é calculado aqui, no servidor.
 */
export async function ConteudoAvaliacao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [usuario, avaliacao] = await Promise.all([obterUsuarioAtual(), obterAvaliacao(id)])
  if (!avaliacao) notFound()
  const [cliente, historico, contrato, planos] = await Promise.all([
    obterCliente(avaliacao.clienteId),
    listarHistorico('avaliacao', avaliacao.id),
    avaliacao.contratoId ? obterContrato(avaliacao.contratoId) : Promise.resolve(null),
    listarPlanosDaAvaliacao(avaliacao.id),
  ])
  if (!cliente) notFound()

  const nome = nomeDoCliente(cliente)

  const documentos = await listarDocumentosLigados({ avaliacaoId: avaliacao.id })
  return (
    <>
      <div className="mb-3">
        <LinkVoltar href={`/clientes/${cliente.id}?aba=maturidade`} rotulo={nome} />
      </div>
      <CabecalhoPagina
        titulo="Avaliação de maturidade"
        contexto={
          <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <LinkTexto
              href={`/clientes/${cliente.id}`}
            >
              {nome}
            </LinkTexto>
            <span aria-hidden="true">·</span>
            <Num>{formatarData(avaliacao.data)}</Num>
            <span aria-hidden="true">·</span>
            <EtiquetaStatus status={avaliacao.status} />
          </span>
        }
        acoes={
          <AcoesAvaliacao
            avaliacao={{ id: avaliacao.id, status: avaliacao.status }}
            faltando={oQueFaltaParaConcluir(avaliacao)}
            podeEditar={avaliacao.status === 'Em elaboração'}
            ehAdmin={ehAdmin(usuario)}
          />
        }
      />
      <div className="space-y-5">
        <Painel titulo="Resultado">
          <ListaCampos
            itens={[
              { rotulo: 'Maturidade geral', valor: <NivelMaturidade nivel={avaliacao.maturidadeGeral} /> },
              {
                rotulo: 'Prontidão',
                valor: avaliacao.prontidao ? <EtiquetaStatus status={avaliacao.prontidao} /> : null,
              },
              { rotulo: 'Avaliador', valor: avaliacao.nomeAvaliador },
              { rotulo: 'Data', valor: <Num>{formatarData(avaliacao.data)}</Num> },
              {
                rotulo: 'Contrato de referência',
                valor: <ContratoDeReferencia contrato={contrato} />,
              },
            ]}
          />
        </Painel>
        <Painel titulo="Níveis por dimensão" semRespiro>
          <TabelaNiveis dimensoes={avaliacao.dimensoes} />
        </Painel>
        <Painel titulo="Parecer">
          <ListaCampos
            itens={[
              { rotulo: 'Pontos fortes', valor: avaliacao.pontosFortes },
              { rotulo: 'Lacunas prioritárias', valor: avaliacao.lacunasPrioritarias },
              { rotulo: 'Recomendação ELO', valor: avaliacao.recomendacao },
            ]}
          />
        </Painel>
        <Painel titulo="Observações internas">
          <div className="space-y-2">
            <p className="text-secundario text-muted-foreground">Uso interno. Não sai na Visão Executiva nem no PDF.</p>
            <p className="text-sm text-foreground">{ouTraco(avaliacao.observacoesInternas)}</p>
          </div>
        </Painel>
        {/* O plano nasce no escopo e escolhe a avaliação de origem (DF-80, CA-20.7). */}
        <Painel titulo="Planos de desenvolvimento" semRespiro>
          <TabelaPlanos planos={planos} onde="avaliacao" vazio={<EstadoVazio titulo="Nenhum plano ligado a esta avaliação." />} />
        </Painel>
        <PainelDocumentos documentos={documentos} ligadoA={{ avaliacaoId: avaliacao.id }} vazio="Nenhum documento ligado a esta avaliação." />
        <PainelHistorico entradas={historico} />
        <LinhaAutoria entradas={historico} />
      </div>
    </>
  )
}
