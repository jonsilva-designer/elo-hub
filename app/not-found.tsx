import type { Metadata } from 'next'
import Link from 'next/link'
import { MolduraPublica } from '@/components/elo/moldura-publica'
import { CLASSE_TITULO_PAGINA } from '@/components/elo/textos'
import { buttonVariants } from '@/components/ui/button'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Página não encontrada | Plataforma ELO' }

// Página 404 do protótipo, fora do menu. Os textos são provisórios até a validação do protótipo (DT-03).
export default function NaoEncontrada() {
  return (
    <MolduraPublica>
      <div className="space-y-4 text-center">
        <h1 className={CLASSE_TITULO_PAGINA}>Página não encontrada</h1>
        <p className="text-sm text-muted-foreground">Confira o endereço ou volte ao início.</p>
        {/* A raiz manda ao Início quem entrou e ao login quem não entrou, como o visitante dos formulários do site. */}
        <Link href="/" className={buttonVariants()}>
          Ir para o início
        </Link>
      </div>
    </MolduraPublica>
  )
}
