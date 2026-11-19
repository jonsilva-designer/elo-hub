import type { Metadata } from 'next'
import Link from 'next/link'
import { MolduraPublica } from '@/components/elo/moldura-publica'
import { buttonVariants } from '@/components/ui/button'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Página não encontrada | Plataforma ELO' }

// Página 404 do protótipo, fora do menu. Os textos são provisórios até a validação do protótipo (DT-03).
export default function NaoEncontrada() {
  return (
    <MolduraPublica>
      <div className="space-y-4 text-center">
        <h1 className="font-heading text-titulo-pagina font-semibold text-primary">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground">Algumas telas do protótipo ainda estão em construção.</p>
        <Link href="/designsystem" className={buttonVariants()}>
          Ver o padrão visual
        </Link>
      </div>
    </MolduraPublica>
  )
}
