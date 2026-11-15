import { Pencil } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { ehPlanejamento } from '@/lib/contratos/regras'
import { obterContrato } from '@/lib/dados/contratos'
import { listarEscoposDoContrato } from '@/lib/dados/escopos'
import { listarHistorico } from '@/lib/dados/historico'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import type { ContratoDetalhado } from '@/lib/dados/tipos'
import { formatarData, formatarReal } from '@/lib/formato'
import { VoltarParaContratos } from '../../_componentes/voltar-para-contratos'
import { TabelaEscopos } from './tabela-escopos'

const apagado = (texto: string) => <span className="font-normal text-muted-foreground">{texto}</span>

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
 * contrato existe. Só o Administrador edita; a Equipe vinculada só lê.
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

  return (
    <>
      <div className="mb-3">
        <VoltarParaContratos />
      </div>
      <CabecalhoPagina
        titulo={<Num>{contrato.codigo}</Num>}
        contexto={
          <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <Link
              href={`/clientes/${contrato.clienteId}`}
              className="rounded-sm text-primary underline-offset-4 hover:underline"
            >
              {contrato.nomeCliente}
            </Link>
            <span aria-hidden="true">·</span>
            <span>{contrato.contratante}</span>
            <span aria-hidden="true">·</span>
            <EtiquetaStatus status={contrato.status} />
            {ehPlanejamento(contrato.status) ? <EtiquetaPlanejamento /> : null}
          </span>
        }
        acoes={
          admin ? (
            <Button asChild variant="outline">
              <Link href={`/contratos/${contrato.id}/editar`}>
                <Pencil aria-hidden="true" />
                Editar
              </Link>
            </Button>
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
              { rotulo: 'Documento principal', valor: apagado('Nenhum documento') },
              { rotulo: 'Observações', valor: ou(contrato.observacoes) },
            ]}
          />
        </Painel>
        <Painel
          titulo="Escopos"
          acao={
            admin ? (
              <BotaoBloqueado variant="outline" motivo="O cadastro de escopos entra na próxima etapa da parte 3.">
                Novo escopo
              </BotaoBloqueado>
            ) : null
          }
          semRespiro
        >
          <TabelaEscopos escopos={escopos} vazio={<EstadoVazio titulo="Nenhum escopo neste contrato." />} />
        </Painel>
        <Painel titulo="Documentos">
          <EstadoVazio titulo="Nenhum documento ligado a este contrato." />
        </Painel>
        <PainelHistorico entradas={historico} />
        <LinhaAutoria entradas={historico} />
      </div>
    </>
  )
}
