import { connection } from 'next/server'
import { hojeEmBrasilia } from '@/lib/formato'

/**
 * A data de hoje em Brasília (RN-20), lida na requisição. Com cacheComponents, o relógio só pode ser lido depois de
 * `await connection()`. Ler a sessão antes não basta: na pré-renderização da navegação, o Next já resolve os
 * cookies e acusaria o `new Date()`. Quem chama fica dentro de um Suspense.
 */
export async function hojeDaRequisicao(): Promise<string> {
  await connection()
  return hojeEmBrasilia(new Date())
}
