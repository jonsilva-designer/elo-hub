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
})
