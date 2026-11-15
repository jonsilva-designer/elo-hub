import type { NextRequest } from 'next/server'
import { gerarCsvContratos, nomeDoArquivoContratos } from '@/lib/contratos/csv'
import { filtrarContratos, lerFiltrosContratos } from '@/lib/contratos/filtros'
import { listarClientes } from '@/lib/dados/clientes'
import { listarContratos } from '@/lib/dados/contratos'
import { listarContratantes, listarServicos } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterSessao } from '@/lib/dados/sessao'

// Exportação da lista de contratos (DF-75, CA-16.3), só para o Administrador, com os mesmos filtros da tela.
// Como a de clientes, lê a sessão com obterSessao para responder 401 em vez de redirecionar.
export async function GET(request: NextRequest): Promise<Response> {
  const usuario = await obterSessao()
  if (!usuario) return new Response('Entre na plataforma para exportar.', { status: 401 })
  if (!ehAdmin(usuario)) return new Response('Você não tem permissão para exportar.', { status: 403 })

  const [contratos, clientes, contratantes, servicos] = await Promise.all([
    listarContratos(),
    listarClientes(),
    listarContratantes(),
    listarServicos(),
  ])
  const filtros = lerFiltrosContratos(request.nextUrl.searchParams, {
    clientes: clientes.map((c) => c.id),
    contratantes,
    servicos,
  })
  return new Response(gerarCsvContratos(filtrarContratos(contratos, filtros)), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nomeDoArquivoContratos(new Date())}"`,
      'Cache-Control': 'no-store',
    },
  })
}
