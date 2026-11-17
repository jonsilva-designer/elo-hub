import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ITENS_MENU } from '@/components/elo/navegacao'
import { STATUS_POR_TOM } from '@/lib/design/status'
import Pagina, { metadata } from './page'

function renderizar() {
  return render(
    <TooltipProvider>
      <Pagina />
    </TooltipProvider>,
  )
}

// Ignora os títulos dos componentes em demonstração (marcados com data-demo), que também são h2.
const semDemo = (titulos: HTMLElement[]) =>
  titulos.filter((h) => !h.closest('[data-demo]')).map((h) => h.textContent)

const titulos = (nivel: number) => semDemo(screen.getAllByRole('heading', { level: nivel }))

/** A seção (elemento `section`) do título h2 dado. */
const secao = (titulo: string) =>
  screen.getByRole('heading', { level: 2, name: titulo }).closest('section') as HTMLElement

const MATRIZ: Record<string, string[]> = {
  'Botão principal': ['Normal', 'Passar o mouse', 'Foco', 'Pressionado', 'Desabilitado', 'Carregando'],
  'Botão secundário': ['Normal', 'Passar o mouse', 'Foco', 'Pressionado', 'Desabilitado'],
  'Botão discreto': ['Normal', 'Passar o mouse', 'Foco', 'Pressionado', 'Desabilitado'],
  'Botão perigo': ['Normal', 'Passar o mouse', 'Foco', 'Pressionado', 'Desabilitado'],
  'Campo de texto': ['Normal', 'Passar o mouse', 'Foco', 'Com erro', 'Desabilitado'],
  'Linha de tabela': ['Normal', 'Passar o mouse', 'Foco', 'Destaque de atenção', 'Destaque de problema'],
}

/** Linha da matriz de estados: o bloco que contém o rótulo e as células. */
const linhaDaMatriz = (rotulo: string) =>
  within(secao('Estados de interface')).getByText(rotulo).parentElement as HTMLElement

describe('página /designsystem', () => {
  it('mostra o título da página', () => {
    renderizar()
    expect(screen.getByRole('heading', { level: 1, name: 'Padrão visual' })).toBeInTheDocument()
  })

  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Padrão visual | Plataforma ELO')
  })

  it('mostra as seções na ordem', () => {
    renderizar()
    expect(titulos(2)).toEqual([
      'Marca',
      'Tipografia',
      'Cantos, espaçamento, sombras e ícones',
      'Componentes',
      'Estados de interface',
      'Estrutura da tela',
    ])
  })

  it('mostra os subtítulos de Componentes na ordem', () => {
    renderizar()
    const h3 = within(secao('Componentes')).getAllByRole('heading', { level: 3 })
    expect(semDemo(h3)).toEqual(['Ações', 'Formulário', 'Exibição', 'Tabela', 'Navegação', 'Retorno'])
  })

  it('marca como provisórias as linhas de Azul-marinho e Dourado', () => {
    renderizar()
    const linhas = screen.getAllByRole('row')
    const linhaDe = (padrao: RegExp) => linhas.find((l) => padrao.test(l.textContent ?? ''))
    expect(linhaDe(/^Azul-marinho/)).toHaveTextContent('provisória')
    expect(linhaDe(/^Dourado(?! (suave|escuro))/)).toHaveTextContent('provisória')
    expect(linhaDe(/^Papel/)).not.toHaveTextContent('provisória')
  })

  it('mostra os quatro indicadores', () => {
    renderizar()
    for (const r of ['Clientes ativos', 'Contratos vigentes', 'Atividades abertas', 'Demandas abertas']) {
      expect(screen.getByText(r)).toBeInTheDocument()
    }
  })

  it('não tem emoji nem o nome da cliente', () => {
    const { container } = renderizar()
    const texto = container.textContent ?? ''
    expect(texto).not.toMatch(/\p{Extended_Pictographic}/u)
    expect(texto).not.toContain('Cleo')
  })

  it('a lista de ícones sai do menu real, na mesma ordem', () => {
    renderizar()
    const lista = screen.getByRole('list', { name: 'Ícones do menu' })
    const nomes = within(lista).getAllByRole('listitem').map((li) => li.textContent)
    expect(nomes).toEqual(ITENS_MENU.map((i) => i.rotulo))
    expect(nomes).toContain('Especialistas')
  })

  it('mostra todos os status da tabela de tons', () => {
    renderizar()
    for (const s of Object.values(STATUS_POR_TOM).flat()) {
      expect(screen.getAllByText(s).length).toBeGreaterThan(0)
    }
  })
  it('mostra o bloco do protótipo, da entrada por perfil do login (padrão 6)', () => {
    renderizar()
    const estrutura = secao('Estrutura da tela')
    expect(within(estrutura).getByRole('region', { name: 'Protótipo' })).toHaveTextContent('Entrar como Equipe')
  })

  it('mostra os componentes da parte 2: nível de maturidade, histórico e janelas com conteúdo', () => {
    renderizar()
    const componentes = secao('Componentes')
    for (const rotulo of [
      'Nível de maturidade',
      'Painel de histórico',
      'Janela de confirmação com justificativa',
      'Janela de confirmação bloqueada',
    ]) {
      expect(within(componentes).getByText(rotulo)).toBeInTheDocument()
    }
    for (const nivel of ['Em estruturação', 'Não avaliada', 'Inconclusiva']) {
      expect(within(componentes).getAllByText(nivel).length).toBeGreaterThan(0)
    }
    expect(within(componentes).getByText('Nenhuma alteração registrada.')).toBeInTheDocument()
  })

  it('mostra os componentes da parte 4: o resumo das atividades, com e sem atraso, e a situação do prazo', () => {
    renderizar()
    const componentes = secao('Componentes')
    for (const rotulo of [
      'Resumo das atividades do plano',
      'Resumo das atividades, compacto',
      'Situação do prazo da atividade',
    ]) {
      expect(within(componentes).getByText(rotulo)).toBeInTheDocument()
    }
    const alertas = within(componentes).getAllByText((_, el) => el?.tagName === 'SPAN' && el.textContent === '2 atrasadas')
    expect(alertas.length).toBeGreaterThan(0)
    expect(within(componentes).getAllByText('Atrasada').length).toBeGreaterThan(0)
    expect(within(componentes).getAllByText('Próxima do prazo').length).toBeGreaterThan(0)
  })

  it('mostra a etiqueta de sinal da parte 5, nos dois tons', () => {
    renderizar()
    const componentes = secao('Componentes')
    expect(within(componentes).getByText('Etiqueta de sinal')).toBeInTheDocument()
    expect(within(componentes).getAllByText('E-mail já cadastrado').length).toBeGreaterThan(0)
    expect(within(componentes).getAllByText('Trocar especialista').length).toBeGreaterThan(0)
  })

  it('mostra a lista de comentários da demanda, com o contato com especialista', () => {
    renderizar()
    const componentes = secao('Componentes')
    expect(within(componentes).getByText('Lista de comentários')).toBeInTheDocument()
    expect(within(componentes).getAllByText(/Contato com especialista ·/).length).toBeGreaterThan(0)
  })
})

describe('seção Estados de interface', () => {
  it('mostra cada componente com as legendas dos estados, na ordem', () => {
    renderizar()
    for (const [rotulo, legendas] of Object.entries(MATRIZ)) {
      const linha = linhaDaMatriz(rotulo)
      const celulas = legendas.map((l) => within(linha).getByText(l, { exact: true }))
      for (let i = 1; i < celulas.length; i++) {
        const segue = celulas[i - 1].compareDocumentPosition(celulas[i]) & Node.DOCUMENT_POSITION_FOLLOWING
        expect(segue, `${rotulo}: ${legendas[i - 1]} antes de ${legendas[i]}`).toBeTruthy()
      }
    }
  })

  it('só a célula Normal é interativa; os estados forçados ficam inertes', () => {
    renderizar()
    for (const [rotulo, legendas] of Object.entries(MATRIZ)) {
      const linha = linhaDaMatriz(rotulo)
      for (const legenda of legendas) {
        const celula = within(linha).getByText(legenda, { exact: true }).parentElement as HTMLElement
        const inerte = celula.querySelector('[inert]')
        if (legenda === 'Normal') expect(inerte, `${rotulo}, ${legenda}`).toBeNull()
        else expect(inerte, `${rotulo}, ${legenda}`).not.toBeNull()
      }
    }
  })

  it('o foco forçado repete o contorno global: 2px, sólido, afastado 2px, azul-marinho', () => {
    renderizar()
    const celula = within(linhaDaMatriz('Botão principal')).getByText('Foco', { exact: true })
      .parentElement as HTMLElement
    const botao = within(celula).getByRole('button')
    for (const c of ['outline-2', 'outline-solid', 'outline-offset-2', 'outline-ring']) {
      expect(botao.className.split(' ')).toContain(c)
    }
  })

  it('mostra os estados de página uma vez cada, só nesta seção', () => {
    const { container } = renderizar()
    const s = within(secao('Estados de interface'))
    for (const texto of ['Nenhum contrato cadastrado', 'Não foi possível carregar.', 'Você não tem acesso a esta página.']) {
      expect(screen.getAllByText(texto)).toHaveLength(1)
      expect(s.getByText(texto)).toBeInTheDocument()
    }
    const carregando = container.querySelectorAll('[role="status"][aria-busy="true"]')
    expect(carregando).toHaveLength(1)
    expect(secao('Estados de interface')).toContainElement(carregando[0] as HTMLElement)
    expect(carregando[0]).toHaveTextContent('Carregando')
    expect(within(secao('Componentes')).queryByText('Nenhum contrato cadastrado')).not.toBeInTheDocument()
  })

  it('avisa que os textos de vazio, erro e validação são provisórios (DT-03)', () => {
    renderizar()
    const aviso = within(secao('Estados de interface')).getByText(/são provisórios/)
    expect(aviso).toHaveTextContent('DT-03')
  })
})

describe('seção Estrutura da tela', () => {
  it('explica a lateral, o cabeçalho de página e a barra do celular', () => {
    renderizar()
    const s = within(secao('Estrutura da tela'))
    for (const rotulo of [
      'Lateral',
      'Cabeçalho de página',
      'Barra do celular',
      'Moldura de acesso',
      'Moldura dos formulários do site',
    ]) {
      expect(s.getByText(rotulo, { exact: true })).toBeInTheDocument()
    }
    expect(s.getByText(/Padrão visual/)).toBeInTheDocument()
    const barra = s.getByText(/Abrir menu/)
    expect(barra).toHaveTextContent('Fechar menu')
    expect(barra).toHaveTextContent('Esc')
  })

  /** O bloco do exemplo com o rótulo dado: o rótulo, o conteúdo e a nota. */
  const exemplo = (rotulo: string) =>
    within(within(secao('Estrutura da tela')).getByText(rotulo, { exact: true }).parentElement as HTMLElement)

  it('mostra a moldura de acesso com um login de exemplo que não envia nada', () => {
    renderizar()
    const e = exemplo('Moldura de acesso')
    const demo = e.getByRole('heading', { level: 1, name: 'Entrar' }).closest('[data-demo]')
    expect(demo).not.toBeNull()
    expect(e.getByLabelText('E-mail')).toHaveAttribute('type', 'email')
    expect(e.getByLabelText('Senha')).toHaveAttribute('type', 'password')
    expect(e.getByRole('button', { name: 'Entrar' })).toHaveAttribute('type', 'button')
    expect((demo as HTMLElement).querySelector('img[alt=""]')).not.toBeNull()
    expect(e.getByText(/não têm a lateral/)).toBeInTheDocument()
  })

  it('mostra a moldura dos formulários do site, no cartão, sem enviar nada', () => {
    renderizar()
    const e = exemplo('Moldura dos formulários do site')
    expect(e.getByAltText('ELO HUB')).toBeInTheDocument()
    expect(e.getByLabelText('Nome')).toBeInTheDocument()
    expect(e.getByLabelText('E-mail')).toHaveAttribute('type', 'email')
    expect(e.getByRole('button', { name: 'Enviar' })).toHaveAttribute('type', 'button')
    expect(e.getByText(/cartão branco/)).toBeInTheDocument()
  })

  it('a lateral e a barra do celular saíram de Navegação', () => {
    renderizar()
    expect(screen.queryByText('Lateral e barra do celular')).not.toBeInTheDocument()
  })
})
