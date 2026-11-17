import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { Button } from '@/components/ui/button'
import { MENSAGENS_ATIVIDADE } from '@/lib/atividades/validacao'
import { obterPlano } from '@/lib/dados/planos'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { planoFechado } from '@/lib/planos/regras'
import { FormularioAtividade } from '../../_componentes/formulario-atividade'

type Busca = Record<string, string | string[] | undefined>

const primeiro = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor)

/**
 * Nova atividade (parte 4, 5.7), do Administrador e da Equipe vinculada. A atividade nasce no plano do endereço
 * (`?plano=`): sem ele, com um plano que não existe ou fora do vínculo, "não encontrado". Plano fechado não recebe
 * atividade (RN-23).
 */
export async function ConteudoNovaAtividade({ searchParams }: { searchParams: Promise<Busca> }) {
  const [usuario, busca] = await Promise.all([obterUsuarioAtual(), searchParams])
  const planoId = primeiro(busca.plano)
  const plano = planoId ? await obterPlano(planoId) : null
  if (!plano) notFound()

  const cabecalho = (
    <>
      <div className="mb-3">
        <LinkVoltar href={`/planos/${plano.id}`} rotulo={plano.nome} />
      </div>
      <CabecalhoPagina titulo="Nova atividade" />
    </>
  )
  if (planoFechado(plano.status)) {
    return (
      <>
        {cabecalho}
        <EstadoVazio
          titulo={MENSAGENS_ATIVIDADE.planoFechado}
          acao={
            <Button asChild variant="outline">
              <Link href={`/planos/${plano.id}`}>Voltar ao plano</Link>
            </Button>
          }
        />
      </>
    )
  }

  const responsaveis = await listarResponsaveis(plano.clienteId)
  return (
    <>
      {cabecalho}
      <FormularioAtividade
        atividade={null}
        plano={{ id: plano.id, nome: plano.nome, nomeCliente: plano.nomeCliente }}
        perfil={usuario.perfil}
        responsaveis={responsaveis.map((u) => ({ valor: u.id, rotulo: u.nome }))}
        origem={null}
      />
    </>
  )
}
