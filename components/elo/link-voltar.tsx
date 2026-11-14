import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

/** Caminho de volta, acima do título da página. O nome acessível é "Voltar para <rótulo>". */
export function LinkVoltar({ href, rotulo }: { href: string; rotulo: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-sm text-secundario text-muted-foreground transition-colors hover:text-primary"
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">Voltar para</span>
      {' '}
      <span>{rotulo}</span>
    </Link>
  )
}
