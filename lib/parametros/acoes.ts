'use server'

import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { mensagemDeSucesso, SEM_PERMISSAO } from '@/lib/resultado-acao'
import type { EstadoParametros } from './estados'
import { lerDadosParametros, validarParametros } from './validacao'

/**
 * Salva os parâmetros (parte 8, 4.3; DF-81): só o Administrador. Os próximos cálculos e e-mails já usariam os valores
 * novos (CA-10.4); o início da operação liga os alertas e as notificações na data (DF-46). No protótipo, nada é gravado.
 */
export async function salvarParametros(_estado: EstadoParametros, formData: FormData): Promise<EstadoParametros> {
  const usuario = await obterUsuarioAtual()
  const dados = lerDadosParametros(formData)
  if (!ehAdmin(usuario)) return { erros: {}, valores: dados, erroGeral: SEM_PERMISSAO }
  const erros = validarParametros(dados)
  if (Object.keys(erros).length > 0) return { erros, valores: dados }
  return { erros: {}, valores: dados, sucesso: mensagemDeSucesso('Parâmetros salvos.') }
}
