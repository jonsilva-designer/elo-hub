import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { Button } from '@/components/ui/button'
import { obterEscopo } from '@/lib/dados/escopos'
import { listarAvaliacoesDoCliente } from '@/lib/dados/maturidade'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { escopoFechado } from '@/lib/escopos/regras'
import { MENSAGENS_PLANO } from '@/lib/planos/validacao'
import { FormularioPlano } from '../../_componentes/formulario-plano'

type Busca = Record<string, string | string[] | undefined>

const primeiro = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor)

/**
 * Novo plano de ação (parte 4, 5.6), do Administrador e da Equipe vinculada. O plano nasce no escopo do endereço
 * (`?escopo=`): sem ele, com um escopo que não existe ou fora do vínculo, "não encontrado". Escopo fechado não recebe
 * plano (RN-23).
 */
export async function ConteudoNovoPlano({ searchParams }: { searchParams: Promise<Busca> }) {
  const busca = await searchParams
  const escopoId = primeiro(busca.escopo)
  const escopo = escopoId ? await obterEscopo(escopoId) : null
  if (!escopo) notFound()

  const cabecalho = (
    <>
      <div className="mb-3">
        <LinkVoltar href={`/escopos/${escopo.id}`} rotulo={escopo.nome} />
      </div>
      <CabecalhoPagina titulo="Novo plano" />
    </>
  )
  if (escopoFechado(escopo.status)) {
    return (
      <>
        {cabecalho}
        <EstadoVazio
          titulo={MENSAGENS_PLANO.escopoFechado}
          acao={
            <Button asChild variant="outline">
              <Link href={`/escopos/${escopo.id}`}>Voltar ao escopo</Link>
            </Button>
          }
        />
      </>
    )
  }

  const [responsaveis, avaliacoes] = await Promise.all([
    listarResponsaveis(escopo.clienteId),
    listarAvaliacoesDoCliente(escopo.clienteId),
  ])
  return (
    <>
      {cabecalho}
      <FormularioPlano
        plano={null}
        escopo={{ id: escopo.id, nome: escopo.nome, nomeCliente: escopo.nomeCliente }}
        responsaveis={responsaveis.map((u) => ({ valor: u.id, rotulo: u.nome }))}
        avaliacoes={avaliacoes.map((a) => ({ id: a.id, data: a.data, status: a.status }))}
      />
    </>
  )
}
