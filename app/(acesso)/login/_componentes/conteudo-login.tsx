import { redirect } from 'next/navigation'
import { destinoSeguro } from '@/lib/acesso/rotas'
import { obterSessao } from '@/lib/dados/sessao'
import { obterExemplosDoPrototipo } from '@/lib/dados/usuarios'
import { EntradaPorPerfil } from './entrada-por-perfil'
import { FormularioLogin } from './formulario-login'

type Busca = Record<string, string | string[] | undefined>

const AVISO_SENHA_DEFINIDA = 'Senha definida. Entre com seu e-mail e a nova senha.'

/** De um parâmetro repetido na busca, vale o primeiro valor. */
const primeiro = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor)

/**
 * A parte do login que lê a sessão e a busca. Fica dentro de um Suspense (cacheComponents).
 * Quem já tem sessão válida vai ao destino pedido, ou ao Início. É a página, e não o proxy, que decide isso: assim um
 * cookie inválido mostra o formulário, sem laço de redirecionamento.
 */
export async function ConteudoLogin({ searchParams }: { searchParams: Promise<Busca> }) {
  const busca = await searchParams
  const destino = destinoSeguro(primeiro(busca.destino))
  if (await obterSessao()) redirect(destino)

  const aviso = primeiro(busca.aviso) === 'senha-definida' ? AVISO_SENHA_DEFINIDA : undefined
  const exemplos = await obterExemplosDoPrototipo()

  return (
    <div className="space-y-8">
      <FormularioLogin destino={destino} aviso={aviso} />
      <EntradaPorPerfil destino={destino} exemplos={exemplos} />
    </div>
  )
}
