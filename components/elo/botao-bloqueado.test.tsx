import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { BotaoBloqueado } from './botao-bloqueado'

describe('BotaoBloqueado', () => {
  it('usa aria-disabled, não é disabled e ignora cliques', async () => {
    const onClick = vi.fn()
    render(
      <TooltipProvider>
        <BotaoBloqueado motivo="Há atividades abertas" onClick={onClick}>Encerrar</BotaoBloqueado>
      </TooltipProvider>,
    )
    const botao = screen.getByRole('button', { name: 'Encerrar' })
    expect(botao).toHaveAttribute('aria-disabled', 'true')
    expect(botao).not.toBeDisabled()
    await userEvent.click(botao)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('mostra o motivo ao receber foco por Tab', async () => {
    render(
      <TooltipProvider>
        <BotaoBloqueado motivo="Há atividades abertas">Encerrar</BotaoBloqueado>
      </TooltipProvider>,
    )
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Encerrar' })).toHaveFocus()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Há atividades abertas')
  })

  it('mostra o motivo ao passar o mouse', async () => {
    render(
      <TooltipProvider>
        <BotaoBloqueado motivo="Há atividades abertas">Encerrar</BotaoBloqueado>
      </TooltipProvider>,
    )
    await userEvent.hover(screen.getByRole('button', { name: 'Encerrar' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Há atividades abertas')
  })

  it('não repassa disabled ao botão, que continua focável', async () => {
    const propsForcadas = { disabled: true } as unknown as Record<string, never>
    render(
      <TooltipProvider>
        <BotaoBloqueado motivo="Há atividades abertas" {...propsForcadas}>Encerrar</BotaoBloqueado>
      </TooltipProvider>,
    )
    const botao = screen.getByRole('button', { name: 'Encerrar' })
    expect(botao).not.toBeDisabled()
    await userEvent.tab()
    expect(botao).toHaveFocus()
  })
})
