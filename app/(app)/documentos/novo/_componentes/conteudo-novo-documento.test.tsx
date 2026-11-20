import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { MENSAGENS_ARQUIVO } from '@/lib/documentos/regras'
import { MENSAGENS_DOCUMENTO } from '@/lib/documentos/validacao'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoNovoDocumento } from './conteudo-novo-documento'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  sessionStorage.clear()
})

const novo = (busca: Record<string, string> = {}) => ConteudoNovoDocumento({ searchParams: Promise.resolve(busca) })

async function opcoesDe(campo: RegExp) {
  await userEvent.click(screen.getByRole('combobox', { name: campo }))
  const opcoes = (await screen.findAllByRole('option')).map((o) => o.textContent)
  await userEvent.keyboard('{Escape}')
  return opcoes
}

async function escolher(campo: RegExp, opcao: string) {
  await userEvent.click(screen.getByRole('combobox', { name: campo }))
  await userEvent.click(await screen.findByRole('option', { name: opcao }))
}

describe('incluir documento (parte 6, 4.2 e 4.4)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Incluir documento | Plataforma ELO')
  })

  it('aberta pela lista, volta para a lista; a Equipe só escolhe clientes vinculados (CA-12.5)', async () => {
    entrarComo('usr-rafael')
    render(await novo())
    expect(screen.getByRole('heading', { level: 1, name: 'Incluir documento' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para Documentos' })).toHaveAttribute('href', '/documentos')
    expect(await opcoesDe(/Cliente/)).toEqual(['Atlântica Portos', 'Rede Norte TI', 'Vértice Manutenção'])
    expect(await opcoesDe(/Categoria/)).toHaveLength(12)
  })

  it('aberta por uma atividade, já vem ligada a ela e aos registros acima, e volta para ela', async () => {
    entrarComo('usr-rafael')
    render(await novo({ atividade: 'atv-licencas-protocolo' }))
    expect(screen.getByRole('link', { name: 'Voltar para Protocolar a renovação da licença de operação' })).toHaveAttribute(
      'href',
      '/atividades/atv-licencas-protocolo/editar',
    )
    expect(screen.getByRole('combobox', { name: /Cliente/ })).toHaveTextContent('Vértice Manutenção')
    expect(screen.getByRole('combobox', { name: /Escopo Contratado/ })).toHaveTextContent('Regularização documental')
    expect(screen.getByRole('combobox', { name: /Plano de ação/ })).toHaveTextContent('Regularização das licenças')
    expect(screen.getByRole('combobox', { name: /Atividade/ })).toHaveTextContent('Protocolar a renovação da licença de operação')
  })

  it('trocar o escopo limpa a etapa escolhida para o anterior (revisão do código)', async () => {
    entrarComo('usr-helena')
    render(await novo({ escopo: 'esc-vertice-documental', etapa: 'Monitorar' }))
    await escolher(/Escopo Contratado/, 'Programa de qualidade')
    expect(screen.getByRole('combobox', { name: /Etapa da Jornada/ })).toHaveTextContent('Nenhuma')
  })

  it('aberta pelo escopo com a etapa, a etapa vem escolhida', async () => {
    entrarComo('usr-helena')
    render(await novo({ escopo: 'esc-vertice-documental', etapa: 'Monitorar' }))
    expect(screen.getByRole('combobox', { name: /Etapa da Jornada/ })).toHaveTextContent('Monitorar')
  })

  it('pelo especialista, vem o Documento do Especialista; só o Administrador tem "Sem cliente" (DF-65)', async () => {
    entrarComo('usr-helena')
    const { unmount } = render(await novo({ especialista: 'esp-juridico' }))
    expect(screen.getByRole('combobox', { name: /Categoria/ })).toHaveTextContent('Documento do Especialista')
    expect(screen.getByRole('combobox', { name: /Especialista/ })).toHaveTextContent('Beatriz Fontes')
    expect(await opcoesDe(/Cliente/)).toContain('Sem cliente')
    unmount()
    entrarComo('usr-rafael')
    render(await novo({ especialista: 'esp-juridico' }))
    expect(await opcoesDe(/Cliente/)).not.toContain('Sem cliente')
  })

  it('trocar o cliente limpa os vínculos do anterior (RN-02)', async () => {
    entrarComo('usr-rafael')
    render(await novo({ escopo: 'esc-vertice-documental' }))
    await escolher(/Cliente/, 'Atlântica Portos')
    expect(screen.getByRole('combobox', { name: /Escopo Contratado/ })).toHaveTextContent('Nenhum')
    expect(await opcoesDe(/Contrato/)).toEqual(['Nenhum', 'CT-2024-008 · Porto do Açu', 'CT-2026-019 · Petrobras'])
  })

  it('o arquivo fora do formato é recusado na tela, antes de enviar (CA-12.2)', async () => {
    entrarComo('usr-rafael')
    render(<TooltipProvider>{await novo()}</TooltipProvider>)
    await userEvent.upload(screen.getByLabelText(/Arquivo/), new File(['x'], 'planilha.csv', { type: 'text/csv' }), {
      applyAccept: false,
    })
    expect(screen.getByText(MENSAGENS_ARQUIVO.formato)).toBeInTheDocument()
  })

  it('enviar sem nada mostra o que falta, com as mensagens do servidor (CA-12.1)', async () => {
    entrarComo('usr-rafael')
    render(await novo())
    await userEvent.click(screen.getByRole('button', { name: 'Incluir documento' }))
    expect(await screen.findByText(MENSAGENS_DOCUMENTO.nome)).toBeInTheDocument()
    expect(screen.getByText(MENSAGENS_DOCUMENTO.cliente)).toBeInTheDocument()
    expect(screen.getByText(MENSAGENS_ARQUIVO.falta)).toBeInTheDocument()
  })

  it('a nova versão vem preenchida com o anterior e avisa que ele passa a Superado (DF-44)', async () => {
    entrarComo('usr-rafael')
    render(await novo({ substitui: 'doc-vertice-levantamento' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Nova versão' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para Relatório do levantamento documental' })).toHaveAttribute(
      'href',
      '/documentos/doc-vertice-levantamento',
    )
    expect(screen.getByText(/Ao salvar, o anterior passa a Superado/)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Nome/ })).toHaveValue('Relatório do levantamento documental')
    expect(screen.getByRole('combobox', { name: /Etapa da Jornada/ })).toHaveTextContent('Diagnosticar')
  })

  it('nova versão: sem poder alterar, acesso negado; fora do acesso, não encontrado; não Vigente, o aviso (DF-65, CA-12.5)', async () => {
    entrarComo('usr-rafael')
    const { unmount } = render(await novo({ substitui: 'doc-especialista-curriculo' }))
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
    unmount()
    await expect(novo({ substitui: 'doc-montareal-cronograma' })).rejects.toThrow('NEXT_NOT_FOUND')
    entrarComo('usr-helena')
    render(await novo({ substitui: 'doc-vertice-aditivo-minuta' }))
    expect(screen.getByText(MENSAGENS_DOCUMENTO.soVigente)).toBeInTheDocument()
  })

  it('vínculo fora do alcance ou que não existe, "não encontrado" (CA-12.5)', async () => {
    entrarComo('usr-rafael')
    await expect(novo({ escopo: 'esc-montareal-montagem' })).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(novo({ cliente: 'cli-montareal' })).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(novo({ atividade: 'atv-nao-existe' })).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
