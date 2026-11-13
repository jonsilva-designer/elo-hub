'use client'

import type { ComponentProps, ReactNode } from 'react'
import { toast } from 'sonner'
import { Campo } from '@/components/elo/campo'
import { AcessoNegado, Carregando, ErroCarregamento, EstadoVazio } from '@/components/elo/estados'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { CONTRATOS_EXEMPLO, type ContratoDaLista } from '../exemplos'
import { Exemplo, Linhas, Quadro, Secao, Subtitulo } from './secao'

// Estados forçados, só desta página: classes que repetem o visual do estado real sem mudar o componente.
// O foco repete a regra global do globals.css: contorno de 2px, sólido, afastado 2px, azul-marinho.
const FOCO = 'outline-2 outline-solid outline-offset-2 outline-ring'
// Na linha de tabela o contorno vai por dentro, como na regra global para linhas clicáveis.
const FOCO_NA_LINHA =
  '[&_tbody_tr]:outline-2 [&_tbody_tr]:outline-solid [&_tbody_tr]:-outline-offset-2 [&_tbody_tr]:outline-ring'
const MOUSE_NA_LINHA = '[&_tbody_tr]:bg-papel'

/** Estados de um componente lado a lado, cada um numa célula com a sua legenda. */
function Matriz({ className, children }: { className: string; children: ReactNode }) {
  return <div className={cn('grid gap-x-6 gap-y-5', className)}>{children}</div>
}

/**
 * Célula da matriz. Só a célula `real` (Normal) responde ao mouse e ao teclado.
 * As outras ficam inertes: fora do Tab e do leitor de tela, para não repetir controles.
 */
function Celula({ legenda, real = false, children }: { legenda: string; real?: boolean; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="text-xs text-muted-foreground">{legenda}</div>
      {real ? children : <div inert>{children}</div>}
    </div>
  )
}

type Variante = ComponentProps<typeof Button>['variant']

// Classes escritas por inteiro: o Tailwind só gera o que lê assim.
const BOTOES: { rotulo: string; variante: Variante; texto: string; mouse: string; pressionado: string }[] = [
  {
    rotulo: 'Botão principal',
    variante: 'default',
    texto: 'Salvar',
    mouse: 'bg-primary-hover',
    pressionado: 'bg-primary-active',
  },
  {
    rotulo: 'Botão secundário',
    variante: 'outline',
    texto: 'Editar',
    mouse: 'bg-surface-hover',
    pressionado: 'bg-surface-active',
  },
  {
    rotulo: 'Botão discreto',
    variante: 'ghost',
    texto: 'Cancelar',
    mouse: 'bg-surface-hover',
    pressionado: 'bg-surface-active',
  },
  {
    rotulo: 'Botão perigo',
    variante: 'destructive',
    texto: 'Excluir',
    mouse: 'bg-destructive-hover',
    pressionado: 'bg-destructive-active',
  },
]

const COLUNAS: Coluna<ContratoDaLista>[] = [
  { id: 'numero', titulo: 'Contrato', celula: (c) => <Num>{c.numero}</Num> },
  { id: 'vigencia', titulo: 'Vigência', celula: (c) => <EtiquetaStatus status={c.vigencia} /> },
]

const [VIGENTE, PROXIMO, VENCIDO] = CONTRATOS_EXEMPLO

// Só da demonstração: a tela real abre a página do contrato.
function abrirContrato(c: ContratoDaLista) {
  toast(`Abre a página do contrato ${c.numero}`)
}

/** Tabela de uma linha clicável, num painel sem respiro. `className` força o estado da linha. */
function LinhaDeTabela({
  contrato,
  destaque,
  className,
}: {
  contrato: ContratoDaLista
  destaque?: 'atencao' | 'problema'
  className?: string
}) {
  return (
    <div data-demo className={className}>
      <Painel titulo="Contratos" semRespiro>
        <TabelaDados
          colunas={COLUNAS}
          linhas={[contrato]}
          chave={(c) => c.numero}
          aoClicarLinha={abrirContrato}
          destaque={destaque ? () => destaque : undefined}
          vazio={null}
        />
      </Painel>
    </div>
  )
}

function CampoNome({ className, ...props }: ComponentProps<typeof Input>) {
  return (
    <Campo rotulo="Nome do cliente">
      {(p) => <Input {...p} {...props} className={className} />}
    </Campo>
  )
}

/** Estado de página num quadro, com a legenda em cima. */
function EstadoDePagina({ legenda, nota, children }: { legenda: string; nota?: string; children: ReactNode }) {
  return (
    <Quadro className="flex flex-col gap-3">
      <div className="text-xs text-muted-foreground">{legenda}</div>
      <div className="flex flex-1 flex-col justify-center">{children}</div>
      {nota ? <p className="text-xs text-muted-foreground">{nota}</p> : null}
    </Quadro>
  )
}

export function EstadosDeInterface() {
  return (
    <Secao
      titulo="Estados de interface"
      descricao="Cada componente interativo nos seus estados, lado a lado. Na célula Normal o componente é o real e responde ao mouse e ao teclado; nas outras, o estado fica fixo para comparação. O foco aparece na navegação pelo teclado."
    >
      <div className="space-y-8">
        <div className="space-y-3">
          <Subtitulo>Componentes interativos</Subtitulo>
          <Linhas>
            {BOTOES.map((b) => (
              <Exemplo key={b.rotulo} largo rotulo={b.rotulo}>
                <Matriz className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                  <Celula legenda="Normal" real>
                    <Button variant={b.variante}>{b.texto}</Button>
                  </Celula>
                  <Celula legenda="Passar o mouse">
                    <Button variant={b.variante} className={b.mouse}>
                      {b.texto}
                    </Button>
                  </Celula>
                  <Celula legenda="Foco">
                    <Button variant={b.variante} className={FOCO}>
                      {b.texto}
                    </Button>
                  </Celula>
                  <Celula legenda="Pressionado">
                    <Button variant={b.variante} className={cn(b.pressionado, 'translate-y-px')}>
                      {b.texto}
                    </Button>
                  </Celula>
                  <Celula legenda="Desabilitado">
                    <Button variant={b.variante} disabled>
                      {b.texto}
                    </Button>
                  </Celula>
                  {b.variante === 'default' ? (
                    <Celula legenda="Carregando">
                      <Button carregando>{b.texto}</Button>
                    </Celula>
                  ) : null}
                </Matriz>
              </Exemplo>
            ))}

            <Exemplo largo rotulo="Campo de texto">
              <Matriz className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <Celula legenda="Normal" real>
                  <CampoNome defaultValue="Grupo Horizonte Agro" />
                </Celula>
                <Celula legenda="Passar o mouse">
                  <CampoNome defaultValue="Grupo Horizonte Agro" className="border-input-hover" />
                </Celula>
                <Celula legenda="Foco">
                  <CampoNome defaultValue="Grupo Horizonte Agro" className={FOCO} />
                </Celula>
                <Celula legenda="Com erro">
                  <Campo rotulo="Nome do cliente" erro="Informe o nome do cliente">
                    {(p) => <Input {...p} />}
                  </Campo>
                </Celula>
                <Celula legenda="Desabilitado">
                  <CampoNome defaultValue="Grupo Horizonte Agro" disabled />
                </Celula>
              </Matriz>
            </Exemplo>

            <Exemplo
              largo
              rotulo="Linha de tabela"
              nota={
                <>
                  A linha clicável ganha fundo papel ao passar o mouse. A barra de <Num>3</Num>px na borda
                  esquerda destaca o contrato próximo do vencimento, em âmbar, e o vencido, em vermelho.
                </>
              }
            >
              <Matriz className="sm:grid-cols-2">
                <Celula legenda="Normal" real>
                  <LinhaDeTabela contrato={VIGENTE} />
                </Celula>
                <Celula legenda="Passar o mouse">
                  <LinhaDeTabela contrato={VIGENTE} className={MOUSE_NA_LINHA} />
                </Celula>
                <Celula legenda="Foco">
                  <LinhaDeTabela contrato={VIGENTE} className={FOCO_NA_LINHA} />
                </Celula>
                <Celula legenda="Destaque de atenção">
                  <LinhaDeTabela contrato={PROXIMO} destaque="atencao" />
                </Celula>
                <Celula legenda="Destaque de problema">
                  <LinhaDeTabela contrato={VENCIDO} destaque="problema" />
                </Celula>
              </Matriz>
            </Exemplo>
          </Linhas>
        </div>

        <div className="space-y-3">
          <Subtitulo>Estados de página</Subtitulo>
          <div className="grid gap-4 lg:grid-cols-2">
            <EstadoDePagina legenda="Vazio">
              <EstadoVazio
                titulo="Nenhum contrato cadastrado"
                descricao="Cadastre o primeiro contrato para acompanhá-lo aqui."
                acao={<Button>Cadastrar contrato</Button>}
              />
            </EstadoDePagina>
            <EstadoDePagina legenda="Erro de carregamento">
              {/* Sem efeito visível: a página não busca dados. */}
              <ErroCarregamento onTentarDeNovo={() => {}} />
            </EstadoDePagina>
            <EstadoDePagina legenda="Carregando">
              <Carregando />
            </EstadoDePagina>
            <EstadoDePagina
              legenda="Sem permissão"
              nota="O item não aparece no menu do perfil. Quem abre o endereço direto vê esta mensagem."
            >
              <AcessoNegado />
            </EstadoDePagina>
          </div>
          <p className="text-xs text-muted-foreground">
            Os textos de vazio, de erro e de validação são provisórios até a validação do protótipo (
            <Num>DT-03</Num>).
          </p>
        </div>
      </div>
    </Secao>
  )
}
