'use client'

import { Paperclip } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { AtributosDeCampo } from './campo'

/**
 * Envio de arquivo. O controle nativo fica escondido, mas continua focável e com o rótulo do Campo;
 * o botão desenhado só repete o clique. O contorno de foco aparece no botão desenhado.
 */
export function CampoArquivo({
  aceitar,
  onChange,
  disabled,
  ...props
}: {
  aceitar?: string
  onChange: (arquivo: File | null) => void
  disabled?: boolean
} & AtributosDeCampo) {
  const entrada = useRef<HTMLInputElement>(null)
  const [nome, setNome] = useState<string | null>(null)

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
      <input
        {...props}
        ref={entrada}
        type="file"
        accept={aceitar}
        disabled={disabled}
        className="peer sr-only"
        onChange={(e) => {
          const arquivo = e.target.files?.[0] ?? null
          setNome(arquivo?.name ?? null)
          onChange(arquivo)
        }}
      />
      <span
        aria-hidden="true"
        onClick={() => {
          if (!disabled) entrada.current?.click()
        }}
        className={cn(
          'inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-card px-2.5 text-sm font-medium select-none hover:bg-muted',
          'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring',
          'peer-aria-invalid:border-destructive',
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-disabled:hover:bg-card',
        )}
      >
        <Paperclip className="size-4" />
        Escolher arquivo
      </span>
      <span
        title={nome ?? undefined}
        className={cn(
          'min-w-0 max-w-full truncate text-sm',
          nome ? 'text-foreground' : 'text-muted-foreground',
          disabled && 'opacity-50',
        )}
      >
        {nome ?? 'Nenhum arquivo escolhido'}
      </span>
    </div>
  )
}
