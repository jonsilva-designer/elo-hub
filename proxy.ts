import { NextResponse, type NextRequest } from 'next/server'
import { NOME_DO_COOKIE } from '@/lib/acesso/cookie'
import { decidirRota } from '@/lib/acesso/rotas'

// Checagem otimista (guia de autenticação do Next): só confere se o cookie da sessão existe.
// Quem chega sem ele a uma tela interna vai ao login e, depois de entrar, volta à página pedida.
// A validação de verdade fica em lib/dados (obterUsuarioAtual).
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const para = decidirRota(pathname, search, request.cookies.has(NOME_DO_COOKIE))
  return para ? NextResponse.redirect(new URL(para, request.url)) : NextResponse.next()
}

export const config = {
  // Fora: arquivos do Next, imagens, a pasta da marca e o favicon.
  matcher: ['/((?!_next/static|_next/image|marca/|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico)$).*)'],
}
