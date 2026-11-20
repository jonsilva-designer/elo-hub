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

  it('colar uma data AAAA-MM-DD vira dd/mm/aaaa', async () => {
    const onChange = vi.fn()
    render(<CampoData id="d" valor={null} onChange={onChange} />)
    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.paste('2026-11-09')
    expect(screen.getByRole('textbox')).toHaveValue('09/11/2026')
    expect(onChange).toHaveBeenLastCalledWith('2026-11-09')
  })

  it('ano fora de 1900 a 2100 entrega null', async () => {
    const onChange = vi.fn()
    render(<CampoData id="d" valor={null} onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), '09110202')
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('apagar atravessa a barra', async () => {
    render(<CampoData id="d" valor={null} onChange={() => {}} />)
    const campo = screen.getByRole('textbox')
    await userEvent.type(campo, '091')
    expect(campo).toHaveValue('09/1')
    await userEvent.keyboard('{Backspace}')
    expect(campo).toHaveValue('09')
    await userEvent.keyboard('{Backspace}')
    expect(campo).toHaveValue('0')
  })

  it('mostra o valor recebido em dd/mm/aaaa', () => {
    render(<CampoData id="d" valor="2026-11-09" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('09/11/2026')
  })

  it('abre o calendário em português no mês do valor', async () => {
    render(<CampoData id="d" valor="2026-11-09" onChange={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir calendário' }))
    const dialogo = await screen.findByRole('dialog')
    const titulo = within(dialogo).getByRole('status')
    expect(titulo).toHaveTextContent('novembro de 2026')
    // Números sempre em JetBrains Mono: o ano em mono, "novembro de" em Montserrat.
    expect(within(titulo).getByText('2026')).toHaveClass('font-mono')
    expect(within(titulo).getByText(/novembro de/)).not.toHaveClass('font-mono')
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

describe('CampoData, revisão do código', () => {
  it('data completa que não existe ou fora de 1900 a 2100 mostra o erro, e não fica igual a campo vazio', async () => {
    render(<CampoData id="d" valor={null} onChange={vi.fn()} />)
    const campo = screen.getByRole('textbox')
    await userEvent.type(campo, '31/02/2026')
    expect(campo).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Data inválida. Use dd/mm/aaaa, com ano de 1900 a 2100.')).toBeInTheDocument()
    expect(campo).toHaveAccessibleDescription('Data inválida. Use dd/mm/aaaa, com ano de 1900 a 2100.')
    await userEvent.clear(campo)
    await userEvent.type(campo, '10/05/1800')
    expect(campo).toHaveAttribute('aria-invalid', 'true')
  })

  it('a data ainda incompleta não mostra erro', async () => {
    render(<CampoData id="d" valor={null} onChange={vi.fn()} />)
    await userEvent.type(screen.getByRole('textbox'), '10/05')
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByText(/Data inválida/)).not.toBeInTheDocument()
  })

  it('colar d/m/aaaa sem zeros completa os zeros, em vez de embaralhar os algarismos', async () => {
    const onChange = vi.fn()
    render(<CampoData id="d" valor={null} onChange={onChange} />)
    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.paste('10/5/2024')
    expect(screen.getByRole('textbox')).toHaveValue('10/05/2024')
    expect(onChange).toHaveBeenLastCalledWith('2024-05-10')
  })

  it('a barra digitada depois de um algarismo só completa o zero', async () => {
    render(<CampoData id="d" valor={null} onChange={vi.fn()} />)
    await userEvent.type(screen.getByRole('textbox'), '1/5/')
    expect(screen.getByRole('textbox')).toHaveValue('01/05/')
  })
})
