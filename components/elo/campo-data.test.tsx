import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { CampoData, dataLocal, textoDaData } from './campo-data'

describe('CampoData', () => {
  it('aplica a máscara e entrega AAAA-MM-DD', async () => {
    const onChange = vi.fn()
    render(<CampoData id="d" valor={null} onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), '09112026')
    expect(screen.getByRole('textbox')).toHaveValue('09/11/2026')
    expect(onChange).toHaveBeenLastCalledWith('2026-11-09')
  })

  it('data que não existe no calendário entrega null', async () => {
    const onChange = vi.fn()
    render(<CampoData id="d" valor={null} onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), '31/02/2026')
    expect(screen.getByRole('textbox')).toHaveValue('31/02/2026')
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('mostra o valor recebido em dd/mm/aaaa', () => {
    render(<CampoData id="d" valor="2026-11-09" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('09/11/2026')
  })

  it('abre o calendário em português no mês do valor', async () => {
    render(<CampoData id="d" valor="2026-11-09" onChange={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir calendário' }))
    const dialogo = await screen.findByRole('dialog')
    expect(within(dialogo).getByText(/novembro 2026/i)).toBeInTheDocument()
  })

  it('escolher um dia do calendário entrega AAAA-MM-DD', async () => {
    const onChange = vi.fn()
    render(<CampoData id="d" valor="2026-11-09" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir calendário' }))
    const dialogo = await screen.findByRole('dialog')
    await userEvent.click(within(dialogo).getByRole('button', { name: /15 de novembro de 2026/ }))
    expect(onChange).toHaveBeenCalledWith('2026-11-15')
  })
})

describe('datas no fuso de Brasília', () => {
  const fusoOriginal = process.env.TZ
  beforeAll(() => {
    process.env.TZ = 'America/Sao_Paulo'
  })
  afterAll(() => {
    if (fusoOriginal === undefined) delete process.env.TZ
    else process.env.TZ = fusoOriginal
  })

  it('2026-11-09 volta como 2026-11-09, sem cair para o dia 8', () => {
    const d = dataLocal('2026-11-09')
    expect(d).not.toBeNull()
    expect(d!.getDate()).toBe(9)
    expect(textoDaData(d!)).toBe('2026-11-09')
  })

  it('rejeita data que não existe', () => {
    expect(dataLocal('2026-02-31')).toBeNull()
    expect(dataLocal('lixo')).toBeNull()
    expect(dataLocal('2026-13-01')).toBeNull()
  })

  it('o dia selecionado no calendário é o 9', async () => {
    render(<CampoData id="d" valor="2026-11-09" onChange={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir calendário' }))
    const dialogo = await screen.findByRole('dialog')
    const selecionado = within(dialogo).getByRole('gridcell', { selected: true })
    expect(selecionado).toHaveTextContent(/^9$/)
  })
})
