import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { ListaCampos } from '@/components/elo/lista-campos'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import type { TextoExecutivo } from '@/lib/dados/tipos'
import { obterVisaoExecutiva } from '@/lib/dados/visao-executiva'
import { formatarData, formatarDataHora } from '@/lib/formato'
import {
  TabelaDemandasDaVisao,
  TabelaEscoposDaVisao,
  TabelaItensDaVisao,
  TabelaJornadaDaVisao,
  TabelaMaturidadeDaVisao,
  TabelaPendentesDaVisao,
  TabelaPlanosDaVisao,
} from './blocos-visao'
import { EditarTexto } from './editar-texto'
import { FiltroContrato } from './filtro-contrato'
import { TelaCheia } from './tela-cheia'

type Busca = Record<string, string | string[] | undefined>

const primeiro = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor)

/** Um dos três textos do cliente, com quem atualizou e quando, e o Editar (CA-14.7). */
function Texto({ clienteId, texto }: { clienteId: string; texto: TextoExecutivo }) {
  return (
    <Painel
      titulo={texto.titulo}
      acao={<EditarTexto clienteId={clienteId} campo={texto.campo} titulo={texto.titulo} texto={texto.texto} />}
    >
      {texto.texto ? (
        <div className="space-y-2">
          <p className="whitespace-pre-line text-sm text-foreground">{texto.texto}</p>
          {texto.atualizadoEm ? (
            <p className="text-secundario text-muted-foreground">
              Atualizado por {texto.atualizadoPor} em <Num>{formatarDataHora(texto.atualizadoEm)}</Num>
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Ainda não escrito.</p>
      )}
    </Painel>
  )
}

/**
 * A Visão Executiva do cliente (parte 7, 4.4; F14): os blocos da tabela de origem de F14 (DF-82), montados sozinhos a
 * partir dos registros (CA-14.1), com o filtro por contrato (CA-14.6) e a tela cheia para a projeção (CA-14.2). A
 * leitura já deixa de fora o que não pode ir para o cliente (CA-14.5). Fora do vínculo, no cadastro da ELO ou com id
 * que não existe, "não encontrado" (CA-14.4).
 */
export async function ConteudoVisaoExecutiva({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Busca>
}) {
  const [{ id }, busca] = await Promise.all([params, searchParams])
  const visao = await obterVisaoExecutiva(id, primeiro(busca.contrato) ?? null)
  if (!visao) notFound()

  const porStatus = visao.demandas.porStatus.filter((s) => s.total > 0)
  return (
    <>
      <div className="mb-3">
        <LinkVoltar href={`/clientes/${visao.cliente.id}`} rotulo={visao.cliente.nome} />
      </div>
      <CabecalhoPagina
        titulo="Visão Executiva"
        contexto={
          <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span className="font-medium text-foreground">{visao.cliente.nome}</span>
            <span aria-hidden="true">·</span>
            <span>
              Emitida em <Num>{formatarData(visao.hoje)}</Num>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {visao.textosAtualizadosEm ? (
                <>
                  Textos atualizados em <Num>{formatarData(visao.textosAtualizadosEm)}</Num>
                </>
              ) : (
                'Textos ainda não escritos'
              )}
            </span>
          </span>
        }
        acoes={
          <>
            <FiltroContrato clienteId={visao.cliente.id} contratoId={visao.contrato?.id ?? null} contratos={visao.contratos} />
            <TelaCheia />
          </>
        }
      />
      <div className="space-y-5">
        <Painel titulo="Escopos e situação atual" semRespiro>
          <TabelaEscoposDaVisao escopos={visao.escopos} />
        </Painel>
        <Painel titulo="Jornada ELO" semRespiro>
          <TabelaJornadaDaVisao escopos={visao.escopos} />
        </Painel>
        <Painel titulo="Planos de ação" semRespiro>
          <TabelaPlanosDaVisao planos={visao.planos} />
        </Painel>
        <Painel titulo="Atividades pendentes" semRespiro>
          <TabelaPendentesDaVisao planos={visao.planos} />
        </Painel>
        <Painel titulo="Demandas" semRespiro>
          {porStatus.length > 0 ? (
            <div className="border-b border-divisoria px-5 py-4">
              <ListaCampos itens={porStatus.map((s) => ({ rotulo: s.status, valor: <Num>{s.total}</Num> }))} />
            </div>
          ) : null}
          <TabelaDemandasDaVisao demandas={visao.demandas.abertas} />
        </Painel>
        <div className="grid gap-5 lg:grid-cols-3">
          <Painel titulo="Entregas realizadas" semRespiro>
            <TabelaItensDaVisao itens={visao.entregas} vazio="Nenhuma entrega nos últimos 30 dias." />
          </Painel>
          <Painel titulo="Próximos prazos" semRespiro>
            <TabelaItensDaVisao itens={visao.proximosPrazos} vazio="Nenhum prazo nos próximos 30 dias." />
          </Painel>
          <Painel titulo="Pendências" semRespiro>
            <TabelaItensDaVisao itens={visao.pendencias} vazio="Nenhuma pendência." />
          </Painel>
        </div>
        <Painel titulo="Maturidade" semRespiro>
          {visao.maturidade ? (
            <TabelaMaturidadeDaVisao maturidade={visao.maturidade} />
          ) : (
            <EstadoVazio titulo="Nenhuma avaliação de maturidade concluída." />
          )}
        </Painel>
        {visao.textos.map((t) => (
          <Texto key={t.campo} clienteId={visao.cliente.id} texto={t} />
        ))}
      </div>
    </>
  )
}
