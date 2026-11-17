import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Carregando } from '@/components/elo/estados'
import { ConteudoEspecialista } from './_componentes/conteudo-especialista'

// Título fixo: ler o especialista no generateMetadata exigiria a sessão. O nome aparece no cabeçalho da página.
export const metadata: Metadata = { title: 'Especialista | Plataforma ELO' }

// O id da rota e a sessão só podem ser lidos dentro do Suspense (cacheComponents).
export default function PaginaEspecialista({ params }: PageProps<'/especialistas/[id]'>) {
  return (
    <div className="w-full max-w-6xl">
      <Suspense fallback={<Carregando />}>
        <ConteudoEspecialista params={params} />
      </Suspense>
    </div>
  )
}
