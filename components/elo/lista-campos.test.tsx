import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ListaCampos } from './lista-campos'

describe('ListaCampos', () => {
  it('usa dl, dt e dd e mostra o traço para valor nulo', () => {
    const { container } = render(
      <ListaCampos
        itens={[
          { rotulo: 'Cliente', valor: 'Grupo Horizonte Agro' },
          { rotulo: 'Observações', valor: null },
        ]}
      />,
    )
    expect(container.querySelector('dl')).not.toBeNull()
    expect(container.querySelectorAll('dt')).toHaveLength(2)
    const dds = container.querySelectorAll('dd')
    expect(dds[0]).toHaveTextContent('Grupo Horizonte Agro')
    expect(dds[1]).toHaveTextContent('—')
  })

  it('undefined, texto vazio e só espaços também mostram o traço; zero continua zero', () => {
    const { container } = render(
      <ListaCampos
        itens={[
          { rotulo: 'A', valor: undefined },
          { rotulo: 'B', valor: '' },
          { rotulo: 'C', valor: '   ' },
          { rotulo: 'D', valor: 0 },
        ]}
      />,
    )
    const dds = container.querySelectorAll('dd')
    expect(dds[0]).toHaveTextContent('—')
    expect(dds[1]).toHaveTextContent('—')
    expect(dds[2]).toHaveTextContent('—')
    expect(dds[3]).toHaveTextContent(/^0$/)
  })

  it('o rótulo e o valor têm pesos diferentes: rótulo pequeno em caixa alta, valor em destaque', () => {
    const { container } = render(<ListaCampos itens={[{ rotulo: 'Segmento', valor: 'Tecnologia' }]} />)
    expect(container.querySelector('dt')).toHaveClass('text-rotulo', 'uppercase', 'text-muted-foreground')
    expect(container.querySelector('dd')).toHaveClass('text-sm', 'font-medium', 'text-foreground')
  })

  it('o traço do valor vazio fica apagado, para não parecer um valor', () => {
    const { container } = render(<ListaCampos itens={[{ rotulo: 'Observações', valor: null }]} />)
    const traco = container.querySelector('dd span')
    expect(traco).toHaveTextContent('—')
    expect(traco).toHaveClass('font-normal', 'text-muted-foreground')
  })
})
