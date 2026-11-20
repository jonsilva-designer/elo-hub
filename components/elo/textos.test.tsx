import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RadioGroup } from '@/components/ui/radio-group'
import { Apagado, CLASSE_ROTULO, CLASSE_TITULO_PAGINA, LinkExterno, LinkTexto, OpcaoRadio, TextoComDetalhe, ValorFixo } from './textos'

// Os papéis de texto que se repetiam escritos à mão nas telas (cobertura do design system, 19/11/2026).
describe('LinkTexto', () => {
  it('é o link de dentro do texto: azul-marinho, sublinhado ao passar o mouse', () => {
    render(<LinkTexto href="/clientes/12">Montareal</LinkTexto>)
    const link = screen.getByRole('link', { name: 'Montareal' })
    expect(link).toHaveAttribute('href', '/clientes/12')
    expect(link.className.split(' ')).toEqual(expect.arrayContaining(['text-primary', 'underline-offset-4', 'hover:underline']))
  })

})

describe('Apagado', () => {
  it('o texto no lugar de um valor que falta: cinza e sem negrito, para não parecer um valor', () => {
    render(<Apagado>Não informado</Apagado>)
    expect(screen.getByText('Não informado').className.split(' ')).toEqual(['font-normal', 'text-muted-foreground'])
  })
})

describe('TextoComDetalhe', () => {
  it('o texto em destaque e cada detalhe numa linha menor e cinza; detalhe vazio não ocupa linha', () => {
    const { container } = render(<TextoComDetalhe texto="Helena Prado" detalhes={['helena@elo.com.br', null, false, '']} />)
    expect(screen.getByText('Helena Prado')).toHaveClass('font-medium', 'text-foreground')
    // As listas acham o nome de cada linha por aqui.
    expect(screen.getByText('Helena Prado')).toHaveAttribute('data-slot', 'texto')
    expect(screen.getByText('helena@elo.com.br')).toHaveClass('text-xs', 'text-muted-foreground')
    expect(container.firstElementChild!.children).toHaveLength(2)
  })

  it('sem destaque, o texto principal fica no peso normal; o que vem de filho fica embaixo', () => {
    render(
      <TextoComDetalhe texto="Protocolar a licença" destaque={false}>
        <span>etiqueta</span>
      </TextoComDetalhe>,
    )
    expect(screen.getByText('Protocolar a licença')).not.toHaveClass('font-medium')
    expect(screen.getByText('etiqueta')).toBeInTheDocument()
  })
})

describe('ValorFixo', () => {
  it('o valor que o formulário mostra sem deixar mudar', () => {
    render(<ValorFixo>Montareal</ValorFixo>)
    expect(screen.getByText('Montareal')).toHaveClass('text-sm', 'font-medium', 'text-foreground')
  })
})

describe('OpcaoRadio', () => {
  it('a bolinha e o texto dela, que marca a opção ao clicar', () => {
    render(
      <RadioGroup aria-label="Status">
        <OpcaoRadio id="reabrir-ativo" valor="Ativo">
          Ativo
        </OpcaoRadio>
      </RadioGroup>,
    )
    const opcao = screen.getByRole('radio', { name: 'Ativo' })
    expect(opcao).toHaveAttribute('id', 'reabrir-ativo')
    expect(screen.getByText('Ativo')).toHaveClass('font-normal')
  })
})

describe('CLASSE_TITULO_PAGINA', () => {
  it('é o título da página do padrão 4.2', () => {
    expect(CLASSE_TITULO_PAGINA.split(' ')).toEqual(
      expect.arrayContaining(['font-heading', 'text-titulo-pagina', 'font-semibold', 'tracking-titulo', 'text-primary']),
    )
  })
})

describe('CLASSE_ROTULO', () => {
  it('é o rótulo de indicador do padrão 4.2: pequeno, em caixa alta e cinza', () => {
    expect(CLASSE_ROTULO.split(' ')).toEqual(
      expect.arrayContaining(['text-rotulo', 'font-semibold', 'uppercase', 'tracking-rotulo', 'text-muted-foreground']),
    )
  })
})

describe('LinkExterno', () => {
  it('o endereço de fora abre numa aba nova, sem passar pelo roteador, com o mesmo visual do link de texto', () => {
    render(<LinkExterno href="https://www.linkedin.com/in/x">Abrir o link</LinkExterno>)
    const link = screen.getByRole('link', { name: 'Abrir o link' })
    expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/x')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
    expect(link.className.split(' ')).toEqual(expect.arrayContaining(['text-primary', 'underline-offset-4', 'hover:underline']))
  })
})
