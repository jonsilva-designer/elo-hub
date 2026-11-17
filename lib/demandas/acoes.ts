'use server'

import { listarContratosDoCliente } from '@/lib/dados/contratos'
import {
  clientesParaNovaDemanda,
  numeroDaProximaDemanda,
  obterDemanda,
  responsaveisParaTriagem,
} from '@/lib/dados/demandas'
import { obterCliente } from '@/lib/dados/clientes'
import { listarEscoposDoCliente } from '@/lib/dados/escopos'
import { listarEspecialistasAtivos } from '@/lib/dados/especialistas'
import { listarCategorias } from '@/lib/dados/listas'
import { obterInicioDaOperacao } from '@/lib/dados/parametros'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { mensagemDeSucesso, SEM_PERMISSAO, type ResultadoAcao } from '@/lib/resultado-acao'
import { dataValida } from '@/lib/escopos/validacao'
import type { EstadoComentario, EstadoRegistrarDemanda, EstadoSalvarDemanda } from './estados'
import {
  acoesDaDemanda,
  demandaFechada,
  faltaParaAtendimento,
  STATUS_DEMANDA_ABERTOS,
  type AcaoDemanda,
} from './regras'
import { lerDadosDemanda, lerDadosNovaDemanda, validarDemanda, validarNovaDemanda } from './validacao'

// Ações da demanda da Central ELO (parte 5, 5.9 a 5.11). O Administrador e a Equipe registram, triam e atendem
// (matriz 4.3); a regra de vínculo vem das leituras. Conferem tudo no servidor. No protótipo, nada é gravado e
// nenhum e-mail sai (F10 fica para a Etapa 3).

/**
 * Registra a demanda (CA-09.1). A Equipe escolhe qualquer cliente Ativo, pelo nome (DF-39); contrato e escopo só
 * valem para o cliente que o usuário vê (RN-01) e precisam ser dele (DF-12). Como nada é gravado, a volta é sempre a
 * fila: a demanda nova não existe para abrir.
 */
export async function registrarDemanda(
  _estado: EstadoRegistrarDemanda,
  formData: FormData,
): Promise<EstadoRegistrarDemanda> {
  await obterUsuarioAtual()
  const dados = lerDadosNovaDemanda(formData)

  const cliente = (await clientesParaNovaDemanda()).find((c) => c.id === dados.clienteId) ?? null
  const [contratos, escopos, responsaveis] = cliente?.visivel
    ? await Promise.all([
        listarContratosDoCliente(cliente.id),
        listarEscoposDoCliente(cliente.id),
        responsaveisParaTriagem(cliente.id),
      ])
    : [[], [], cliente ? await responsaveisParaTriagem(cliente.id) : []]
  // Cliente fora dos vínculos: contrato e escopo não são oferecidos, e o que vier à mão é descartado (RN-01).
  if (cliente && !cliente.visivel) {
    dados.contratoId = ''
    dados.escopoId = ''
  }
  // Escopo sem contrato leva o contrato do escopo (DF-12).
  const escopoEscolhido = escopos.find((e) => e.id === dados.escopoId)
  if (escopoEscolhido && !dados.contratoId) dados.contratoId = escopoEscolhido.contratoId

  const erros = validarNovaDemanda(dados, {
    cliente,
    contratos,
    escopos,
    responsaveis: responsaveis.map((r) => r.id),
  })
  if (Object.keys(erros).length > 0) return { erros, valores: dados }

  const [numero, inicio] = await Promise.all([numeroDaProximaDemanda(), obterInicioDaOperacao()])
  const frases = [
    `Demanda ${numero} registrada.`,
    ...(cliente!.visivel ? [] : ['A triagem fica com quem tem vínculo com o cliente.']),
    // Antes do início oficial da operação, o e-mail não sai (DF-46).
    inicio ? 'O e-mail de aviso sai para a triagem e para a Central.' : 'O e-mail de aviso só sai depois do início oficial da operação.',
  ]
  return { erros: {}, valores: dados, sucesso: { mensagem: mensagemDeSucesso(frases.join(' ')), destino: '/central' } }
}

const recusa = (mensagem: string): ResultadoAcao => ({ ok: false, mensagem })

const temTexto = (valor: unknown): valor is string => typeof valor === 'string' && valor.trim() !== ''

/** O que cada mudança de status exige escrito, e a mensagem quando falta (CA-09.3, CA-09.4, CA-09.8, CA-09.11). */
const TEXTO_EXIGIDO: Partial<Record<AcaoDemanda, string>> = {
  resolver: 'Escreva a solução.',
  'voltar-ao-atendimento': 'Escreva o motivo da volta ao atendimento.',
  encerrar: 'Escreva o retorno dado ao cliente.',
  'encerrar-sem-resolver': 'Escreva a justificativa do encerramento.',
}

const SUCESSO: Record<Exclude<AcaoDemanda, 'reabrir'>, string> = {
  'iniciar-triagem': 'Demanda em triagem.',
  'iniciar-atendimento': 'Atendimento iniciado.',
  'aguardar-retorno': 'Demanda aguardando retorno.',
  'retomar-atendimento': 'Atendimento retomado.',
  resolver: 'Demanda resolvida.',
  'voltar-ao-atendimento': 'Demanda de volta ao atendimento.',
  encerrar: 'Demanda encerrada.',
  'encerrar-sem-resolver': 'Demanda encerrada.',
}

const faltaParaAtender = (falta: string[]) => `Falta para iniciar o atendimento: ${falta.join(', ')}.`

/**
 * Uma mudança de status da 6.1 (parte 5, 5.10). A demanda precisa estar ao alcance do usuário (RN-01); a mudança
 * precisa valer para o status, e o usuário precisa poder fazê-la (encerrar: CA-09.8, DF-61). Cada uma confere o que
 * exige: os campos da triagem para atender, o texto para resolver, voltar e encerrar. A solução, o retorno e o motivo
 * da volta (que vira comentário, DF-42) seriam gravados com a mudança.
 */
export async function mudarStatusDemanda(numero: string, acao: string, texto: string): Promise<ResultadoAcao> {
  const usuario = await obterUsuarioAtual()
  const demanda = typeof numero === 'string' ? await obterDemanda(numero) : null
  if (!demanda || acao === 'reabrir') return recusa(SEM_PERMISSAO)
  const doStatus = acoesDaDemanda(demanda, { id: '', perfil: 'Administrador' })
  if (!(doStatus as string[]).includes(acao)) return recusa('Esta mudança não vale para a demanda neste status.')
  const escolhida = acao as Exclude<AcaoDemanda, 'reabrir'>
  if (!acoesDaDemanda(demanda, usuario).includes(escolhida)) return recusa(SEM_PERMISSAO)

  if (escolhida === 'iniciar-atendimento') {
    const falta = faltaParaAtendimento(demanda)
    if (falta.length > 0) return recusa(faltaParaAtender(falta))
  }
  const exigido = TEXTO_EXIGIDO[escolhida]
  if (exigido && !temTexto(texto)) return recusa(exigido)
  return { ok: true, mensagem: mensagemDeSucesso(SUCESSO[escolhida]) }
}

/**
 * Reabrir a demanda Encerrada para um status aberto, com justificativa: só o Administrador (RN-12, RN-17, RN-22). O
 * status de volta precisa cumprir as exigências dele; a data de encerramento seria apagada.
 */
export async function reabrirDemanda(numero: string, status: string, justificativa: string): Promise<ResultadoAcao> {
  const usuario = await obterUsuarioAtual()
  const demanda = ehAdmin(usuario) && typeof numero === 'string' ? await obterDemanda(numero) : null
  if (!demanda) return recusa(SEM_PERMISSAO)
  if (!demandaFechada(demanda.status)) return recusa('Só uma demanda Encerrada pode ser reaberta.')
  if (!(STATUS_DEMANDA_ABERTOS as string[]).includes(status)) return recusa('Escolha o status de volta.')
  if (!temTexto(justificativa)) return recusa('Escreva a justificativa da reabertura.')
  if (status === 'Em atendimento' || status === 'Aguardando retorno') {
    const falta = faltaParaAtendimento(demanda)
    if (falta.length > 0) return recusa(faltaParaAtender(falta))
  }
  if (status === 'Resolvida' && !demanda.solucao.trim()) return recusa('Escreva a solução.')
  return { ok: true, mensagem: mensagemDeSucesso('Demanda reaberta.') }
}

/**
 * Salva os dados e a triagem da demanda (parte 5, 5.11). O cliente não muda. A Equipe vinculada edita a demanda
 * aberta; a Encerrada, só o Administrador (RN-17). Especialista novo só Ativo; o já ligado continua (CA-11.2, DF-51).
 * A mudança de prazo ficaria no histórico, com o anterior e o novo (DF-41).
 */
export async function salvarDemanda(_estado: EstadoSalvarDemanda, formData: FormData): Promise<EstadoSalvarDemanda> {
  const usuario = await obterUsuarioAtual()
  const dados = lerDadosDemanda(formData)
  const recusa = (erroGeral: string): EstadoSalvarDemanda => ({ erros: {}, valores: dados, erroGeral })
  const demanda = dados.numero ? await obterDemanda(dados.numero) : null
  if (!demanda) return recusa(SEM_PERMISSAO)
  if (!ehAdmin(usuario) && demandaFechada(demanda.status)) return recusa(SEM_PERMISSAO)

  const [cliente, contratos, escopos, responsaveis, categorias, ativos] = await Promise.all([
    obterCliente(demanda.clienteId),
    listarContratosDoCliente(demanda.clienteId),
    listarEscoposDoCliente(demanda.clienteId),
    listarResponsaveis(demanda.clienteId),
    listarCategorias(),
    listarEspecialistasAtivos(),
  ])
  const escopoEscolhido = escopos.find((e) => e.id === dados.escopoId)
  if (escopoEscolhido && !dados.contratoId) dados.contratoId = escopoEscolhido.contratoId
  dados.especialistaIds = dados.especialistaIds.filter(
    (id) => ativos.some((e) => e.id === id) || demanda.especialistas.some((e) => e.id === id),
  )
  if (dados.especialistaIds.length === 1) dados.principalId = dados.especialistaIds[0]

  const erros = validarDemanda(dados, {
    status: demanda.status,
    ehCadastroElo: cliente?.ehCadastroElo === true,
    contratos,
    escopos,
    responsaveis: responsaveis.map((u) => u.id),
    categorias,
  })
  if (Object.keys(erros).length > 0) return { erros, valores: dados }
  return {
    erros: {},
    valores: dados,
    sucesso: { mensagem: mensagemDeSucesso('Demanda salva.'), destino: `/central/${demanda.numero}` },
  }
}

/**
 * Registra um comentário na demanda aberta (F09, CA-09.6), pelo Administrador ou pela Equipe vinculada. O contato com
 * especialista guarda um dos especialistas da demanda e a data do contato (DF-30, CA-09.13). Ninguém apaga
 * comentário pela plataforma.
 */
export async function comentarDemanda(_estado: EstadoComentario, formData: FormData): Promise<EstadoComentario> {
  await obterUsuarioAtual()
  const campo = (nome: string) => {
    const valor = formData.get(nome)
    return typeof valor === 'string' ? valor.trim() : ''
  }
  const demanda = campo('numero') ? await obterDemanda(campo('numero')) : null
  if (!demanda) return { erros: {}, erroGeral: SEM_PERMISSAO }
  if (demandaFechada(demanda.status)) return { erros: {}, erroGeral: 'A demanda encerrada não recebe comentários.' }

  const erros: EstadoComentario['erros'] = {}
  if (!campo('texto')) erros.texto = 'Escreva o comentário.'
  if (campo('tipo') === 'Contato com especialista') {
    if (!demanda.especialistas.some((e) => e.id === campo('especialistaId'))) {
      erros.especialistaId = 'Escolha o especialista do contato.'
    }
    if (!dataValida(campo('dataContato'))) erros.dataContato = 'Informe a data do contato.'
  }
  if (Object.keys(erros).length > 0) return { erros }
  return { erros: {}, sucesso: mensagemDeSucesso('Comentário registrado.') }
}
