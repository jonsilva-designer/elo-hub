import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado, EstadoVazio } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { Num } from '@/components/elo/num'
import { Button } from '@/components/ui/button'
import { contratoFechado } from '@/lib/contratos/regras'
import { obterContrato } from '@/lib/dados/contratos'
import { listarEscoposDoCliente } from '@/lib/dados/escopos'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { MENSAGENS_ESCOPO } from '@/lib/escopos/validacao'
import { FormularioEscopo } from '../../_componentes/formulario-escopo'

type Busca = Record<string, string | string[] | undefined>

const primeiro = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor)

/**
 * Novo escopo (parte 3, 5.8), só do Administrador. O escopo nasce no contrato do endereço (`?contrato=`): sem ele,
 * com um contrato que não existe ou fora do vínculo, "não encontrado". Contrato fechado não recebe escopo (RN-23).
 */
export async function ConteudoNovoEscopo({ searchParams }: { searchParams: Promise<Busca> }) {
  const [usuario, busca] = await Promise.all([obterUsuarioAtual(), searchParams])
  const contratoId = primeiro(busca.contrato)
  const contrato = contratoId ? await obterContrato(contratoId) : null
  if (!contrato) notFound()

  const cabecalho = (
    <>
      <div className="mb-3">
        <LinkVoltar href={`/contratos/${contrato.id}`} rotulo={<Num>{contrato.codigo}</Num>} />
      </div>
      <CabecalhoPagina titulo="Novo escopo" />
    </>
  )
  if (!ehAdmin(usuario)) {
    return (
      <>
        {cabecalho}
        <AcessoNegado />
      </>
    )
  }
  if (contratoFechado(contrato.status)) {
    return (
      <>
        {cabecalho}
        <EstadoVazio
          titulo={MENSAGENS_ESCOPO.contratoFechado}
          acao={
            <Button asChild variant="outline">
              <Link href={`/contratos/${contrato.id}`}>Voltar ao contrato</Link>
            </Button>
          }
        />
      </>
    )
  }

  const [responsaveis, escopos] = await Promise.all([
    listarResponsaveis(contrato.clienteId),
    listarEscoposDoCliente(contrato.clienteId),
  ])
  return (
    <>
      {cabecalho}
      <FormularioEscopo
        escopo={null}
        contrato={{ id: contrato.id, codigo: contrato.codigo, nomeCliente: contrato.nomeCliente }}
        responsaveis={responsaveis.map((u) => ({ valor: u.id, rotulo: u.nome }))}
        ciclos={escopos.map((e) => ({ valor: e.id, rotulo: e.nome }))}
      />
    </>
  )
}
