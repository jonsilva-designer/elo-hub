import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { obterDocumento, usuarioAlteraDocumento } from '@/lib/dados/documentos'
import { listarCategoriasDeDocumento } from '@/lib/dados/listas'
import { opcoesDeVinculoDoDocumento } from '@/lib/dados/opcoes-documento'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import type { DadosDocumento } from '@/lib/documentos/validacao'
import { FormularioDocumento } from '../../../_componentes/formulario-documento'

/**
 * Edição do documento (parte 6, 4.2; matriz 4.3): nome, categoria, vínculos e observações. Fora do acesso ou com id
 * que não existe, "não encontrado" (CA-12.5). A Equipe no Documento do Especialista sem cliente vê o acesso negado
 * (DF-65).
 */
export async function ConteudoEditarDocumento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [usuario, documento] = await Promise.all([obterUsuarioAtual(), obterDocumento(id)])
  if (!documento) notFound()

  const cabecalho = (
    <>
      <div className="mb-3">
        <LinkVoltar href={`/documentos/${documento.id}`} rotulo={documento.nome} />
      </div>
      <CabecalhoPagina titulo="Editar documento" />
    </>
  )
  if (!(await usuarioAlteraDocumento(documento))) {
    return (
      <>
        {cabecalho}
        <AcessoNegado />
      </>
    )
  }

  const [categorias, opcoes] = await Promise.all([listarCategoriasDeDocumento(), opcoesDeVinculoDoDocumento()])
  const inicial: DadosDocumento = {
    id: documento.id,
    nome: documento.nome,
    categoria: documento.categoria,
    clienteId: documento.clienteId ?? '',
    especialistaId: documento.especialistaId ?? '',
    contratoId: documento.contratoId ?? '',
    escopoId: documento.escopoId ?? '',
    etapa: documento.etapa ?? '',
    planoId: documento.planoId ?? '',
    atividadeId: documento.atividadeId ?? '',
    demandaNumero: documento.demandaNumero ?? '',
    avaliacaoId: documento.avaliacaoId ?? '',
    data: documento.data,
    observacoes: documento.observacoes,
    substitui: '',
    origem: '',
  }
  return (
    <>
      {cabecalho}
      <FormularioDocumento
        documento={documento}
        inicial={inicial}
        substitui={null}
        categorias={categorias}
        opcoes={opcoes}
        semClientePermitido={ehAdmin(usuario)}
        voltar={`/documentos/${documento.id}`}
      />
    </>
  )
}
