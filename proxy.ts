import { NextResponse, type NextRequest } from 'next/server'
import { CABECALHO_DO_CAMINHO, NOME_DO_COOKIE } from '@/lib/acesso/cookie'
import { decidirRota } from '@/lib/acesso/rotas'

// Checagem otimista (guia de autenticação do Next): só confere se o cookie da sessão existe.
// Quem chega sem ele a uma tela interna vai ao login e, depois de entrar, volta à página pedida.
// A validação de verdade fica em lib/dados (obterUsuarioAtual). Para ela poder mandar ao login com o destino, quando o
// cookie existe mas não vale mais, o endereço pedido segue adiante num cabeçalho da requisição.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const para = decidirRota(pathname, search, request.cookies.has(NOME_DO_COOKIE))
  if (para) return NextResponse.redirect(new URL(para, request.url))
  const cabecalhos = new Headers(request.headers)
  cabecalhos.set(CABECALHO_DO_CAMINHO, pathname + search)
  return NextResponse.next({ request: { headers: cabecalhos } })
}

export const config = {
  // Fora: arquivos do Next, imagens, a pasta da marca e o favicon.
  matcher: ['/((?!_next/static|_next/image|marca/|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico)$).*)'],
}
