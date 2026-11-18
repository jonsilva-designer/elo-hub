import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { obterParametros } from '@/lib/dados/parametros'
import { AbasConfiguracoes } from '../../_componentes/abas-configuracoes'
import { FormularioParametros } from './formulario-parametros'

/** Os parâmetros (parte 8, 4.3): só o Administrador. A Equipe vê o acesso negado (CA-01.2). */
export async function ConteudoParametros() {
  const parametros = await obterParametros()
  if (!parametros) {
    return (
      <>
        <CabecalhoPagina titulo="Configurações" />
        <AcessoNegado />
      </>
    )
  }
  return (
    <>
      <CabecalhoPagina titulo="Configurações" />
      <AbasConfiguracoes />
      <FormularioParametros parametros={parametros} />
    </>
  )
}
