import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

// Os papéis de texto que se repetiam escritos à mão nas telas (cobertura do design system, 19/11/2026).
// Cada um sai daqui, para mudar em toda a plataforma de uma vez.

/** O título da página do padrão 4.2: Playfair Display, 26px, azul-marinho, letras um pouco mais juntas. */
export const CLASSE_TITULO_PAGINA = 'font-heading text-titulo-pagina font-semibold tracking-titulo text-primary'

/** O rótulo de indicador do padrão 4.2: pequeno, em caixa alta, espaçado e cinza. */
export const CLASSE_ROTULO = 'text-rotulo font-semibold uppercase tracking-rotulo text-muted-foreground'

const CLASSE_LINK = 'rounded-sm text-primary underline-offset-4 hover:underline'

/** O link de dentro do texto (o cliente, o contrato, o escopo de um registro): azul-marinho, sublinhado ao passar o mouse. */
export function LinkTexto({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={cn(CLASSE_LINK, className)} {...props} />
}

/** O link para um endereço de fora da plataforma (o currículo, o LinkedIn): o mesmo visual, num `<a>` que abre numa aba nova. */
export function LinkExterno({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={CLASSE_LINK}>
      {children}
    </a>
  )
}

/** O texto no lugar de um valor que falta ("Não informado", "Sem contrato"): cinza e sem negrito, para não parecer um valor. */
export function Apagado({ children }: { children: ReactNode }) {
  return <span className="font-normal text-muted-foreground">{children}</span>
}

const temValor = (detalhe: ReactNode) => detalhe !== null && detalhe !== undefined && detalhe !== false && detalhe !== ''

/**
 * O texto de uma célula com os detalhes embaixo (o nome e o e-mail, a atividade e o plano): o texto em cima e cada
 * detalhe numa linha menor e cinza. O que vier de filho (uma etiqueta) fica por último.
 */
export function TextoComDetalhe({
  texto,
  detalhes = [],
  destaque = true,
  children,
}: {
  texto: ReactNode
  detalhes?: ReactNode[]
  /** O nome do registro vem em negrito; o texto corrido (o assunto, o alerta), no peso normal. */
  destaque?: boolean
  children?: ReactNode
}) {
  return (
    <span className="flex min-w-0 flex-col items-start gap-0.5">
      <span data-slot="texto" className={cn('text-foreground', destaque && 'font-medium')}>
        {texto}
      </span>
      {detalhes.filter(temValor).map((detalhe, i) => (
        <span key={i} className="text-xs text-muted-foreground">
          {detalhe}
        </span>
      ))}
      {children}
    </span>
  )
}

/** O valor que o formulário mostra sem deixar mudar (o cliente do escopo, a data de criação). */
export function ValorFixo({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium text-foreground">{children}</p>
}

/** Uma opção de um grupo de opção única: a bolinha e o texto dela, que também marca a opção ao clicar. */
export function OpcaoRadio({ id, valor, children }: { id: string; valor: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <RadioGroupItem id={id} value={valor} />
      <Label htmlFor={id} className="font-normal">
        {children}
      </Label>
    </div>
  )
}
