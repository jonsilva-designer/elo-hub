import { Pencil, Plus } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BotaoBloqueado } from '@/components/elo/botao-bloqueado'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaPlanejamento, EtiquetaStatus } from '@/components/elo/etiquetas'
import { IndicadorVigencia } from '@/components/elo/indicador-vigencia'
import { ListaCampos } from '@/components/elo/lista-campos'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { LinhaAutoria, PainelHistorico } from '@/components/elo/painel-historico'
import { Apagado, LinkTexto } from '@/components/elo/textos'
import { Button } from '@/components/ui/button'
import { contratoFechado, ehPlanejamento } from '@/lib/contratos/regras'
import { contratoTemItensLigados, obterContrato } from '@/lib/dados/contratos'
import { listarEscoposDoContrato } from '@/lib/dados/escopos'
import { impedimentosDoContrato } from '@/lib/dados/impedimentos'
import { listarHistorico } from '@/lib/dados/historico'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import type { ContratoDetalhado } from '@/lib/dados/tipos'
import { formatarData, formatarReal } from '@/lib/formato'
import { VoltarParaContratos } from '../../_componentes/voltar-para-contratos'
import { AcoesContrato } from './acoes-contrato'
import { TabelaEscopos } from './tabela-escopos'
import { PainelDocumentos } from '../../../documentos/_componentes/painel-documentos'
import { documentoPrincipalDoContrato, listarDocumentosLigados } from '@/lib/dados/documentos'

const apagado = (texto: string) => <Apagado>{texto}</Apagado>

const naoInformado = apagado('Não informado')

const ou = (valor: string) => (valor.trim() ? valor : naoInformado)

const data = (valor: string | null) => (valor ? <Num>{formatarData(valor)}</Num> : naoInformado)

/** O status da vigência com o término e os dias, e os campos da vigência (F04). */
function Vigencia({ contrato }: { contrato: ContratoDetalhado }) {
  if (ehPlanejamento(contrato.status)) {
    return <p className="text-sm text-muted-foreground">Sem vigência enquanto o contrato não está Ativo.</p>
  }
  const indeterminado = contrato.tipoVigencia === 'Prazo indeterminado'
  return (
    <div className="space-y-4">
      <IndicadorVigencia vigencia={contrato.vigencia} termino={contrato.termino} tipoVigencia={contrato.tipoVigencia} />
      <ListaCampos
        itens={[
          { rotulo: 'Tipo de vigência', valor: contrato.tipoVigencia },
          { rotulo: 'Início', valor: data(contrato.inicio) },
          { rotulo: 'Término', valor: indeterminado ? apagado('Sem data de término') : data(contrato.termino) },
        ]}
      />
    </div>
  )
}

/**
 * Página do contrato (parte 3, 5.6). Fora do vínculo ou com id que não existe, "não encontrado", sem revelar que o
 * contrato existe. Só o Administrador edita e tem o menu de ações; a Equipe vinculada só lê.
 */
export async function ConteudoContrato({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [usuario, contrato] = await Promise.all([obterUsuarioAtual(), obterContrato(id)])
  if (!contrato) notFound()
  const [escopos, historico] = await Promise.all([
    listarEscoposDoContrato(contrato.id),
    listarHistorico('contrato', contrato.id),
  ])
  const admin = ehAdmin(usuario)
  // Encerrar, cancelar, reabrir e excluir: só o Administrador. Os escopos abertos impedem fechar (RN-18).
  const [impedimentos, ligados] = admin
    ? await Promise.all([impedimentosDoContrato(contrato.id), contratoTemItensLigados(contrato.id)])
    : [[], true]

  const [documentos, principal] = await Promise.all([
    listarDocumentosLigados({ contratoId: contrato.id }),
    documentoPrincipalDoContrato(contrato.id),
  ])
  return (
    <>
      <div className="mb-3">
        <VoltarParaContratos />
      </div>
      <CabecalhoPagina
        titulo={<Num>{contrato.codigo}</Num>}
        contexto={
          <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <LinkTexto
              href={`/clientes/${contrato.clienteId}`}
            >
              {contrato.nomeCliente}
            </LinkTexto>
            <span aria-hidden="true">·</span>
            <span>{contrato.contratante}</span>
            <span aria-hidden="true">·</span>
            <EtiquetaStatus status={contrato.status} />
            {ehPlanejamento(contrato.status) ? <EtiquetaPlanejamento /> : null}
          </span>
        }
        acoes={
          admin ? (
            <>
              <Button asChild variant="outline">
                <Link href={`/contratos/${contrato.id}/editar`}>
                  <Pencil aria-hidden="true" />
                  Editar
                </Link>
              </Button>
              <AcoesContrato contrato={contrato} impedimentos={impedimentos} podeExcluir={!ligados} />
            </>
          ) : null
        }
      />
      <div className="space-y-5">
        <Painel titulo="Vigência">
          <Vigencia contrato={contrato} />
        </Painel>
        <Painel titulo="Dados do contrato">
          <ListaCampos
            itens={[
              { rotulo: 'Objeto', valor: ou(contrato.objeto) },
              { rotulo: 'Serviços', valor: ou(contrato.servicos.join(', ')) },
              { rotulo: 'Responsável ELO', valor: ou(contrato.nomeResponsavel) },
              { rotulo: 'Valor', valor: contrato.valor === null ? naoInformado : <Num>{formatarReal(contrato.valor)}</Num> },
              { rotulo: 'Data da proposta', valor: data(contrato.dataProposta) },
              {
                rotulo: 'Documento principal',
                valor: principal ? (
                  <LinkTexto href={`/documentos/${principal.id}`}>
                    {principal.nome}
                  </LinkTexto>
                ) : (
                  apagado('Nenhum documento')
                ),
              },
              { rotulo: 'Observações', valor: ou(contrato.observacoes) },
            ]}
          />
        </Painel>
        <Painel
          titulo="Escopos"
          acao={
            !admin ? null : contratoFechado(contrato.status) ? (
              // Contrato fechado não recebe escopo novo (RN-23).
              <BotaoBloqueado variant="outline" motivo="Contrato fechado: reabra o contrato para cadastrar escopos">
                <Plus aria-hidden="true" />
                Novo escopo
              </BotaoBloqueado>
            ) : (
              <Button asChild variant="outline">
                <Link href={`/escopos/novo?contrato=${contrato.id}`}>
                  <Plus aria-hidden="true" />
                  Novo escopo
                </Link>
              </Button>
            )
          }
          semRespiro
        >
          <TabelaEscopos escopos={escopos} vazio={<EstadoVazio titulo="Nenhum escopo neste contrato." />} />
        </Painel>
        <PainelDocumentos documentos={documentos} ligadoA={{ contratoId: contrato.id }} vazio="Nenhum documento ligado a este contrato." />
        <PainelHistorico entradas={historico} />
        <LinhaAutoria entradas={historico} />
      </div>
    </>
  )
}
