import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { EtapaJornada, LinhaEtapaDetalhada, StatusEtapa } from '@/lib/dados/tipos'
import { Jornada } from './jornada'

const ORDEM: EtapaJornada[] = ['Diagnosticar', 'Estruturar', 'Implementar', 'Monitorar', 'Evoluir']

/** As 5 etapas com os status dados; a Em andamento tem responsável e início. */
const etapas = (...status: StatusEtapa[]): LinhaEtapaDetalhada[] =>
  ORDEM.map((etapa, i) => ({
    etapa,
    status: status[i],
    responsavelId: status[i] === 'Em andamento' ? 'usr-rafael' : null,
    nomeResponsavel: status[i] === 'Em andamento' ? 'Rafael Souza' : '',
    inicio: status[i] === 'Em andamento' ? '2026-03-05' : null,
    conclusao: null,
    observacoes: '',
  }))

/** As etapas da Mobilização: Diagnosticar e Estruturar Não aplicáveis, Implementar Em andamento. */
const MOBILIZACAO = etapas('Não aplicável', 'Não aplicável', 'Em andamento', 'Não iniciada', 'Não iniciada')

const cartao = (etapa: string) => screen.getByRole('article', { name: etapa })

function montar(props: Partial<Parameters<typeof Jornada>[0]> = {}) {
  return render(
    <Jornada
      etapas={MOBILIZACAO}
      etapaAtual="Implementar"
      progresso={{ concluidas: 0, aplicaveis: 3 }}
      fechado={false}
      {...props}
    />,
  )
}

describe('Jornada (F06; parte 3, 5.10 e 5.13)', () => {
  it('é o painel Jornada ELO com as 5 etapas na ordem oficial', () => {
    montar()
    expect(screen.getByRole('region', { name: 'Jornada ELO' })).toBeInTheDocument()
    expect(screen.getAllByRole('article').map((a) => a.getAttribute('aria-label'))).toEqual(ORDEM)
  })

  it('o cabeçalho diz a etapa atual e o progresso nas etapas aplicáveis (CA-06.10)', () => {
    montar()
    const painel = screen.getByRole('region', { name: 'Jornada ELO' })
    expect(painel.querySelector('h2')?.parentElement).toHaveTextContent('Etapa atual: Implementar · 0 de 3 etapas')
  })

  it('destaca a etapa atual e apaga as Não aplicáveis', () => {
    montar()
    expect(cartao('Implementar')).toHaveAttribute('data-atual', 'true')
    expect(cartao('Monitorar')).not.toHaveAttribute('data-atual')
    expect(cartao('Diagnosticar')).toHaveAttribute('data-aplicavel', 'false')
    expect(cartao('Estruturar')).toHaveAttribute('data-aplicavel', 'false')
    expect(cartao('Implementar')).not.toHaveAttribute('data-aplicavel')
  })

  it('cada cartão traz o status, o responsável e as datas', () => {
    montar()
    const implementar = within(cartao('Implementar'))
    expect(implementar.getByText('Em andamento')).toBeInTheDocument()
    expect(implementar.getByText('Rafael Souza')).toBeInTheDocument()
    expect(implementar.getByText('05/03/2026')).toHaveClass('font-mono')
    const monitorar = within(cartao('Monitorar'))
    expect(monitorar.getByText('Sem responsável')).toBeInTheDocument()
    expect(monitorar.getAllByText('—')).toHaveLength(2)
  })

  it('com o escopo fechado, avisa que as etapas não mudam (RN-23)', () => {
    montar({ fechado: true })
    expect(screen.getByText('As etapas não mudam com o escopo fechado.')).toBeInTheDocument()
  })

  it('aberto, sem o aviso', () => {
    montar()
    expect(screen.queryByText('As etapas não mudam com o escopo fechado.')).not.toBeInTheDocument()
  })

  it('a ação de uma etapa aparece só no cartão dela', () => {
    montar({ acoes: { Estruturar: <button type="button">Atualizar</button> } })
    expect(within(cartao('Estruturar')).getByRole('button', { name: 'Atualizar' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Atualizar' })).toHaveLength(1)
  })
})
