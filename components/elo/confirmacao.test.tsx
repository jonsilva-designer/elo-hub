import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/ui/button'
import { AvisoConfirmacao, ConfirmarAcao, ListaImpedimentos } from './confirmacao'

describe('ConfirmarAcao', () => {
  function montar(onConfirmar = vi.fn()) {
    render(
      <ConfirmarAcao titulo="Excluir plano?" rotuloConfirmar="Excluir" perigo onConfirmar={onConfirmar}>
        <Button>Abrir</Button>
      </ConfirmarAcao>,
    )
    return onConfirmar
  }

  it('abre o diálogo com o título e confirma uma vez', async () => {
    const onConfirmar = montar()
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Excluir plano?')
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(onConfirmar).toHaveBeenCalledTimes(1)
  })

  it('sem descricao não emite erro nem aviso no console', async () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {})
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {})
    montar()
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(erro).not.toHaveBeenCalled()
    expect(aviso).not.toHaveBeenCalled()
    erro.mockRestore()
    aviso.mockRestore()
  })

  it('Cancelar fecha sem confirmar', async () => {
    const onConfirmar = montar()
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(onConfirmar).not.toHaveBeenCalled()
  })
})

describe('ConfirmarAcao com conteúdo (parte 2, 5.10)', () => {
  it('mostra o conteúdo dentro da janela', async () => {
    render(
      <ConfirmarAcao titulo="Excluir cliente?" rotuloConfirmar="Excluir" onConfirmar={vi.fn()} conteudo={<p>Campo de justificativa</p>}>
        <Button>Abrir</Button>
      </ConfirmarAcao>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Campo de justificativa')
  })

  it('bloqueada, só deixa fechar', async () => {
    const onConfirmar = vi.fn()
    render(
      <ConfirmarAcao titulo="Não é possível inativar" rotuloConfirmar="Inativar" onConfirmar={onConfirmar} bloqueado>
        <Button>Abrir</Button>
      </ConfirmarAcao>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.queryByRole('button', { name: 'Inativar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(onConfirmar).not.toHaveBeenCalled()
  })

  function Controlada({ onConfirmar, carregando = false }: { onConfirmar: () => void; carregando?: boolean }) {
    const [aberto, setAberto] = useState(true)
    return (
      <ConfirmarAcao
        titulo="Reabrir avaliação?"
        rotuloConfirmar="Reabrir"
        onConfirmar={onConfirmar}
        aberto={aberto}
        aoMudarAberto={setAberto}
        carregando={carregando}
      />
    )
  }

  it('controlada e sem gatilho, abre pelo estado e não fecha sozinha ao confirmar', async () => {
    const onConfirmar = vi.fn()
    render(<Controlada onConfirmar={onConfirmar} />)
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Reabrir avaliação?')
    await userEvent.click(screen.getByRole('button', { name: 'Reabrir' }))
    expect(onConfirmar).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('controlada, Cancelar fecha', async () => {
    render(<Controlada onConfirmar={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('carregando, o botão de confirmar fica ocupado e não envia de novo', async () => {
    const onConfirmar = vi.fn()
    render(<Controlada onConfirmar={onConfirmar} carregando />)
    const botao = screen.getByRole('button', { name: /Reabrir/ })
    expect(botao).toHaveAttribute('aria-busy', 'true')
    expect(botao).toBeDisabled()
    await userEvent.click(botao)
    expect(onConfirmar).not.toHaveBeenCalled()
  })
})

describe('ListaImpedimentos (RN-18, CA-18.3)', () => {
  it('mostra o tipo, o link do item, o status e o responsável', () => {
    render(
      <ListaImpedimentos
        itens={[
          {
            tipo: 'Avaliação de maturidade',
            descricao: 'Avaliação de 05/11/2026',
            status: 'Em elaboração',
            responsavel: 'Rafael Souza',
            href: '/avaliacoes/ava-vertice-3',
          },
        ]}
      />,
    )
    const item = screen.getByRole('listitem')
    expect(item).toHaveTextContent('Avaliação de maturidade')
    expect(screen.getByRole('link', { name: 'Avaliação de 05/11/2026' })).toHaveAttribute('href', '/avaliacoes/ava-vertice-3')
    expect(item).toHaveTextContent('Em elaboração')
    expect(item).toHaveTextContent('Rafael Souza')
  })
})

describe('AvisoConfirmacao', () => {
  it('mostra a mensagem e chama os dois retornos', async () => {
    const onConfirmar = vi.fn()
    const onRevisar = vi.fn()
    render(<AvisoConfirmacao mensagem="Data fora do prazo" onConfirmar={onConfirmar} onRevisar={onRevisar} />)
    expect(screen.getByText('Data fora do prazo')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar mesmo assim' }))
    expect(onConfirmar).toHaveBeenCalledTimes(1)
    await userEvent.click(screen.getByRole('button', { name: 'Revisar' }))
    expect(onRevisar).toHaveBeenCalledTimes(1)
  })

  it('os números da mensagem, como a data, ficam em fonte de número', () => {
    render(
      <AvisoConfirmacao
        mensagem="A conclusão prevista é depois do término da vigência do contrato (05/12/2026). Salvar mesmo assim?"
        onConfirmar={vi.fn()}
        onRevisar={vi.fn()}
      />,
    )
    expect(screen.getByText('05/12/2026')).toHaveClass('font-mono')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'A conclusão prevista é depois do término da vigência do contrato (05/12/2026). Salvar mesmo assim?',
    )
  })
})

describe('botões dentro de um formulário', () => {
  it('"Salvar mesmo assim" e "Revisar" não enviam o formulário em volta', async () => {
    const enviar = vi.fn((e: React.FormEvent) => e.preventDefault())
    const onConfirmar = vi.fn()
    const onRevisar = vi.fn()
    render(
      <form onSubmit={enviar}>
        <AvisoConfirmacao mensagem="Data fora do prazo" onConfirmar={onConfirmar} onRevisar={onRevisar} />
      </form>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Salvar mesmo assim' }))
    await userEvent.click(screen.getByRole('button', { name: 'Revisar' }))
    expect(enviar).not.toHaveBeenCalled()
    expect(onConfirmar).toHaveBeenCalledTimes(1)
    expect(onRevisar).toHaveBeenCalledTimes(1)
  })
})
