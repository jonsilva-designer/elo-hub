import { Pencil, Presentation } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { PainelHistorico } from '@/components/elo/painel-historico'
import { Button } from '@/components/ui/button'
import { abasDoCliente, abaValida, ROTULOS_DAS_ABAS, type AbaCliente } from '@/lib/clientes/abas'
import { nomeDoCliente } from '@/lib/clientes/filtros'
import { formatarCnpj } from '@/lib/cnpj'
import { listarDemandasDoCliente } from '@/lib/dados/demandas'
import { itensQueImpedemInativar, obterCliente, temItensLigados } from '@/lib/dados/clientes'
import { listarContratosDoCliente } from '@/lib/dados/contratos'
import { listarEscoposDoCliente } from '@/lib/dados/escopos'
import { listarHistorico } from '@/lib/dados/historico'
import { listarAvaliacoesDoCliente } from '@/lib/dados/maturidade'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { maturidadeDoCliente } from '@/lib/maturidade/regras'
import { TabelaDemandas } from '../../../central/_componentes/tabela-demandas'
import { VoltarParaClientes } from '../../_componentes/voltar-para-clientes'
import { AbaContratos } from './aba-contratos'
import { AbaEscopos } from './aba-escopos'
import { AbaMaturidade } from './aba-maturidade'
import { AcoesCliente } from './acoes-cliente'
import { AbaResumo } from './aba-resumo'
import { AbasCliente } from './abas-cliente'
import { PainelDocumentos } from '../../../documentos/_componentes/painel-documentos'
import { listarDocumentosLigados } from '@/lib/dados/documentos'

type Busca = Record<string, string | string[] | undefined>

const primeiro = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor)

/**
 * Página do cliente (parte 2, 5.6), o ponto central dos dados dele (DF-06). Fora do vínculo ou com id que
 * não existe, "não encontrado", sem revelar que o cliente existe. As partes 3 a 7 preenchem as outras abas; a
 * parte 3 já preencheu a de Contratos.
 */
export async function ConteudoCliente({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Busca>
}) {
  const [{ id }, busca] = await Promise.all([params, searchParams])
  const [usuario, cliente] = await Promise.all([obterUsuarioAtual(), obterCliente(id)])
  if (!cliente) notFound()

  // O cadastro da ELO não tem maturidade, contratos nem escopos (DF-40).
  const [avaliacoes, contratos, escopos, historico, demandas] = await Promise.all([
    cliente.ehCadastroElo ? Promise.resolve([]) : listarAvaliacoesDoCliente(cliente.id),
    cliente.ehCadastroElo ? Promise.resolve([]) : listarContratosDoCliente(cliente.id),
    cliente.ehCadastroElo ? Promise.resolve([]) : listarEscoposDoCliente(cliente.id),
    listarHistorico('cliente', cliente.id),
    listarDemandasDoCliente(cliente.id),
  ])
  const comparacao = maturidadeDoCliente(avaliacoes)
  const admin = ehAdmin(usuario)
  // Inativar, reativar e excluir: só o Administrador, e nunca no cadastro da ELO (DF-40).
  const comMenu = admin && !cliente.ehCadastroElo
  const [impedimentos, ligados] = comMenu
    ? await Promise.all([itensQueImpedemInativar(cliente.id), temItensLigados(cliente.id)])
    : [[], true]

  const documentos = await listarDocumentosLigados({ clienteId: cliente.id })
  const paineis: Record<AbaCliente, React.ReactNode> = {
    resumo: <AbaResumo cliente={cliente} atual={comparacao?.atual ?? null} historico={historico} />,
    maturidade: <AbaMaturidade cliente={cliente} avaliacoes={avaliacoes} comparacao={comparacao} />,
    contratos: <AbaContratos cliente={cliente} contratos={contratos} ehAdmin={admin} />,
    escopos: <AbaEscopos escopos={escopos} />,
    demandas: (
      <Painel titulo="Demandas" semRespiro>
        <TabelaDemandas demandas={demandas} vazio={<EstadoVazio titulo="Nenhuma demanda deste cliente." />} />
      </Painel>
    ),
    documentos: <PainelDocumentos documentos={documentos} ligadoA={{ clienteId: cliente.id }} vazio="Nenhum documento deste cliente." />,
    historico: <PainelHistorico entradas={historico} />,
  }

  return (
    <>
      <div className="mb-3">
        <VoltarParaClientes />
      </div>
      <CabecalhoPagina
        titulo={nomeDoCliente(cliente)}
        contexto={
          <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span>{cliente.razaoSocial}</span>
            <span aria-hidden="true">·</span>
            <Num>{formatarCnpj(cliente.cnpj)}</Num>
            <span aria-hidden="true">·</span>
            <EtiquetaStatus status={cliente.status} />
          </span>
        }
        acoes={
          <>
            {admin ? (
              <Button asChild variant="outline">
                <Link href={`/clientes/${cliente.id}/editar`}>
                  <Pencil aria-hidden="true" />
                  Editar
                </Link>
              </Button>
            ) : null}
            {/* O cadastro da ELO não tem carteira: sem Visão Executiva (DF-40). */}
            {cliente.ehCadastroElo ? null : (
              <Button asChild variant="outline">
                <Link href={`/clientes/${cliente.id}/visao-executiva`}>
                  <Presentation aria-hidden="true" />
                  Visão Executiva
                </Link>
              </Button>
            )}
            {comMenu ? <AcoesCliente cliente={cliente} impedimentos={impedimentos} podeExcluir={!ligados} /> : null}
          </>
        }
      />
      <AbasCliente
        abas={abasDoCliente(cliente).map((a) => ({ valor: a, rotulo: ROTULOS_DAS_ABAS[a] }))}
        inicial={abaValida(primeiro(busca.aba), cliente)}
        paineis={paineis}
      />
    </>
  )
}
