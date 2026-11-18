import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoEditarDocumento } from './conteudo-editar-documento'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  push.mockReset()
})

const editar = (id: string) => ConteudoEditarDocumento({ params: Promise.resolve({ id }) })

describe('editar documento (parte 6, 4.2; matriz 4.3)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Editar documento | Plataforma ELO')
  })

  it('vem preenchido, com a data editável e o arquivo só leitura; salvar volta para a página', async () => {
    entrarComo('usr-rafael')
    render(await editar('doc-vertice-protocolo-licenca'))
    expect(screen.getByRole('heading', { level: 1, name: 'Editar documento' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para Protocolo da renovação da licença de operação' })).toHaveAttribute(
      'href',
      '/documentos/doc-vertice-protocolo-licenca',
    )
    expect(screen.getByRole('textbox', { name: /Nome/ })).toHaveValue('Protocolo da renovação da licença de operação')
    expect(screen.getByRole('combobox', { name: /Atividade/ })).toHaveTextContent('Protocolar a renovação da licença de operação')
    expect(screen.getByRole('textbox', { name: /Data do documento/ })).toHaveValue('21/10/2026')
    expect(screen.getByText('Protocolo LO 2026.pdf')).toBeInTheDocument()
    expect(screen.getByText('Para trocar o arquivo, envie uma nova versão.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Escolher arquivo/ })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith('/documentos/doc-vertice-protocolo-licenca'))
  })

  it('a Equipe no currículo sem cliente vê o acesso negado (DF-65)', async () => {
    entrarComo('usr-rafael')
    render(await editar('doc-especialista-curriculo'))
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
  })

  it('o Administrador edita o currículo sem cliente, com "Sem cliente" no cliente', async () => {
    entrarComo('usr-helena')
    render(await editar('doc-especialista-curriculo'))
    expect(screen.getByRole('combobox', { name: /Cliente/ })).toHaveTextContent('Sem cliente')
    expect(screen.getByRole('combobox', { name: /Especialista/ })).toHaveTextContent('Beatriz Fontes')
  })

  it('fora do acesso ou com id que não existe, "não encontrado" (CA-12.5)', async () => {
    entrarComo('usr-rafael')
    await expect(editar('doc-montareal-cronograma')).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(editar('doc-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
