'use client'

import { Menu as IconeMenu } from 'lucide-react'
import Image from 'next/image'
import { Campo } from '@/components/elo/campo'
import { MolduraAcesso } from '@/components/elo/moldura-acesso'
import { QuadroPrototipo } from '@/components/elo/quadro-prototipo'
import { MolduraPublica } from '@/components/elo/moldura-publica'
import { Num } from '@/components/elo/num'
import { CLASSE_TITULO_PAGINA } from '@/components/elo/textos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Exemplo, Linhas, Secao } from './secao'

const TEXTO = 'max-w-prose text-secundario leading-relaxed'

/**
 * Desenho fixo da barra do celular, feito com as cores do padrão. Não usa a `BarraTopo` real,
 * porque ela some acima de 1024px. É só imagem: fica fora do leitor de tela.
 */
function DesenhoBarraDoCelular() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-97.5 overflow-hidden rounded-xl border border-border bg-background"
    >
      <div className="flex items-center justify-between bg-sidebar px-4 py-2">
        <Image src="/marca/logo-elo-claro.svg" alt="" width={1199} height={447} className="h-9 w-auto" />
        <span className="flex size-8 items-center justify-center text-sidebar-accent-foreground">
          <IconeMenu className="size-4" />
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div className="space-y-2 border-b border-dourado-suave pb-3">
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
      descricao="O que envolve as telas: a lateral, o cabeçalho de página, a barra do celular e as molduras das telas de acesso e dos formulários do site."
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
          rotulo="Moldura de acesso"
          nota="As telas de acesso (entrar, recuperar a senha e definir a senha) não têm a lateral. A imagem aparece em tela larga e deitada. No celular e no tablet em pé, fica só o formulário. O exemplo não envia nada."
        >
          <div data-demo className="h-150 overflow-hidden rounded-xl border border-border">
            <MolduraAcesso
              nivel="h3"
              className="h-full min-h-0"
              titulo="Entrar"
              descricao="Acesse a Plataforma ELO com seu e-mail e senha."
            >
              {/* Só demonstração: não há formulário nem envio, e o botão não é de envio. */}
              <div className="space-y-4">
                <Campo rotulo="E-mail">
                  {(p) => <Input {...p} type="email" autoComplete="off" placeholder="nome@elogovernance.com.br" />}
                </Campo>
                <Campo rotulo="Senha">{(p) => <Input {...p} type="password" autoComplete="off" />}</Campo>
                <Button type="button" className="w-full">
                  Entrar
                </Button>
              </div>
            </MolduraAcesso>
          </div>
        </Exemplo>

        <Exemplo
          rotulo="Bloco do protótipo"
          nota="Atalhos que só existem no protótipo, como a entrada por perfil no login, separados do formulário de verdade. Sai inteiro na Etapa 3. O exemplo não envia nada."
        >
          <div data-demo className="w-full max-w-md">
            <QuadroPrototipo>
              <p className="text-secundario text-muted-foreground">Entrar direto com um perfil de exemplo, sem senha.</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline">
                  Entrar como Administrador
                </Button>
                <Button type="button" variant="outline">
                  Entrar como Equipe
                </Button>
              </div>
            </QuadroPrototipo>
          </div>
        </Exemplo>

        <Exemplo
          largo
          rotulo="Moldura dos formulários do site"
          nota="Os formulários do site não têm a lateral e ficam num cartão branco. O exemplo não envia nada."
        >
          <div data-demo className="overflow-hidden rounded-xl border border-border">
            <MolduraPublica className="min-h-0">
              {/* Só demonstração: não há formulário nem envio, e o botão não é de envio. */}
              <div className="space-y-5">
                <p className={CLASSE_TITULO_PAGINA}>Formulário de diagnóstico</p>
                <Campo rotulo="Nome">{(p) => <Input {...p} autoComplete="off" />}</Campo>
                <Campo rotulo="E-mail">
                  {(p) => <Input {...p} type="email" autoComplete="off" placeholder="nome@empresa.com.br" />}
                </Campo>
                <Button type="button" className="w-full">
                  Enviar
                </Button>
              </div>
            </MolduraPublica>
          </div>
        </Exemplo>
      </Linhas>
    </Secao>
  )
}
