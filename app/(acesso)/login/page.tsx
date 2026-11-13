import type { Metadata } from 'next'
import { Suspense } from 'react'
import { MolduraAcesso } from '@/components/elo/moldura-acesso'
import { ConteudoLogin } from './_componentes/conteudo-login'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Entrar | Plataforma ELO' }

// O título, a descrição, o logo e a imagem ficam na parte estática. O formulário lê a sessão e a busca,
// então fica dentro do Suspense.
export default function PaginaLogin({ searchParams }: PageProps<'/login'>) {
  return (
    <MolduraAcesso titulo="Entrar" descricao="Acesse a Plataforma ELO com seu e-mail e senha.">
      <Suspense fallback={null}>
        <ConteudoLogin searchParams={searchParams} />
      </Suspense>
    </MolduraAcesso>
  )
}
