import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Painel } from './painel'

describe('Painel', () => {
  it('é uma região nomeada pelo título, com contagem, ação e conteúdo', () => {
    render(
      <Painel titulo="Alertas" contagem="3 itens" acao={<button>Ver todos</button>}>
        <p>conteúdo</p>
      </Painel>,
    )
    const regiao = screen.getByRole('region', { name: 'Alertas' })
    expect(screen.getByRole('heading', { level: 2, name: 'Alertas' })).toBeInTheDocument()
    expect(regiao).toHaveTextContent('3 itens')
    expect(screen.getByRole('button', { name: 'Ver todos' })).toBeInTheDocument()
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
  })

  it('a contagem fica à direita do cabeçalho, junto da ação e antes dela', () => {
    render(
      <Painel titulo="Alertas" contagem="3 itens" acao={<button>Ver todos</button>}>
        <p>conteúdo</p>
      </Painel>,
    )
    const contagem = screen.getByText('3 itens')
    const direita = contagem.parentElement as HTMLElement
    expect(direita).toHaveClass('ml-auto')
    const botao = screen.getByRole('button', { name: 'Ver todos' })
    expect(direita).toContainElement(botao)
    expect(contagem.compareDocumentPosition(botao) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('o cabeçalho tem a mesma altura com e sem ação: o botão não o faz crescer', () => {
    const { unmount } = render(<Painel titulo="Dados">conteúdo</Painel>)
    const semAcao = screen.getByRole('heading', { name: 'Dados' }).parentElement!
    expect(semAcao.className).toContain('min-h-14')
    unmount()
    render(
      <Painel titulo="Contratos" acao={<button>Novo contrato</button>}>
        conteúdo
      </Painel>,
    )
    expect(screen.getByRole('heading', { name: 'Contratos' }).parentElement!.className).toContain('min-h-14')
  })

  it('contagem zero aparece', () => {
    render(
      <Painel titulo="Alertas" contagem={0}>
        <p>conteúdo</p>
      </Painel>,
    )
    expect(screen.getByRole('region', { name: 'Alertas' })).toHaveTextContent('0')
    expect(screen.getByText('0')).toHaveClass('text-muted-foreground')
  })

  it('o corpo tem respiro por padrão', () => {
    render(
      <Painel titulo="Alertas">
        <p>conteúdo</p>
      </Painel>,
    )
    expect(screen.getByText('conteúdo').parentElement).toHaveClass('p-5')
  })

  it('semRespiro tira o respiro do corpo, para tabela ou lista de borda a borda', () => {
    render(
      <Painel titulo="Contratos" semRespiro>
        <table>
          <tbody>
            <tr>
              <td>linha</td>
            </tr>
          </tbody>
        </table>
      </Painel>,
    )
    const corpo = screen.getByRole('table').parentElement as HTMLElement
    expect(corpo.className.split(' ').filter((c) => /^p[xytrbl]?-/.test(c))).toEqual([])
  })
})
