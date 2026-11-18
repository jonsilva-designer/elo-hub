import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { atividadeFechada } from '@/lib/atividades/regras'
import { obterAtividade } from '@/lib/dados/atividades'
import { temDocumentoLigado } from '@/lib/dados/documentos'
import { obterPlano } from '@/lib/dados/planos'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { ExcluirAtividade } from '../../../_componentes/excluir-atividade'
import { FormularioAtividade } from '../../../_componentes/formulario-atividade'
import { VoltarParaMinhasAtividades } from '../../../_componentes/voltar-para-minhas-atividades'

type Busca = Record<string, string | string[] | undefined>

/**
 * Edição da atividade (parte 4, 5.7). Fora do vínculo ou com id que não existe, "não encontrado", sem revelar que a
 * atividade existe. A Equipe vinculada edita a atividade aberta; na fechada, vê o acesso negado (RN-17). Aberta a
 * partir de Minhas atividades (`?origem=minhas-atividades`), a volta e o destino são a lista.
 */
export async function ConteudoEditarAtividade({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Busca>
}) {
  const [{ id }, busca] = await Promise.all([params, searchParams])
  const [usuario, atividade] = await Promise.all([obterUsuarioAtual(), obterAtividade(id)])
  if (!atividade) notFound()
  const plano = await obterPlano(atividade.planoId)
  if (!plano) notFound()
  const origem = busca.origem === 'minhas-atividades' ? 'minhas-atividades' : null
  const admin = ehAdmin(usuario)
  // Com documento ligado, a atividade não é excluída e a opção não aparece (RN-13, CA-18.4).
  const podeExcluir = admin && !(await temDocumentoLigado({ atividadeId: atividade.id }))

  const cabecalho = (
    <>
      <div className="mb-3">
        {origem ? <VoltarParaMinhasAtividades /> : <LinkVoltar href={`/planos/${plano.id}`} rotulo={plano.nome} />}
      </div>
      <CabecalhoPagina
        titulo="Editar atividade"
        acoes={podeExcluir ? <ExcluirAtividade atividadeId={atividade.id} planoId={plano.id} /> : null}
      />
    </>
  )
  if (!admin && atividadeFechada(atividade.status)) {
    return (
      <>
        {cabecalho}
        <AcessoNegado />
      </>
    )
  }

  const responsaveis = await listarResponsaveis(plano.clienteId)
  return (
    <>
      {cabecalho}
      <FormularioAtividade
        atividade={atividade}
        plano={{ id: plano.id, nome: plano.nome, nomeCliente: plano.nomeCliente }}
        perfil={usuario.perfil}
        responsaveis={responsaveis.map((u) => ({ valor: u.id, rotulo: u.nome }))}
        origem={origem}
      />
    </>
  )
}
