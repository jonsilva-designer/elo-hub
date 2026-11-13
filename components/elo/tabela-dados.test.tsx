import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TabelaDados, type Coluna } from './tabela-dados'

type Contrato = { id: string; cliente: string; termino: string }

const CONTRATOS: Contrato[] = [
  { id: 'a', cliente: 'Zélia Transportes', termino: '2027-01-10' },
  { id: 'b', cliente: 'álvaro Agro', termino: '2026-12-01' },
  { id: 'c', cliente: 'Marta Clínica', termino: '2027-03-05' },
]

const COLUNAS: Coluna<Contrato>[] = [
  { id: 'cliente', titulo: 'Cliente', celula: (l) => l.cliente, ordenarPor: (l) => l.cliente },
  { id: 'termino', titulo: 'Término', celula: (l) => l.termino },
]

const VAZIO = <p>Nada por aqui</p>

function clientesNaOrdem() {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map((r) => within(r).getAllByRole('cell')[0].textContent)
}

function muitas(n: number): Contrato[] {
  return Array.from({ length: n }, (_, i) => ({
    id: String(i),
    cliente: `Cliente ${String(i).padStart(2, '0')}`,
    termino: '2027-01-01',
  }))
}

const cabecalho = (nome: string) => screen.getByRole('columnheader', { name: new RegExp(nome) })

describe('TabelaDados', () => {
  it('ordena de A a Z em pt-BR e depois inverte', async () => {
    const u = userEvent.setup()
    render(<TabelaDados colunas={COLUNAS} linhas={CONTRATOS} chave={(l) => l.id} vazio={VAZIO} />)
    await u.click(screen.getByRole('button', { name: 'Ordenar por Cliente' }))
    expect(cabecalho('Cliente')).toHaveAttribute('aria-sort', 'ascending')
    expect(clientesNaOrdem()).toEqual(['álvaro Agro', 'Marta Clínica', 'Zélia Transportes'])
    await u.click(screen.getByRole('button', { name: 'Ordenar por Cliente' }))
    expect(cabecalho('Cliente')).toHaveAttribute('aria-sort', 'descending')
    expect(clientesNaOrdem()).toEqual(['Zélia Transportes', 'Marta Clínica', 'álvaro Agro'])
    expect(cabecalho('Término')).not.toHaveAttribute('aria-sort')
  })

  it('coluna sem ordenarPor não tem botão no título', () => {
    render(<TabelaDados colunas={COLUNAS} linhas={CONTRATOS} chave={(l) => l.id} vazio={VAZIO} />)
    expect(screen.queryByRole('button', { name: 'Ordenar por Término' })).not.toBeInTheDocument()
  })

  it('alinha à direita o cabeçalho e as células', () => {
    const colunas: Coluna<Contrato>[] = [{ ...COLUNAS[1], alinhar: 'direita' }]
    render(<TabelaDados colunas={colunas} linhas={CONTRATOS} chave={(l) => l.id} vazio={VAZIO} />)
    expect(cabecalho('Término')).toHaveClass('text-right')
    expect(screen.getAllByRole('cell')[0]).toHaveClass('text-right')
  })

  it('clicar na linha chama a função com a linha', async () => {
    const u = userEvent.setup()
    const aoClicar = vi.fn()
    render(
      <TabelaDados colunas={COLUNAS} linhas={CONTRATOS} chave={(l) => l.id} aoClicarLinha={aoClicar} vazio={VAZIO} />,
    )
    await u.click(screen.getByText('Marta Clínica'))
    expect(aoClicar).toHaveBeenCalledWith(CONTRATOS[2])
  })

  it('Enter e Espaço na linha focada chamam a função', async () => {
    const u = userEvent.setup()
    const aoClicar = vi.fn()
    render(
      <TabelaDados colunas={COLUNAS} linhas={CONTRATOS} chave={(l) => l.id} aoClicarLinha={aoClicar} vazio={VAZIO} />,
    )
    const linha = screen.getAllByRole('row')[1]
    expect(linha).toHaveAttribute('tabindex', '0')
    linha.focus()
    await u.keyboard('{Enter}')
    expect(aoClicar).toHaveBeenCalledTimes(1)
    expect(aoClicar).toHaveBeenLastCalledWith(CONTRATOS[0])
    await u.keyboard(' ')
    expect(aoClicar).toHaveBeenCalledTimes(2)
  })

  it('sem aoClicarLinha, a linha não é focável', () => {
    render(<TabelaDados colunas={COLUNAS} linhas={CONTRATOS} chave={(l) => l.id} vazio={VAZIO} />)
    expect(screen.getAllByRole('row')[1]).not.toHaveAttribute('tabindex')
  })

  it('destaque vira data-destaque na linha', () => {
    render(
      <TabelaDados
        colunas={COLUNAS}
        linhas={CONTRATOS}
        chave={(l) => l.id}
        destaque={(l) => (l.id === 'a' ? 'problema' : null)}
        vazio={VAZIO}
      />,
    )
    const linhas = screen.getAllByRole('row')
    expect(linhas[1]).toHaveAttribute('data-destaque', 'problema')
    expect(linhas[2]).not.toHaveAttribute('data-destaque')
  })

  it('pagina: Página 1 de 3, números em font-mono, próxima página', async () => {
    const u = userEvent.setup()
    render(<TabelaDados colunas={COLUNAS} linhas={muitas(25)} chave={(l) => l.id} porPagina={10} vazio={VAZIO} />)
    expect(screen.getByText(/^Página +de/)).toHaveTextContent('Página 1 de 3')
    expect(screen.getByText('1')).toHaveClass('font-mono')
    expect(screen.getByText('3')).toHaveClass('font-mono')
    expect(screen.getAllByRole('row')).toHaveLength(11)
    await u.click(screen.getByRole('button', { name: 'Próxima página' }))
    expect(screen.getByText(/^Página +de/)).toHaveTextContent('Página 2 de 3')
    expect(screen.getByText('Cliente 10')).toBeInTheDocument()
  })

  it('ordenar volta para a página 1', async () => {
    const u = userEvent.setup()
    render(<TabelaDados colunas={COLUNAS} linhas={muitas(25)} chave={(l) => l.id} porPagina={10} vazio={VAZIO} />)
    await u.click(screen.getByRole('button', { name: 'Próxima página' }))
    await u.click(screen.getByRole('button', { name: 'Ordenar por Cliente' }))
    expect(screen.getByText(/^Página +de/)).toHaveTextContent('Página 1 de 3')
  })

  it('se a quantidade por página muda, a página atual não passa da última', async () => {
    const u = userEvent.setup()
    const linhas = muitas(25)
    const { rerender } = render(
      <TabelaDados colunas={COLUNAS} linhas={linhas} chave={(l) => l.id} porPagina={10} vazio={VAZIO} />,
    )
    await u.click(screen.getByRole('button', { name: 'Próxima página' }))
    await u.click(screen.getByRole('button', { name: 'Próxima página' }))
    expect(screen.getByText(/^Página\s+de/)).toHaveTextContent('Página 3 de 3')
    rerender(<TabelaDados colunas={COLUNAS} linhas={linhas} chave={(l) => l.id} porPagina={20} vazio={VAZIO} />)
    expect(screen.getByText(/^Página\s+de/)).toHaveTextContent('Página 2 de 2')
  })

  it('com menos linhas, volta à página 1 e some a paginação quando cabe numa página', async () => {
    const u = userEvent.setup()
    const { rerender } = render(
      <TabelaDados colunas={COLUNAS} linhas={muitas(25)} chave={(l) => l.id} porPagina={10} vazio={VAZIO} />,
    )
    await u.click(screen.getByRole('button', { name: 'Próxima página' }))
    rerender(<TabelaDados colunas={COLUNAS} linhas={muitas(12)} chave={(l) => l.id} porPagina={10} vazio={VAZIO} />)
    expect(screen.getByText(/^Página\s+de/)).toHaveTextContent('Página 1 de 2')
    rerender(<TabelaDados colunas={COLUNAS} linhas={muitas(5)} chave={(l) => l.id} porPagina={10} vazio={VAZIO} />)
    expect(screen.queryByText(/^Página\s+de/)).not.toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(6)
  })

  it('outras linhas com a mesma quantidade também voltam à página 1', async () => {
    const u = userEvent.setup()
    const { rerender } = render(
      <TabelaDados colunas={COLUNAS} linhas={muitas(25)} chave={(l) => l.id} porPagina={10} vazio={VAZIO} />,
    )
    await u.click(screen.getByRole('button', { name: 'Próxima página' }))
    expect(screen.getByText(/^Página\s+de/)).toHaveTextContent('Página 2 de 3')
    const outras = muitas(25).map((l) => ({ ...l, id: `x${l.id}` }))
    rerender(<TabelaDados colunas={COLUNAS} linhas={outras} chave={(l) => l.id} porPagina={10} vazio={VAZIO} />)
    expect(screen.getByText(/^Página\s+de/)).toHaveTextContent('Página 1 de 3')
  })

  it('o Espaço na linha tem o comportamento padrão cancelado', () => {
    render(
      <TabelaDados colunas={COLUNAS} linhas={CONTRATOS} chave={(l) => l.id} aoClicarLinha={() => {}} vazio={VAZIO} />,
    )
    const linha = screen.getAllByRole('row')[1]
    expect(fireEvent.keyDown(linha, { key: ' ' })).toBe(false)
  })

  it('clique em botão dentro da célula não aciona a linha', async () => {
    const u = userEvent.setup()
    const aoClicar = vi.fn()
    const aoBotao = vi.fn()
    const colunas: Coluna<Contrato>[] = [
      ...COLUNAS,
      { id: 'acao', titulo: 'Ação', celula: (l) => <button onClick={() => aoBotao(l.id)}>Abrir {l.id}</button> },
    ]
    render(<TabelaDados colunas={colunas} linhas={CONTRATOS} chave={(l) => l.id} aoClicarLinha={aoClicar} vazio={VAZIO} />)
    await u.click(screen.getByRole('button', { name: 'Abrir a' }))
    expect(aoBotao).toHaveBeenCalledWith('a')
    expect(aoClicar).not.toHaveBeenCalled()
  })

  it('valores ausentes na ordenação ficam sempre por último', async () => {
    const u = userEvent.setup()
    type L = { id: string; v: number | null | undefined | string }
    const linhas: L[] = [
      { id: 'vazio', v: '' },
      { id: 'dois', v: 2 },
      { id: 'nulo', v: null },
      { id: 'um', v: 1 },
      { id: 'nan', v: NaN },
      { id: 'indef', v: undefined },
    ]
    const colunas: Coluna<L>[] = [
      { id: 'id', titulo: 'Id', celula: (l) => l.id },
      { id: 'v', titulo: 'V', celula: () => null, ordenarPor: (l) => l.v as number },
    ]
    render(<TabelaDados colunas={colunas} linhas={linhas} chave={(l) => l.id} vazio={VAZIO} />)
    const ids = () => clientesNaOrdem().slice(0, 2)
    await u.click(screen.getByRole('button', { name: 'Ordenar por V' }))
    expect(ids()).toEqual(['um', 'dois'])
    await u.click(screen.getByRole('button', { name: 'Ordenar por V' }))
    expect(ids()).toEqual(['dois', 'um'])
  })

  it('com uma página só, não há paginação', () => {
    render(<TabelaDados colunas={COLUNAS} linhas={CONTRATOS} chave={(l) => l.id} vazio={VAZIO} />)
    expect(screen.queryByText(/^Página +de/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Próxima página' })).not.toBeInTheDocument()
  })

  it('sem linhas, mostra o vazio no lugar da tabela', () => {
    render(<TabelaDados colunas={COLUNAS} linhas={[]} chave={(l) => l.id} vazio={VAZIO} />)
    expect(screen.getByText('Nada por aqui')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('a tabela rola dentro de um elemento com overflow-x-auto', () => {
    render(<TabelaDados colunas={COLUNAS} linhas={CONTRATOS} chave={(l) => l.id} vazio={VAZIO} />)
    expect(screen.getByRole('table').closest('.overflow-x-auto')).not.toBeNull()
  })
})
