import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Carregando } from '@/components/elo/estados'
import { ConteudoUsuario } from './_componentes/conteudo-usuario'

// Título fixo: ler o usuário no generateMetadata exigiria a sessão. O nome aparece no cabeçalho da página.
export const metadata: Metadata = { title: 'Usuário | Plataforma ELO' }

// O id da rota e a sessão só podem ser lidos dentro do Suspense (cacheComponents).
export default function PaginaUsuario({ params }: PageProps<'/configuracoes/usuarios/[id]'>) {
  return (
    <div className="w-full max-w-3xl">
      <Suspense fallback={<Carregando />}>
        <ConteudoUsuario params={params} />
      </Suspense>
    </div>
  )
}
