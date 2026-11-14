import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Carregando } from '@/components/elo/estados'
import { ConteudoCliente } from './_componentes/conteudo-cliente'

// Título fixo: ler o cliente no generateMetadata exigiria a sessão. O nome aparece no cabeçalho da página.
export const metadata: Metadata = { title: 'Cliente | Plataforma ELO' }

// O id da rota, a aba do endereço e a sessão só podem ser lidos dentro do Suspense (cacheComponents).
export default function PaginaCliente({ params, searchParams }: PageProps<'/clientes/[id]'>) {
  return (
    <div className="w-full max-w-6xl">
      <Suspense fallback={<Carregando />}>
        <ConteudoCliente params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
