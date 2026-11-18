import { Download, FilePlus2, Pencil } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { ListaCampos } from '@/components/elo/lista-campos'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { LinhaAutoria, PainelHistorico } from '@/components/elo/painel-historico'
import { Button } from '@/components/ui/button'
import { documentoTemLigacao, obterDocumento, substitutosPossiveis, usuarioAlteraDocumento } from '@/lib/dados/documentos'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarHistorico } from '@/lib/dados/historico'
import type { DocumentoDetalhado } from '@/lib/dados/tipos'
import { formatarData, formatarTamanho } from '@/lib/formato'
import { VoltarParaDocumentos } from '../../_componentes/voltar-para-documentos'
import { AcoesDocumento } from './acoes-documento'
import { TextoComNumeros } from '../../_componentes/texto-com-numeros'

const CLASSE_LINK = 'rounded-sm text-primary underline-offset-4 hover:underline'

const naoInformado = <span className="font-normal text-muted-foreground">Não informado</span>

const link = (href: string, texto: string) => (
  <Link href={href} className={CLASSE_LINK}>
    <TextoComNumeros texto={texto} />
  </Link>
)

/** Os campos do painel Dados (F12): as datas, quem incluiu, o arquivo e as observações. */
function camposDoDocumento(d: DocumentoDetalhado): { rotulo: string; valor: ReactNode }[] {
  return [
    { rotulo: 'Data do documento', valor: <Num>{formatarData(d.data)}</Num> },
    { rotulo: 'Incluído em', valor: <Num>{formatarData(d.incluidoEm)}</Num> },
    { rotulo: 'Responsável pelo upload', valor: d.nomeIncluidoPor },
    {
      rotulo: 'Arquivo',
      valor: (
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span>{d.arquivo.nome}</span>
          <Num className="text-muted-foreground">{formatarTamanho(d.arquivo.tamanho)}</Num>
        </span>
      ),
    },
    { rotulo: 'Observações', valor: d.observacoes.trim() || naoInformado },
  ]
}

/** Os vínculos do documento, só os preenchidos, cada um com o link do registro (CA-12.3, RN-02). */
function vinculosDoDocumento(d: DocumentoDetalhado): { rotulo: string; valor: ReactNode }[] {
  const itens: { rotulo: string; valor: ReactNode }[] = [
    {
      rotulo: 'Cliente',
      valor: d.clienteId && d.nomeCliente ? link(`/clientes/${d.clienteId}`, d.nomeCliente) : naoInformado,
    },
  ]
  if (!d.clienteId) itens[0].valor = <span className="font-normal text-muted-foreground">Sem cliente</span>
  if (d.especialistaId && d.nomeEspecialista) {
    itens.push({ rotulo: 'Especialista', valor: link(`/especialistas/${d.especialistaId}`, d.nomeEspecialista) })
  }
  if (d.contratoId && d.codigoContrato) {
    itens.push({ rotulo: 'Contrato', valor: link(`/contratos/${d.contratoId}`, d.codigoContrato) })
  }
  if (d.escopoId && d.nomeEscopo) itens.push({ rotulo: 'Escopo', valor: link(`/escopos/${d.escopoId}`, d.nomeEscopo) })
  if (d.etapa) itens.push({ rotulo: 'Etapa da Jornada', valor: d.etapa })
  if (d.planoId && d.nomePlano) itens.push({ rotulo: 'Plano de ação', valor: link(`/planos/${d.planoId}`, d.nomePlano) })
  if (d.atividadeId && d.nomeAtividade) {
    itens.push({ rotulo: 'Atividade', valor: link(`/atividades/${d.atividadeId}/editar`, d.nomeAtividade) })
  }
  if (d.demandaNumero && d.assuntoDemanda) {
    itens.push({ rotulo: 'Demanda', valor: link(`/central/${d.demandaNumero}`, `${d.demandaNumero} · ${d.assuntoDemanda}`) })
  }
  if (d.avaliacaoId && d.dataAvaliacao) {
    itens.push({
      rotulo: 'Avaliação de maturidade',
      valor: link(`/avaliacoes/${d.avaliacaoId}`, `Avaliação de ${formatarData(d.dataAvaliacao)}`),
    })
  }
  return itens
}

/** A ligação de substituição nos dois sentidos (DF-13, RN-15). */
function Versoes({ documento }: { documento: DocumentoDetalhado }) {
  const itens: { rotulo: string; valor: ReactNode }[] = []
  if (documento.substituidoPor) {
    itens.push({
      rotulo: 'Substituído por',
      valor: link(`/documentos/${documento.substituidoPor.id}`, documento.substituidoPor.nome),
    })
  }
  if (documento.substitui.length > 0) {
    itens.push({
      rotulo: 'Substitui',
      valor: (
        <span className="flex flex-col gap-1">
          {documento.substitui.map((s) => (
            <span key={s.id}>{link(`/documentos/${s.id}`, s.nome)}</span>
          ))}
        </span>
      ),
    })
  }
  return itens.length > 0 ? <ListaCampos itens={itens} /> : <EstadoVazio titulo="Nenhuma outra versão." />
}

/**
 * Página do documento (parte 6, 4.4; F12, UC-15). O documento de cliente fora do vínculo, ou que não existe, dá "não
 * encontrado" (CA-12.5); o Documento do Especialista sem cliente abre para todos (DF-65). Baixar passa pela rota do
 * arquivo, que confere o acesso de novo. Editar e Enviar nova versão para quem pode alterar; a nova versão só no
 * Vigente (DF-44). O menu do Administrador fica com status, inativação e exclusão.
 */
export async function ConteudoDocumento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [usuario, documento] = await Promise.all([obterUsuarioAtual(), obterDocumento(id)])
  if (!documento) notFound()
  const [historico, podeAlterar] = await Promise.all([listarHistorico('documento', documento.id), usuarioAlteraDocumento(documento)])
  const recebeNovaVersao = podeAlterar && documento.status === 'Vigente' && !documento.inativo
  // O menu do Administrador: os substitutos possíveis e se a exclusão vale (CA-12.6, DF-33).
  const admin = ehAdmin(usuario)
  const [substitutos, ligado] = admin
    ? await Promise.all([substitutosPossiveis(documento.id), documentoTemLigacao(documento.id)])
    : [[], true]

  return (
    <>
      <div className="mb-3">
        <VoltarParaDocumentos />
      </div>
      <CabecalhoPagina
        titulo={documento.nome}
        contexto={
          <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span>{documento.categoria}</span>
            <span aria-hidden="true">·</span>
            <EtiquetaStatus status={documento.status} />
            {documento.inativo ? <EtiquetaStatus status="Inativo" /> : null}
          </span>
        }
        acoes={
          <>
            <Button asChild variant="outline">
              <a href={`/api/documentos/${documento.id}/arquivo`} download>
                <Download aria-hidden="true" />
                Baixar
              </a>
            </Button>
            {podeAlterar ? (
              <Button asChild variant="outline">
                <Link href={`/documentos/${documento.id}/editar`}>
                  <Pencil aria-hidden="true" />
                  Editar
                </Link>
              </Button>
            ) : null}
            {recebeNovaVersao ? (
              <Button asChild variant="outline">
                <Link href={`/documentos/novo?substitui=${documento.id}`}>
                  <FilePlus2 aria-hidden="true" />
                  Enviar nova versão
                </Link>
              </Button>
            ) : null}
            {admin ? (
              <AcoesDocumento
                documentoId={documento.id}
                status={documento.status}
                inativo={documento.inativo}
                substitutos={substitutos}
                podeExcluir={!ligado}
              />
            ) : null}
          </>
        }
      />
      <div className="space-y-5">
        <Painel titulo="Dados">
          <ListaCampos itens={camposDoDocumento(documento)} />
        </Painel>
        <Painel titulo="Vínculos">
          <ListaCampos itens={vinculosDoDocumento(documento)} />
        </Painel>
        <Painel titulo="Versões">
          <Versoes documento={documento} />
        </Painel>
        <PainelHistorico entradas={historico} />
        <LinhaAutoria entradas={historico} />
      </div>
    </>
  )
}
