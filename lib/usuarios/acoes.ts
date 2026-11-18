'use server'

import { listarClientes } from '@/lib/dados/clientes'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { itensAbertosDoUsuario, listarUsuarios, obterUsuario } from '@/lib/dados/usuarios-configuracao'
import { mensagemDeSucesso, SEM_PERMISSAO } from '@/lib/resultado-acao'
import type { EstadoUsuario } from './estados'
import { ehUltimoAdministradorAtivo } from './regras'
import { lerDadosUsuario, MENSAGENS_USUARIO, validarUsuario } from './validacao'

// Ações dos usuários (parte 8, 4.1; F01). Só o Administrador cria, edita, inativa e vincula (CA-01.4). Conferem tudo no
// servidor. No protótipo, nada é gravado e nenhum convite sai.

/**
 * Cadastra ou edita o usuário. Com `id`, é edição. O e-mail é único, sem diferenciar maiúsculas; a Equipe acompanha
 * ao menos um cliente (DF-23). O último Administrador ativo não passa para Equipe (DF-37), e o vínculo com um cliente
 * não sai enquanto a pessoa responde por itens abertos dele: a ação lista os itens (DF-36, CA-01.7).
 */
export async function salvarUsuario(_estado: EstadoUsuario, formData: FormData): Promise<EstadoUsuario> {
  const usuario = await obterUsuarioAtual()
  const dados = lerDadosUsuario(formData)
  const recusa = (erroGeral: string, extra: Partial<EstadoUsuario> = {}): EstadoUsuario => ({ erros: {}, valores: dados, erroGeral, ...extra })
  if (!ehAdmin(usuario)) return recusa(SEM_PERMISSAO)

  const atual = dados.id ? await obterUsuario(dados.id) : null
  if (dados.id && !atual) return recusa(SEM_PERMISSAO)

  const [usuarios, clientes] = await Promise.all([listarUsuarios(), listarClientes()])
  const erros = validarUsuario(dados, {
    emailsDosOutros: usuarios.filter((u) => u.id !== atual?.id).map((u) => u.email),
    clientes: clientes.map((c) => c.id),
    ultimoAdministrador: atual !== null && ehUltimoAdministradorAtivo(atual.id, usuarios),
  })
  if (Object.keys(erros).length > 0) return { erros, valores: dados }

  // Os vínculos que saem, na Equipe que continua Equipe: nenhum pode ter item aberto da pessoa (DF-36).
  if (atual && atual.perfil === 'Equipe' && dados.perfil === 'Equipe') {
    for (const saindo of atual.clientes.filter((c) => !dados.clienteIds.includes(c.id))) {
      const itens = await itensAbertosDoUsuario(atual.id, saindo.id)
      if (itens.length > 0) return recusa(MENSAGENS_USUARIO.vinculoComItens(saindo.nome), { impedimentos: itens })
    }
  }

  return {
    erros: {},
    valores: dados,
    sucesso: atual
      ? { mensagem: mensagemDeSucesso('Usuário salvo.'), destino: `/configuracoes/usuarios/${atual.id}` }
      : { mensagem: mensagemDeSucesso(`Usuário cadastrado. O convite sai para ${dados.email}.`), destino: '/configuracoes/usuarios' },
  }
}
