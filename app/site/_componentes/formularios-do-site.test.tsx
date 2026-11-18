import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { reiniciarLimite } from '@/lib/site/protecao'
import { TEXTOS_SITE } from '@/lib/site/textos'
import PaginaDiagnostico, { metadata as metadataDiagnostico } from '../diagnostico/page'
import PaginaEspecialista, { metadata as metadataEspecialista } from '../especialista/page'

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '7.7.7.7' }),
  cookies: async () => ({ get: () => undefined, has: () => false }),
}))

beforeEach(() => reiniciarLimite())

async function digitar(rotulo: RegExp, texto: string) {
  await userEvent.type(screen.getByRole('textbox', { name: rotulo }), texto)
}

describe('formulários do site (parte 9; F19)', () => {
  it('têm os títulos da aba', () => {
    expect(metadataDiagnostico.title).toBe('Solicitar diagnóstico | ELO HUB')
    expect(metadataEspecialista.title).toBe('Seja um especialista | ELO HUB')
  })

  it('o diagnóstico abre sem login; sem o consentimento, recusa; com tudo, a confirmação no lugar do formulário (CA-19.2, CA-19.3)', async () => {
    render(<TooltipProvider>{await PaginaDiagnostico()}</TooltipProvider>)
    expect(screen.getByRole('heading', { level: 1, name: 'Solicitar diagnóstico' })).toBeInTheDocument()
    await digitar(/^Nome/, 'Paula Reis')
    await digitar(/^Empresa/, 'Navalis Serviços Ltda')
    await digitar(/^CNPJ/, '21.473.509/0001-21')
    await digitar(/^E-mail/, 'paula@navalis.com.br')
    await digitar(/^Telefone ou WhatsApp/, '(22) 99999-0000')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar pedido' }))
    expect(await screen.findByText('Para enviar, aceite o uso dos dados.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /^Nome/ })).toHaveValue('Paula Reis')
    await userEvent.click(screen.getByRole('checkbox', { name: /Autorizo a ELO HUB/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Enviar pedido' }))
    expect(await screen.findByText(TEXTOS_SITE.diagnostico.confirmacao)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Enviar pedido' })).not.toBeInTheDocument()
  })

  it('a candidatura pede o aviso e o consentimento, e confirma (CA-19.1, CA-19.2)', async () => {
    render(<TooltipProvider>{await PaginaEspecialista()}</TooltipProvider>)
    expect(screen.getByText(TEXTOS_SITE.especialista.aviso)).toBeInTheDocument()
    await digitar(/^Nome/, 'Otávio Lins')
    await userEvent.click(screen.getByRole('combobox', { name: /Especialidade/ }))
    await userEvent.click(await screen.findByRole('option', { name: 'Gestão de contratos' }))
    await digitar(/^E-mail/, 'beatriz.fontes@exemplo.com.br')
    await digitar(/^Telefone/, '(21) 98888-1111')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar candidatura' }))
    expect(await screen.findByText('Para enviar, marque o aviso.')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /Especialidade/ })).toHaveTextContent('Gestão de contratos')
    await userEvent.click(screen.getByRole('checkbox', { name: /não garante contratação/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: /Autorizo a ELO HUB/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Enviar candidatura' }))
    expect(await screen.findByText(TEXTOS_SITE.especialista.confirmacao)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Enviar outro' }))
    expect(screen.getByRole('textbox', { name: /^Nome/ })).toHaveValue('')
  })
})
