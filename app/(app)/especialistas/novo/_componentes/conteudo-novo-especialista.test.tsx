import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { ConteudoEditarEspecialista } from '../../[id]/editar/_componentes/conteudo-editar-especialista'
import { metadata as metadataEditar } from '../../[id]/editar/page'
import { metadata } from '../page'
import { ConteudoNovoEspecialista } from './conteudo-novo-especialista'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  sessionStorage.clear()
})

const editar = (id: string) => ConteudoEditarEspecialista({ params: Promise.resolve({ id }) })

describe('novo especialista (parte 5, 5.5)', () => {
  it('tem os títulos das abas', () => {
    expect(metadata.title).toBe('Novo especialista | Plataforma ELO')
    expect(metadataEditar.title).toBe('Editar especialista | Plataforma ELO')
  })

  it('a Helena vê o formulário, com o status Em análise ou Ativo (6.1)', async () => {
    entrarComo('usr-helena')
    render(await ConteudoNovoEspecialista())
    expect(screen.getByRole('heading', { level: 1, name: 'Novo especialista' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para Especialistas' })).toHaveAttribute('href', '/especialistas')
    expect(screen.getByRole('textbox', { name: /Nome/ })).toHaveValue('')
    await userEvent.click(screen.getByRole('combobox', { name: /Status/ }))
    expect((await screen.findAllByRole('option')).map((o) => o.textContent)).toEqual(['Em análise', 'Ativo'])
  })

  it('a Equipe vê acesso negado (matriz 4.3)', async () => {
    entrarComo('usr-rafael')
    render(await ConteudoNovoEspecialista())
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /Nome/ })).not.toBeInTheDocument()
  })
})

describe('editar especialista (parte 5, 5.5)', () => {
  it('a Helena vê o formulário preenchido, a origem só para leitura e os três status', async () => {
    entrarComo('usr-helena')
    render(await editar('esp-suprimentos'))
    expect(screen.getByRole('textbox', { name: /Nome/ })).toHaveValue('Caio Moreira')
    expect(screen.getByRole('textbox', { name: /E-mail/ })).toHaveValue('caio.moreira@exemplo.com.br')
    expect(screen.getByText('Site')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para Caio Moreira' })).toHaveAttribute('href', '/especialistas/esp-suprimentos')
    await userEvent.click(screen.getByRole('combobox', { name: /Status/ }))
    expect((await screen.findAllByRole('option')).map((o) => o.textContent)).toEqual(['Em análise', 'Ativo', 'Inativo'])
  })

  it('a Equipe vê acesso negado; id que não existe, não encontrado', async () => {
    entrarComo('usr-rafael')
    render(await editar('esp-suprimentos'))
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
    await expect(editar('esp-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
