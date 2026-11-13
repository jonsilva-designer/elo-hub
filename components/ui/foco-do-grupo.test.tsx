import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SelecaoMultipla } from '@/components/elo/selecao-multipla'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './input-group'

// Campo com prefixo (R$, lupa, calendário) ou com fichas: o contorno de foco envolve o grupo inteiro,
// e não só o campo de dentro, que cortaria o prefixo. A regra fica no globals.css e usa os data-slot reais.
const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8').replace(/\r\n/g, '\n')

function corpoDaRegra(seletorContem: string) {
  const regras = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)]
  return regras.find((r) => r[1].includes(seletorContem))?.[2]
}

describe('foco do grupo de campo', () => {
  it('o grupo ganha o contorno de 2px azul-marinho, afastado 2px, quando o campo de dentro tem foco', () => {
    const corpo = corpoDaRegra('[data-slot="input-group"]:has([data-slot="input-group-control"]:focus-visible)')
    expect(corpo, 'regra do grupo').toBeDefined()
    expect(corpo).toMatch(/outline:\s*2px solid var\(--ring\)/)
    expect(corpo).toMatch(/outline-offset:\s*2px/)
  })

  it('a caixa de fichas da seleção múltipla tem o mesmo contorno', () => {
    const corpo = corpoDaRegra('[data-slot="combobox-chips"]:has([data-slot="combobox-chip-input"]:focus-visible)')
    expect(corpo, 'regra da caixa de fichas').toBeDefined()
    expect(corpo).toMatch(/outline:\s*2px solid var\(--ring\)/)
  })

  it('o campo de dentro não desenha o próprio contorno', () => {
    const corpo = corpoDaRegra('[data-slot="input-group-control"], [data-slot="combobox-chips"] [data-slot="combobox-chip-input"]):focus-visible')
    expect(corpo, 'regra que tira o contorno de dentro').toBeDefined()
    expect(corpo).toMatch(/outline:\s*none\s*!important/)
  })

  it('os data-slot da regra são os que os componentes desenham', () => {
    const { container } = render(
      <>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>R$</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput aria-label="Valor" />
        </InputGroup>
        <SelecaoMultipla opcoes={[{ valor: 'ana', rotulo: 'Ana' }]} valores={[]} onChange={() => {}} />
      </>,
    )
    const valor = screen.getByRole('textbox', { name: 'Valor' })
    expect(valor).toHaveAttribute('data-slot', 'input-group-control')
    expect(valor.closest('[data-slot="input-group"]')).not.toBeNull()
    const fichas = container.querySelector('[data-slot="combobox-chips"]')
    expect(fichas).not.toBeNull()
    expect(fichas!.querySelector('[data-slot="combobox-chip-input"]')).toBe(screen.getByRole('combobox'))
  })
})
