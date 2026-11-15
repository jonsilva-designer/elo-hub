import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Carregando } from '@/components/elo/estados'
import { ConteudoContrato } from './_componentes/conteudo-contrato'

// Título fixo: ler o contrato no generateMetadata exigiria a sessão. O código aparece no cabeçalho da página.
export const metadata: Metadata = { title: 'Contrato | Plataforma ELO' }

// O id da rota e a sessão só podem ser lidos dentro do Suspense (cacheComponents).
export default function PaginaContrato({ params }: PageProps<'/contratos/[id]'>) {
  return (
    <div className="w-full max-w-6xl">
      <Suspense fallback={<Carregando />}>
        <ConteudoContrato params={params} />
      </Suspense>
    </div>
  )
}
