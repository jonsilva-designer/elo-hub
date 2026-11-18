import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { Num } from '@/components/elo/num'
import { obterContrato } from '@/lib/dados/contratos'
import { listarContratantes, listarServicos } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { FormularioContrato } from '../../../_componentes/formulario-contrato'
import { documentoPrincipalDoContrato, documentosPrincipaisPossiveis } from '@/lib/dados/documentos'

/**
 * Edição do contrato, só do Administrador. Fora do vínculo ou com id que não existe, "não encontrado", sem revelar
 * que o contrato existe. A Equipe vinculada vê o acesso negado (parte 3, 5.1).
 */
export async function ConteudoEditarContrato({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [usuario, contrato] = await Promise.all([obterUsuarioAtual(), obterContrato(id)])
  if (!contrato) notFound()

  const cabecalho = (
    <>
      <div className="mb-3">
        <LinkVoltar href={`/contratos/${contrato.id}`} rotulo={<Num>{contrato.codigo}</Num>} />
      </div>
      <CabecalhoPagina titulo="Editar contrato" />
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

  const [contratantes, servicos, responsaveis, possiveis, principal] = await Promise.all([
    listarContratantes(),
    listarServicos(),
    listarResponsaveis(contrato.clienteId),
    documentosPrincipaisPossiveis(contrato.id),
    documentoPrincipalDoContrato(contrato.id),
  ])
  return (
    <>
      {cabecalho}
      <FormularioContrato
        contrato={contrato}
        clienteInicial={null}
        clientes={[]}
        responsaveisPorCliente={{ [contrato.clienteId]: responsaveis.map((u) => ({ valor: u.id, rotulo: u.nome })) }}
        contratantes={contratantes}
        servicos={servicos}
        documentos={{ opcoes: possiveis.map((d) => ({ valor: d.id, rotulo: d.nome })), principal: principal?.id ?? '' }}
      />
    </>
  )
}
