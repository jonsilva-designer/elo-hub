import type { NextRequest } from 'next/server'
import { gerarCsvAtividades, nomeDoArquivoAtividades } from '@/lib/atividades/csv'
import { escoposDasAtividades, filtrarAtividades, lerFiltrosAtividades, responsaveisDasAtividades } from '@/lib/atividades/filtros'
import { listarAtividades } from '@/lib/dados/atividades'
import { ehAdmin } from '@/lib/dados/regras'
import { obterSessao } from '@/lib/dados/sessao'

// Exportação de Minhas atividades (DF-75, CA-16.3), só para o Administrador, com os mesmos filtros da tela: sem
// responsável no endereço, as da pessoa que entrou. Como as outras, lê a sessão com obterSessao para responder 401.
export async function GET(request: NextRequest): Promise<Response> {
  const usuario = await obterSessao()
  if (!usuario) return new Response('Entre na plataforma para exportar.', { status: 401 })
  if (!ehAdmin(usuario)) return new Response('Você não tem permissão para exportar.', { status: 403 })

  const atividades = await listarAtividades()
  const filtros = lerFiltrosAtividades(request.nextUrl.searchParams, {
    usuarioId: usuario.id,
    responsaveis: [usuario.id, ...responsaveisDasAtividades(atividades).map((r) => r.valor)],
    escopos: escoposDasAtividades(atividades).map((e) => e.valor),
  })
  return new Response(gerarCsvAtividades(filtrarAtividades(atividades, filtros)), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nomeDoArquivoAtividades(new Date())}"`,
      'Cache-Control': 'no-store',
    },
  })
}
