import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { buttonVariants } from '@/components/ui/button'
import { nomeDoCliente } from '@/lib/clientes/filtros'
import { obterCliente } from '@/lib/dados/clientes'
import { listarAvaliadores, listarDimensoes } from '@/lib/dados/maturidade'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { FormularioAvaliacao } from '../../_componentes/formulario-avaliacao'

type Busca = Record<string, string | string[] | undefined>

const primeiro = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor)

/**
 * Nova avaliação do cliente do endereço, para o Administrador e a Equipe vinculada. Sem cliente, com cliente
 * que não existe ou fora do vínculo, "não encontrado". Cliente Inativo e cadastro da ELO não são avaliados.
 */
export async function ConteudoNovaAvaliacao({ searchParams }: { searchParams: Promise<Busca> }) {
  const id = primeiro((await searchParams).cliente)
  const [usuario, cliente] = await Promise.all([obterUsuarioAtual(), id ? obterCliente(id) : Promise.resolve(null)])
  if (!cliente) notFound()

  const voltar = (
    <Link href={`/clientes/${cliente.id}`} className={buttonVariants({ variant: 'outline' })}>
      Voltar ao cliente
    </Link>
  )
  let conteudo: React.ReactNode
  if (cliente.ehCadastroElo) {
    conteudo = <EstadoVazio titulo="O cadastro da ELO não tem avaliação de maturidade." acao={voltar} />
  } else if (cliente.status === 'Inativo') {
    conteudo = <EstadoVazio titulo="Este cliente está inativo. Reative o cliente para avaliar." acao={voltar} />
  } else {
    const [dimensoes, avaliadores] = await Promise.all([listarDimensoes(), listarAvaliadores(cliente.id)])
    conteudo = (
      <FormularioAvaliacao
        cliente={{ id: cliente.id, nome: nomeDoCliente(cliente) }}
        avaliacao={null}
        dimensoes={dimensoes}
        avaliadores={avaliadores}
        usuarioAtualId={usuario.id}
      />
    )
  }

  return (
    <>
      <div className="mb-3">
        <LinkVoltar href={`/clientes/${cliente.id}?aba=maturidade`} rotulo={nomeDoCliente(cliente)} />
      </div>
      <CabecalhoPagina titulo="Nova avaliação" />
      {conteudo}
    </>
  )
}
