import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Download } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { BotaoIcone } from './botao-icone'

describe('BotaoIcone', () => {
  it('tem nome acessível, sem texto visível, e dica ao receber foco', async () => {
    render(
      <TooltipProvider>
        <BotaoIcone rotulo="Exportar" icone={Download} />
      </TooltipProvider>,
    )
    const botao = screen.getByRole('button', { name: 'Exportar' })
    expect(botao).toHaveTextContent('')
    await userEvent.tab()
    expect(botao).toHaveFocus()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Exportar')
  })

  it('é type="button": dentro de um formulário não o envia', () => {
    render(
      <TooltipProvider>
        <BotaoIcone rotulo="Exportar" icone={Download} />
      </TooltipProvider>,
    )
    expect(screen.getByRole('button', { name: 'Exportar' })).toHaveAttribute('type', 'button')
  })

  it('continua sem "use client", para servir a componentes de servidor', () => {
    const fonte = readFileSync(join(process.cwd(), 'components/elo/botao-icone.tsx'), 'utf8')
    expect(fonte).not.toMatch(/^\s*['"]use client['"]/)
  })
})
