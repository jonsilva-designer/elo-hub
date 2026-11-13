import type { Usuario } from './tipos'
import { USUARIO_EXEMPLO } from './mock/usuarios'

// As telas só leem dados por `lib/dados`. Hoje isto devolve o usuário de exemplo;
// a pasta `mock` é apagada na Etapa 3 e esta função passa a ler a sessão.
// Já é assíncrona porque a sessão vem de `cookies()`, que é assíncrono.
export async function obterUsuarioAtual(): Promise<Usuario> {
  return USUARIO_EXEMPLO
}
