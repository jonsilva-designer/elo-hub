'use server'

import { headers } from 'next/headers'
import { listarEspecialidades, listarSegmentos } from '@/lib/dados/listas'
import { cnpjJaCadastrado, emailDeEspecialistaJaCadastrado } from '@/lib/dados/site'
import type { EstadoSite } from './estados'
import { dentroDoLimite, ehRobo, MENSAGEM_LIMITE } from './protecao'
import { TEXTOS_SITE } from './textos'
import { lerCandidatura, lerDiagnostico, validarCandidatura, validarDiagnostico } from './validacao'

// As ações públicas dos formulários do site (parte 9; F19; arquitetura 3.6). Não pedem sessão. Passam pelo campo
// armadilha e pelo limite por IP (CA-19.4); o Turnstile entra na Etapa 3. No protótipo, nada é gravado e nenhum e-mail
// sai; a resposta é a que a pessoa veria.

/** O IP de quem envia, pelo primeiro endereço do x-forwarded-for, como a Vercel entrega. */
async function ipDoEnvio(): Promise<string> {
  const encaminhado = (await headers()).get('x-forwarded-for')
  return encaminhado?.split(',')[0]?.trim() || 'local'
}

/** O que vale para os dois formulários antes da validação: o robô recebe a confirmação sem nada gravado. */
async function protecao(formData: FormData, confirmacao: string): Promise<EstadoSite | null> {
  if (ehRobo(formData)) return { erros: {}, valores: null, confirmacao }
  if (!dentroDoLimite(await ipDoEnvio(), Date.now())) return { erros: {}, valores: null, erroGeral: MENSAGEM_LIMITE }
  return null
}

const aceite = () => ({ versao: TEXTOS_SITE.versao, aceitoEm: new Date().toISOString() })

/**
 * A solicitação de diagnóstico (DF-76, CA-19.3). Com CNPJ novo, o cliente Prospect seria criado com os campos da
 * DF-76; com CNPJ já cadastrado, o pedido iria para as observações dele (DF-56). Nos dois casos, o aviso à Central e a
 * mesma confirmação: a página não revela se a empresa já é cliente.
 */
export async function enviarDiagnostico(_estado: EstadoSite, formData: FormData): Promise<EstadoSite> {
  const confirmacao = TEXTOS_SITE.diagnostico.confirmacao
  const bloqueio = await protecao(formData, confirmacao)
  if (bloqueio) return bloqueio
  const dados = lerDiagnostico(formData)
  const erros = validarDiagnostico(dados, await listarSegmentos())
  if (Object.keys(erros).length > 0) return { erros, valores: dados }
  // Só decide para onde o pedido iria: cliente novo ou observações do existente. A resposta é a mesma.
  await cnpjJaCadastrado(dados.cnpj)
  return { erros: {}, valores: null, confirmacao, consentimento: aceite() }
}

/**
 * A candidatura de especialista (F11, CA-19.1): entraria como Em análise, origem Site. Com e-mail já cadastrado, seria
 * uma candidatura nova, marcada "e-mail já cadastrado", sem tocar no cadastro existente (DF-50, CA-19.6).
 */
export async function enviarCandidatura(_estado: EstadoSite, formData: FormData): Promise<EstadoSite> {
  const confirmacao = TEXTOS_SITE.especialista.confirmacao
  const bloqueio = await protecao(formData, confirmacao)
  if (bloqueio) return bloqueio
  const dados = lerCandidatura(formData)
  const erros = validarCandidatura(dados, await listarEspecialidades())
  if (Object.keys(erros).length > 0) return { erros, valores: dados }
  // Só decide a marca da candidatura nova (DF-50). A resposta é a mesma.
  await emailDeEspecialistaJaCadastrado(dados.email)
  return { erros: {}, valores: null, confirmacao, consentimento: aceite() }
}
