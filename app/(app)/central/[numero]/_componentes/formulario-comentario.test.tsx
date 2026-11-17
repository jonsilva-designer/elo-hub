import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { avisarSalvo } from '@/lib/avisos'
import { comentarDemanda } from '@/lib/demandas/acoes'
import { FormularioComentario } from './formulario-comentario'

vi.mock('@/lib/demandas/acoes', () => ({ comentarDemanda: vi.fn() }))
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))

const ESPECIALISTAS = [{ valor: 'esp-juridico', rotulo: 'Beatriz Fontes' }]

beforeEach(() => {
  vi.mocked(comentarDemanda).mockReset()
  vi.mocked(avisarSalvo).mockReset()
})

const enviado = () => vi.mocked(comentarDemanda).mock.calls[0][1] as FormData

describe('FormularioComentario (parte 5, 5.10; DF-30)', () => {
  it('o comentário comum manda o texto e avisa', async () => {
    vi.mocked(comentarDemanda).mockResolvedValue({ erros: {}, sucesso: 'Comentário registrado. No protótipo, os dados não são gravados.' })
    render(<FormularioComentario numero="ELO-2026-0003" especialistas={ESPECIALISTAS} />)
    expect(screen.queryByRole('combobox', { name: /Especialista/ })).not.toBeInTheDocument()
    await userEvent.type(screen.getByRole('textbox', { name: /Comentário/ }), 'Pedi as certidões.')
    await userEvent.click(screen.getByRole('button', { name: 'Registrar comentário' }))
    await waitFor(() => expect(comentarDemanda).toHaveBeenCalled())
    expect(enviado().get('texto')).toBe('Pedi as certidões.')
    expect(enviado().get('tipo')).toBe('Comentário')
    expect(enviado().get('numero')).toBe('ELO-2026-0003')
    await waitFor(() => expect(avisarSalvo).toHaveBeenCalled())
  })

  it('o contato com especialista mostra o especialista e a data do contato', async () => {
    render(<FormularioComentario numero="ELO-2026-0003" especialistas={ESPECIALISTAS} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Contato com especialista' }))
    expect(screen.getByRole('combobox', { name: /Especialista/ })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Data do contato/ })).toBeInTheDocument()
  })

  it('sem especialista na demanda, o contato não aparece como opção', () => {
    render(<FormularioComentario numero="ELO-2026-0010" especialistas={[]} />)
    expect(screen.queryByRole('radio', { name: 'Contato com especialista' })).not.toBeInTheDocument()
  })
})
