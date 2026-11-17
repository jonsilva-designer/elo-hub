'use server'

import { listarContratosDoCliente } from '@/lib/dados/contratos'
import {
  clientesParaNovaDemanda,
  numeroDaProximaDemanda,
  responsaveisParaTriagem,
} from '@/lib/dados/demandas'
import { listarEscoposDoCliente } from '@/lib/dados/escopos'
import { obterInicioDaOperacao } from '@/lib/dados/parametros'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { mensagemDeSucesso } from '@/lib/resultado-acao'
import type { EstadoRegistrarDemanda } from './estados'
import { lerDadosNovaDemanda, validarNovaDemanda } from './validacao'

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
