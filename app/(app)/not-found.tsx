import type { Metadata } from 'next'
import Link from 'next/link'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { buttonVariants } from '@/components/ui/button'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Não encontrado | Plataforma ELO' }

/**
 * "Não encontrado" dentro da plataforma, com a lateral: um registro que não existe ou fora dos vínculos
 * (RN-01). O texto é o mesmo nos dois casos, para não revelar que o registro existe.
 */
export default function NaoEncontradoNaPlataforma() {
  return (
    <div className="w-full max-w-6xl">
      <CabecalhoPagina titulo="Não encontrado" />
      <EstadoVazio
        titulo="Este endereço não existe ou não está disponível para você."
        acao={
          <Link href="/inicio" className={buttonVariants({ variant: 'outline' })}>
            Ir para o Início
          </Link>
        }
      />
    </div>
  )
}
