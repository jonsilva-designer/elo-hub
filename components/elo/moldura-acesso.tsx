import Image from 'next/image'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import elos from './imagens/elos-login.webp'

/**
 * Moldura das telas de acesso (entrar, recuperar e definir a senha), fora do menu.
 * Em tela larga e deitada (1024px ou mais), dois blocos de mesma largura: o formulário direto sobre o papel,
 * sem cartão, e a imagem dos elos. No celular e no tablet em pé, só o formulário com o logo.
 * `className` ajusta a moldura de fora, por exemplo `min-h-0` para caber num quadro reduzido.
 */
export function MolduraAcesso({
  titulo,
  descricao,
  children,
  className,
}: {
  titulo: string
  descricao?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('grid min-h-dvh bg-background lg:landscape:grid-cols-2', className)}>
      <div className="flex min-w-0 flex-col px-4 py-8 sm:px-8 lg:landscape:px-12 lg:landscape:py-10">
        {/* Na mesma largura do conteúdo, para o logo alinhar com a borda esquerda do formulário em tela larga. */}
        {/* Linha flexível, e não o logo solto na coluna: a coluna esticaria o logo na largura toda. */}
        <div className="mx-auto flex w-full max-w-sm justify-center lg:landscape:justify-start">
          {/* Sempre visível e no alto da tela: carrega já (o priority foi descontinuado no Next 16). */}
          <Image
            src="/marca/logo-elo.png"
            alt="ELO HUB"
            width={814}
            height={627}
            loading="eager"
            className="h-14 w-auto"
          />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-1.5">
              <h1 className="text-[26px] font-semibold tracking-[-.02em] text-primary">{titulo}</h1>
              {descricao ? <p className="text-sm text-muted-foreground">{descricao}</p> : null}
            </div>
            {children}
          </div>
        </div>
      </div>

      <div data-imagem-acesso className="hidden p-3 lg:landscape:block">
        {/* O azul-marinho aparece enquanto a imagem carrega. Sem loading="eager": no celular a coluna fica
            escondida, e o carregamento preguiçoso evita baixar a imagem à toa; a prioridade alta a adianta
            quando ela aparece. */}
        <div className="relative h-full overflow-hidden rounded-xl bg-primary">
          <Image
            src={elos}
            alt=""
            fill
            sizes="50vw"
            placeholder="blur"
            fetchPriority="high"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  )
}
