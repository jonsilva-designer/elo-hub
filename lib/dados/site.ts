import { mesmoEmail } from '@/lib/especialistas/regras'
import { CLIENTES } from './mock/clientes'
import { ESPECIALISTAS } from './mock/especialistas'

// As consultas dos formulários do site (parte 9; arquitetura 3.6). São públicas, sem sessão: a operação privilegiada
// responde só sim ou não, e nada do cadastro sai para a página (DF-56, DF-50).

const digitos = (texto: string) => texto.replace(/\D/g, '')

/** Já existe cliente com o CNPJ, comparando só os dígitos (DF-56). */
export async function cnpjJaCadastrado(cnpj: string): Promise<boolean> {
  const procurado = digitos(cnpj)
  return procurado !== '' && CLIENTES.some((c) => digitos(c.cnpj) === procurado)
}

/** Já existe especialista ou candidatura com o e-mail, sem diferenciar maiúsculas (DF-50). */
export async function emailDeEspecialistaJaCadastrado(email: string): Promise<boolean> {
  return ESPECIALISTAS.some((e) => mesmoEmail(e.email, email))
}
