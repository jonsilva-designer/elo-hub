import type { Metadata } from 'next'
import Link from 'next/link'
import { MolduraAcesso } from '@/components/elo/moldura-acesso'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { QuadroPrototipo } from '../_componentes/quadro-prototipo'
import { FormularioRecuperacao } from './_componentes/formulario-recuperacao'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Recuperar senha | Plataforma ELO' }

export default function PaginaRecuperarSenha() {
  return (
    <MolduraAcesso
      titulo="Recuperar senha"
      descricao="Informe o e-mail cadastrado. Você vai receber um link para criar uma nova senha."
    >
      <div className="space-y-8">
        <FormularioRecuperacao />
        {/* Sempre visível, para chegar à tela do link sem precisar enviar. */}
        <QuadroPrototipo>
          <p className="text-secundario text-muted-foreground">Nenhum e-mail é enviado no protótipo.</p>
          <Link href="/definir-senha" className={cn(buttonVariants({ variant: 'link' }), 'h-auto px-0 text-secundario')}>
            Abrir a tela do link do e-mail
          </Link>
        </QuadroPrototipo>
      </div>
    </MolduraAcesso>
  )
}
