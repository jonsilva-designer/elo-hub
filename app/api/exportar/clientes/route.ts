import type { NextRequest } from 'next/server'
import { gerarCsvClientes, nomeDoArquivoClientes } from '@/lib/clientes/csv'
import { filtrarClientes, lerFiltros } from '@/lib/clientes/filtros'
import { listarClientes } from '@/lib/dados/clientes'
import { listarSegmentos } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterSessao } from '@/lib/dados/sessao'

// Exportação da lista de clientes (DF-75, CA-16.3), só para o Administrador, com os mesmos filtros
// da tela. Lê a sessão com obterSessao, e não obterUsuarioAtual, para responder 401 em vez de
// redirecionar: quem chega sem cookie nenhum já foi mandado ao login pelo proxy.
export async function GET(request: NextRequest): Promise<Response> {
  const usuario = await obterSessao()
  if (!usuario) return new Response('Entre na plataforma para exportar.', { status: 401 })
  if (!ehAdmin(usuario)) return new Response('Você não tem permissão para exportar.', { status: 403 })

  const [clientes, segmentos] = await Promise.all([listarClientes(), listarSegmentos()])
  const filtros = lerFiltros(request.nextUrl.searchParams, segmentos)
  return new Response(gerarCsvClientes(filtrarClientes(clientes, filtros)), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nomeDoArquivoClientes(new Date())}"`,
      'Cache-Control': 'no-store',
    },
  })
}
