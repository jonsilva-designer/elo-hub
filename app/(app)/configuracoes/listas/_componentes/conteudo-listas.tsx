import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { listarItensDaLista } from '@/lib/dados/listas-configuracao'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { ehLista } from '@/lib/listas/regras'
import { AbasConfiguracoes } from '../../_componentes/abas-configuracoes'
import { TelaListas } from './tela-listas'

type Busca = Record<string, string | string[] | undefined>

/** As listas oficiais (parte 8, 4.2): só o Administrador; a lista vem do endereço (`?lista=`), e serviços sem ela. */
export async function ConteudoListas({ searchParams }: { searchParams: Promise<Busca> }) {
  const usuario = await obterUsuarioAtual()
  if (!ehAdmin(usuario)) {
    return (
      <>
        <CabecalhoPagina titulo="Configurações" />
        <AcessoNegado />
      </>
    )
  }
  const pedida = (await searchParams).lista
  const lista = typeof pedida === 'string' && ehLista(pedida) ? pedida : 'servicos'
  return (
    <>
      <CabecalhoPagina titulo="Configurações" />
      <AbasConfiguracoes />
      <TelaListas key={lista} lista={lista} itens={await listarItensDaLista(lista)} />
    </>
  )
}
