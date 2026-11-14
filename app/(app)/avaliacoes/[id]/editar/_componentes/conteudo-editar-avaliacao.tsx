import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { buttonVariants } from '@/components/ui/button'
import { nomeDoCliente } from '@/lib/clientes/filtros'
import { obterCliente } from '@/lib/dados/clientes'
import { listarAvaliadores, obterAvaliacao } from '@/lib/dados/maturidade'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { MENSAGENS_AVALIACAO } from '@/lib/maturidade/validacao'
import { FormularioAvaliacao } from '../../../_componentes/formulario-avaliacao'

/**
 * Edição da avaliação Em elaboração, pelo Administrador ou pela Equipe vinculada. A Concluída não abre a
 * edição (RN-23). Fora do vínculo ou com id que não existe, "não encontrado".
 */
export async function ConteudoEditarAvaliacao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [usuario, avaliacao] = await Promise.all([obterUsuarioAtual(), obterAvaliacao(id)])
  if (!avaliacao) notFound()
  const cliente = await obterCliente(avaliacao.clienteId)
  if (!cliente) notFound()

  const conteudo =
    avaliacao.status === 'Concluída' ? (
      <EstadoVazio
        titulo={MENSAGENS_AVALIACAO.concluida}
        acao={
          <Link href={`/avaliacoes/${avaliacao.id}`} className={buttonVariants({ variant: 'outline' })}>
            Ver a avaliação
          </Link>
        }
      />
    ) : (
      <FormularioAvaliacao
        cliente={{ id: cliente.id, nome: nomeDoCliente(cliente) }}
        avaliacao={avaliacao}
        dimensoes={avaliacao.dimensoes.map((d) => d.dimensao)}
        avaliadores={await listarAvaliadores(cliente.id)}
        usuarioAtualId={usuario.id}
      />
    )

  return (
    <>
      <div className="mb-3">
        <LinkVoltar href={`/clientes/${cliente.id}?aba=maturidade`} rotulo={nomeDoCliente(cliente)} />
      </div>
      <CabecalhoPagina titulo="Editar avaliação" />
      {conteudo}
    </>
  )
}
