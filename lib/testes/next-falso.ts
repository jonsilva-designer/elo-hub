import { CABECALHO_DO_CAMINHO, NOME_DO_COOKIE } from '@/lib/acesso/cookie'

// Cookies e redirecionamento falsos para os testes que passam pela sessão. Uso:
//   vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
//   vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)
// e `limparCookies()` no beforeEach. Quem também precisar do usePathname espalha o moduloNavigation.

type Opcoes = Record<string, unknown>

const valores = new Map<string, string>()

export const cookiesFalsos = {
  /** As opções da última gravação, para conferir httpOnly, sameSite e afins. */
  ultimasOpcoes: undefined as Opcoes | undefined,
  get(nome: string) {
    const valor = valores.get(nome)
    return valor === undefined ? undefined : { name: nome, value: valor }
  },
  has(nome: string) {
    return valores.has(nome)
  },
  set(nome: string, valor: string, opcoes?: Opcoes) {
    valores.set(nome, valor)
    cookiesFalsos.ultimasOpcoes = opcoes
  },
  delete(nome: string) {
    valores.delete(nome)
  },
}

const cabecalhos = new Map<string, string>()

/** O endereço que a pessoa pediu, como o proxy passa adiante no cabeçalho da requisição. */
export function definirCaminhoPedido(caminho: string): void {
  cabecalhos.set(CABECALHO_DO_CAMINHO, caminho)
}

/** Grava o cookie da sessão com o id dado, como se a pessoa tivesse entrado. */
export function entrarComo(usuarioId: string): void {
  valores.set(NOME_DO_COOKIE, usuarioId)
}

export function limparCookies(): void {
  valores.clear()
  cabecalhos.clear()
  cookiesFalsos.ultimasOpcoes = undefined
}

/** O que o `redirect` falso lança, como o de verdade, que interrompe a execução. */
export class Redirecionou extends Error {
  destino: string
  constructor(destino: string) {
    super(`redirecionou para ${destino}`)
    this.destino = destino
  }
}

export const moduloHeaders = { cookies: async () => cookiesFalsos, headers: async () => new Headers([...cabecalhos]) }

export const moduloNavigation = {
  redirect(url: string): never {
    throw new Redirecionou(url)
  },
  notFound(): never {
    throw new Error('NEXT_NOT_FOUND')
  },
}

/** Espera o redirecionamento e devolve o destino. Falha se a promessa resolver. */
export async function destinoDe(promessa: Promise<unknown>): Promise<string> {
  try {
    await promessa
  } catch (erro) {
    if (erro instanceof Redirecionou) return erro.destino
    throw erro
  }
  throw new Error('Esperava um redirecionamento, mas a promessa resolveu.')
}
