'use client'

import { Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Põe a página em tela cheia, para a projeção na reunião (CA-14.2). O Esc do navegador sai. */
export function TelaCheia() {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        // Sem suporte do navegador, o botão não faz nada: a página continua legível na janela.
        void document.documentElement.requestFullscreen?.().catch(() => {})
      }}
    >
      <Maximize2 aria-hidden="true" />
      Tela cheia
    </Button>
  )
}
