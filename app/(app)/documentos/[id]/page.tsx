import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Carregando } from '@/components/elo/estados'
import { ConteudoDocumento } from './_componentes/conteudo-documento'

// Título fixo: ler o documento no generateMetadata exigiria a sessão. O nome aparece no cabeçalho da página.
export const metadata: Metadata = { title: 'Documento | Plataforma ELO' }

// O id da rota e a sessão só podem ser lidos dentro do Suspense (cacheComponents).
export default function PaginaDocumento({ params }: PageProps<'/documentos/[id]'>) {
  return (
    <div className="w-full max-w-6xl">
      <Suspense fallback={<Carregando />}>
        <ConteudoDocumento params={params} />
      </Suspense>
    </div>
  )
}
