import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Carregando } from '@/components/elo/estados'
import { ConteudoNovoUsuario } from './_componentes/conteudo-novo-usuario'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Novo usuário | Plataforma ELO' }

// A página lê a sessão, então fica dentro do Suspense (cacheComponents).
export default function PaginaNovoUsuario() {
  return (
    <div className="w-full max-w-3xl">
      <Suspense fallback={<Carregando />}>
        <ConteudoNovoUsuario />
      </Suspense>
    </div>
  )
}
