import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { listarEspecialidades } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { FormularioEspecialista } from '../../_componentes/formulario-especialista'
import { VoltarParaEspecialistas } from '../../_componentes/voltar-para-especialistas'

/** Novo especialista (parte 5, 5.5), só do Administrador; a Equipe vê o acesso negado (matriz 4.3). */
export async function ConteudoNovoEspecialista() {
  const usuario = await obterUsuarioAtual()
  const cabecalho = (
    <>
      <div className="mb-3">
        <VoltarParaEspecialistas />
      </div>
      <CabecalhoPagina titulo="Novo especialista" />
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
      <FormularioEspecialista especialista={null} especialidades={await listarEspecialidades()} />
    </>
  )
}
