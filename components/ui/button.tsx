import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

import { Spinner } from "@/components/ui/spinner"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none not-disabled:not-aria-disabled:active:not-aria-[haspopup]:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Passar o mouse e pressionado: um tom mais escuro e depois mais um (padrão 7, tons no globals.css).
        default:
          "bg-primary text-primary-foreground not-disabled:not-aria-disabled:hover:bg-primary-hover not-disabled:not-aria-disabled:active:bg-primary-active",
        outline:
          "border-border bg-card text-foreground not-disabled:not-aria-disabled:hover:bg-surface-hover not-disabled:not-aria-disabled:active:bg-surface-active aria-expanded:bg-surface-hover",
        ghost:
          "text-foreground not-disabled:not-aria-disabled:hover:bg-surface-hover not-disabled:not-aria-disabled:active:bg-surface-active aria-expanded:bg-surface-hover",
        destructive:
          "bg-destructive text-primary-foreground not-disabled:not-aria-disabled:hover:bg-destructive-hover not-disabled:not-aria-disabled:active:bg-destructive-active",
        link: "text-primary underline-offset-4 not-disabled:not-aria-disabled:hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-2.5 text-secundario has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  carregando = false,
  children,
  disabled,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    carregando?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"
  // Com asChild (um link), o disabled não vale: o bloqueio vai por aria-disabled, fora da ordem do Tab e sem o clique.
  const linkBloqueado = asChild && (disabled || carregando)
  const bloqueio = linkBloqueado
    ? {
        "aria-disabled": true,
        tabIndex: -1,
        onClick: (evento: React.MouseEvent<HTMLButtonElement>) => evento.preventDefault(),
      }
    : {}

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={asChild ? undefined : disabled || carregando}
      aria-busy={carregando || undefined}
      {...props}
      {...bloqueio}
    >
      {asChild ? (
        children
      ) : (
        <>
          {/* Fora do nome do botão: o aria-busy já diz que está ocupado. */}
          {carregando ? <Spinner aria-hidden="true" role={undefined} aria-label={undefined} /> : null}
          {children}
        </>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
