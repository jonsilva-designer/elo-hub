import type { NextRequest } from 'next/server'
import { listarDemandas } from '@/lib/dados/demandas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterSessao } from '@/lib/dados/sessao'
import { gerarCsvDemandas, nomeDoArquivoDemandas } from '@/lib/demandas/csv'
import { filtrarDemandas, lerFiltrosDemandas, opcoesDasDemandas } from '@/lib/demandas/filtros'

// Exportação da fila de demandas (DF-75, CA-16.3), só para o Administrador, com os mesmos filtros da tela. Como as
// outras, lê a sessão com obterSessao para responder 401 em vez de redirecionar.
export async function GET(request: NextRequest): Promise<Response> {
  const usuario = await obterSessao()
  if (!usuario) return new Response('Entre na plataforma para exportar.', { status: 401 })
  if (!ehAdmin(usuario)) return new Response('Você não tem permissão para exportar.', { status: 403 })

  const demandas = await listarDemandas()
  const opcoes = opcoesDasDemandas(demandas)
  const filtros = lerFiltrosDemandas(request.nextUrl.searchParams, {
    clientes: opcoes.clientes.map((o) => o.valor),
    contratos: opcoes.contratos.map((o) => o.valor),
    escopos: opcoes.escopos.map((o) => o.valor),
    responsaveis: opcoes.responsaveis.map((o) => o.valor),
  })
  return new Response(gerarCsvDemandas(filtrarDemandas(demandas, filtros)), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nomeDoArquivoDemandas(new Date())}"`,
      'Cache-Control': 'no-store',
    },
  })
}
