import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { SelecaoDoFormulario } from './selecao-do-formulario'

function Teste({
  inicial = '',
  opcoes,
  rotuloVazio,
}: {
  inicial?: string
  opcoes: readonly (string | { valor: string; rotulo: string })[]
  rotuloVazio?: string
}) {
  const [valor, setValor] = useState(inicial)
  return (
    <form aria-label="formulário">
      <SelecaoDoFormulario
        nome="campo"
        valor={valor}
        aoMudar={setValor}
        opcoes={opcoes}
        rotuloVazio={rotuloVazio}
        atributos={{ id: 'campo', 'aria-label': 'Campo' } as never}
      />
    </form>
  )
}

const oculto = () => document.querySelector('input[type="hidden"][name="campo"]') as HTMLInputElement

async function escolher(opcao: string) {
  await userEvent.click(screen.getByRole('combobox'))
  await userEvent.click(await screen.findByRole('option', { name: opcao }))
}

describe('SelecaoDoFormulario', () => {
  it('manda o valor escolhido num campo oculto, para o envio do formulário', async () => {
    render(<Teste opcoes={['Prospect', 'Ativo']} />)
    expect(oculto()).toHaveValue('')
    await escolher('Ativo')
    expect(oculto()).toHaveValue('Ativo')
  })

  it('com opções de valor e rótulo, mostra o rótulo e manda o valor', async () => {
    render(<Teste opcoes={[{ valor: 'usr-helena', rotulo: 'Helena Prado' }]} />)
    await escolher('Helena Prado')
    expect(oculto()).toHaveValue('usr-helena')
    expect(screen.getByRole('combobox')).toHaveTextContent('Helena Prado')
  })

  it('opcional, tem o item que limpa a escolha', async () => {
    render(<Teste inicial="Energia" opcoes={['Energia']} rotuloVazio="Não informado" />)
    await escolher('Não informado')
    expect(oculto()).toHaveValue('')
  })

  it('obrigatória, não tem o item que limpa', async () => {
    render(<Teste opcoes={['Energia']} />)
    await userEvent.click(screen.getByRole('combobox'))
    expect(await screen.findByRole('option', { name: 'Energia' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Não informado' })).not.toBeInTheDocument()
  })
})

describe('SelecaoDoFormulario depois que o React limpa o formulário', () => {
  it('o reset do formulário (depois de uma ação) não devolve a escolha ao valor inicial', async () => {
    render(<Teste opcoes={['Administrador', 'Equipe']} />)
    await userEvent.click(screen.getByRole('combobox', { name: 'Campo' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Equipe' }))
    ;(screen.getByRole('form', { name: 'formulário' }) as HTMLFormElement).reset()
    expect(await screen.findByRole('combobox', { name: 'Campo' })).toHaveTextContent('Equipe')
    expect(document.querySelector('input[name="campo"]')).toHaveValue('Equipe')
  })
})
