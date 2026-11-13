import { USUARIOS, VINCULOS } from './mock/usuarios'
import type { ExemplosDoPrototipo, Usuario } from './tipos'

/** Compara sem espaços nas pontas e sem diferença de maiúsculas. Devolve também os inativos. */
export async function encontrarUsuarioPorEmail(email: string): Promise<Usuario | null> {
  const procurado = email.trim().toLowerCase()
  return USUARIOS.find((u) => u.email.toLowerCase() === procurado) ?? null
}

const porId = (id: string) => USUARIOS.find((u) => u.id === id)!

/** Os perfis de exemplo do bloco "Protótipo" do login. Sai inteiro na Etapa 3. */
export async function obterExemplosDoPrototipo(): Promise<ExemplosDoPrototipo> {
  const equipe = porId('usr-rafael')
  return {
    administrador: porId('usr-helena'),
    equipe,
    clientesDaEquipe: VINCULOS.filter((v) => v.usuarioId === equipe.id).length,
    emailInativo: porId('usr-marcos').email,
  }
}
