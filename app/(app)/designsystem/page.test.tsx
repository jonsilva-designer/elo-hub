import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { STATUS_POR_TOM } from '@/lib/design/status'
import Pagina from './page'

function renderizar() {
  return render(
    <TooltipProvider>
      <Pagina />
    </TooltipProvider>,
  )
}

// Ignora os títulos dos componentes em demonstração (marcados com data-demo), que também são h2.
const titulos = (nivel: number) =>
  screen
    .getAllByRole('heading', { level: nivel })
    .filter((h) => !h.closest('[data-demo]'))
    .map((h) => h.textContent)

describe('página /designsystem', () => {
  it('mostra o título da página', () => {
    renderizar()
    expect(screen.getByRole('heading', { level: 1, name: 'Padrão visual' })).toBeInTheDocument()
  })

  it('mostra as seções na ordem', () => {
    renderizar()
    expect(titulos(2)).toEqual([
      'Marca',
      'Tipografia',
      'Cantos, espaçamento, sombras e ícones',
      'Componentes',
    ])
  })

  it('mostra os subtítulos de Componentes na ordem', () => {
    renderizar()
    expect(titulos(3)).toEqual(['Ações', 'Formulário', 'Exibição', 'Tabela', 'Retorno'])
  })

  it('marca como provisórias as linhas de Azul-marinho e Dourado', () => {
    renderizar()
    const linhas = screen.getAllByRole('row')
    const linhaDe = (padrao: RegExp) => linhas.find((l) => padrao.test(l.textContent ?? ''))
    expect(linhaDe(/^Azul-marinho/)).toHaveTextContent('provisória')
    expect(linhaDe(/^Dourado(?! (suave|escuro))/)).toHaveTextContent('provisória')
    expect(linhaDe(/^Papel/)).not.toHaveTextContent('provisória')
  })

  it('mostra os quatro indicadores', () => {
    renderizar()
    for (const r of ['Clientes ativos', 'Contratos vigentes', 'Atividades abertas', 'Demandas abertas']) {
      expect(screen.getByText(r)).toBeInTheDocument()
    }
  })

  it('não tem emoji nem o nome da cliente', () => {
    const { container } = renderizar()
    const texto = container.textContent ?? ''
    expect(texto).not.toMatch(/\p{Extended_Pictographic}/u)
    expect(texto).not.toContain('Cleo')
  })

  it('mostra todos os status da tabela de tons', () => {
    renderizar()
    for (const s of Object.values(STATUS_POR_TOM).flat()) {
      expect(screen.getAllByText(s).length).toBeGreaterThan(0)
    }
  })
})
