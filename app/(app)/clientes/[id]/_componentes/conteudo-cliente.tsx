import { Pencil } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BotaoBloqueado } from '@/components/elo/botao-bloqueado'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { PainelHistorico } from '@/components/elo/painel-historico'
import { Button } from '@/components/ui/button'
import { abasDoCliente, abaValida, ROTULOS_DAS_ABAS, type AbaCliente } from '@/lib/clientes/abas'
import { nomeDoCliente } from '@/lib/clientes/filtros'
import { formatarCnpj } from '@/lib/cnpj'
import { itensQueImpedemInativar, obterCliente, temItensLigados } from '@/lib/dados/clientes'
import { listarContratosDoCliente } from '@/lib/dados/contratos'
import { listarHistorico } from '@/lib/dados/historico'
import { listarAvaliacoesDoCliente } from '@/lib/dados/maturidade'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { maturidadeDoCliente } from '@/lib/maturidade/regras'
import { VoltarParaClientes } from '../../_componentes/voltar-para-clientes'
import { AbaContratos } from './aba-contratos'
import { AbaMaturidade } from './aba-maturidade'
import { AcoesCliente } from './acoes-cliente'
import { AbaResumo } from './aba-resumo'
import { AbasCliente } from './abas-cliente'

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

  // O cadastro da ELO não tem maturidade nem contratos (DF-40).
  const [avaliacoes, contratos, historico] = await Promise.all([
    cliente.ehCadastroElo ? Promise.resolve([]) : listarAvaliacoesDoCliente(cliente.id),
    cliente.ehCadastroElo ? Promise.resolve([]) : listarContratosDoCliente(cliente.id),
    listarHistorico('cliente', cliente.id),
  ])
  const comparacao = maturidadeDoCliente(avaliacoes)
  const admin = ehAdmin(usuario)
  // Inativar, reativar e excluir: só o Administrador, e nunca no cadastro da ELO (DF-40).
  const comMenu = admin && !cliente.ehCadastroElo
  const [impedimentos, ligados] = comMenu
    ? await Promise.all([itensQueImpedemInativar(cliente.id), temItensLigados(cliente.id)])
    : [[], true]

  const paineis: Record<AbaCliente, React.ReactNode> = {
    resumo: <AbaResumo cliente={cliente} atual={comparacao?.atual ?? null} historico={historico} />,
    maturidade: <AbaMaturidade cliente={cliente} avaliacoes={avaliacoes} comparacao={comparacao} />,
    contratos: <AbaContratos cliente={cliente} contratos={contratos} ehAdmin={admin} />,
    escopos: <EstadoVazio titulo="Nenhum escopo deste cliente." />,
    demandas: <EstadoVazio titulo="Nenhuma demanda deste cliente." />,
    documentos: <EstadoVazio titulo="Nenhum documento deste cliente." />,
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
            {cliente.ehCadastroElo ? null : (
              <BotaoBloqueado variant="outline" motivo="A Visão Executiva entra numa próxima parte do protótipo.">
                Visão Executiva
              </BotaoBloqueado>
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
