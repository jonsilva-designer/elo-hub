import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { obterEspecialista } from '@/lib/dados/especialistas'
import { listarEspecialidades } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { FormularioEspecialista } from '../../../_componentes/formulario-especialista'

/**
 * Edição do especialista (parte 5, 5.5), só do Administrador. Id que não existe dá "não encontrado"; a Equipe vê o
 * acesso negado (matriz 4.3).
 */
export async function ConteudoEditarEspecialista({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [usuario, especialista] = await Promise.all([obterUsuarioAtual(), obterEspecialista(id)])
  if (!especialista) notFound()

  const cabecalho = (
    <>
      <div className="mb-3">
        <LinkVoltar href={`/especialistas/${especialista.id}`} rotulo={especialista.nome} />
      </div>
      <CabecalhoPagina titulo="Editar especialista" />
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
  return (
    <>
      {cabecalho}
      <FormularioEspecialista especialista={especialista} especialidades={await listarEspecialidades()} />
    </>
  )
}
