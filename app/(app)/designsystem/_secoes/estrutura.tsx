'use client'

import { Menu as IconeMenu } from 'lucide-react'
import Image from 'next/image'
import { Campo } from '@/components/elo/campo'
import { MolduraPublica } from '@/components/elo/moldura-publica'
import { Num } from '@/components/elo/num'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Exemplo, Linhas, Secao } from './secao'

const TEXTO = 'max-w-prose text-[13px] leading-relaxed'

/**
 * Desenho fixo da barra do celular, feito com as cores do padrão. Não usa a `BarraTopo` real,
 * porque ela some acima de 1024px. É só imagem: fica fora do leitor de tela.
 */
function DesenhoBarraDoCelular() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-[390px] overflow-hidden rounded-xl border border-border bg-background"
    >
      <div className="flex items-center justify-between bg-sidebar px-4 py-2">
        <Image src="/marca/logo-elo-claro.png" alt="" width={814} height={627} className="h-9 w-auto" />
        <span className="flex size-8 items-center justify-center text-sidebar-accent-foreground">
          <IconeMenu className="size-4" />
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div className="space-y-2 border-b border-[var(--elo-dourado-suave)] pb-3">
          <div className="h-3 w-24 rounded-sm bg-primary" />
          <div className="h-2 w-36 rounded-sm bg-border" />
        </div>
        <div className="h-14 rounded-xl border border-border bg-card" />
        <div className="h-14 rounded-xl border border-border bg-card" />
      </div>
    </div>
  )
}

export function Estrutura() {
  return (
    <Secao
      titulo="Estrutura da tela"
      descricao="O que envolve as telas: a lateral, o cabeçalho de página, a barra do celular e a moldura das páginas públicas."
    >
      <Linhas>
        <Exemplo rotulo="Lateral">
          <p className={TEXTO}>
            No computador, a lateral à esquerda desta página é o componente real. Ela flutua a <Num>12</Num>px
            das bordas, com cantos de <Num>12</Num>px, sombra leve e <Num>212</Num>px de largura. O item ativo
            fica em branco, com a barrinha dourada na ponta, e o foco do teclado dentro dela é dourado. O link
            “Padrão visual”, que abre esta página, fica no rodapé dela, acima do usuário.
          </p>
        </Exemplo>

        <Exemplo rotulo="Cabeçalho de página">
          <p className={TEXTO}>
            O cabeçalho no topo desta página é o componente real: título em azul-marinho, linha de contexto,
            ações à direita quando a tela tem, e o filete dourado suave embaixo. Um exemplo com ação fica em{' '}
            <a href="#navegacao" className="rounded-sm font-medium text-primary underline underline-offset-4">
              Componentes, Navegação
            </a>
            .
          </p>
        </Exemplo>

        <Exemplo
          largo
          rotulo="Barra do celular"
          nota={
            <>
              Desenho da barra numa tela de <Num>390</Num>px.
            </>
          }
        >
          <div className="space-y-4">
            <p className={TEXTO}>
              Abaixo de <Num>1024</Num>px de largura, a lateral dá lugar a uma barra azul-marinho no topo, com o
              logo e o botão “Abrir menu”. O botão abre o mesmo menu numa gaveta de <Num>280</Num>px, que fecha
              pelo botão “Fechar menu”, pela tecla Esc, por um toque fora dela ou ao escolher um item.
            </p>
            <DesenhoBarraDoCelular />
          </div>
        </Exemplo>

        <Exemplo
          largo
          rotulo="Moldura das páginas públicas"
          nota="As páginas públicas (entrar, recuperar a senha e os formulários do site) não têm a lateral. O exemplo não envia nada."
        >
          <div data-demo className="overflow-hidden rounded-xl border border-border">
            <MolduraPublica className="min-h-0">
              {/* Só demonstração: não há formulário nem envio, e o botão não é de envio. */}
              <div className="space-y-5">
                <p className="text-lg font-semibold text-primary">Entrar</p>
                <Campo rotulo="E-mail">
                  {(p) => <Input {...p} type="email" autoComplete="off" placeholder="nome@empresa.com.br" />}
                </Campo>
                <Campo rotulo="Senha">{(p) => <Input {...p} type="password" autoComplete="off" />}</Campo>
                <Button type="button" className="w-full">
                  Entrar
                </Button>
              </div>
            </MolduraPublica>
          </div>
        </Exemplo>
      </Linhas>
    </Secao>
  )
}
