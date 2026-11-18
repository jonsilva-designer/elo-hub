import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { renderToBuffer } from '@react-pdf/renderer'
import type { NextRequest } from 'next/server'
import { obterSessao } from '@/lib/dados/sessao'
import { obterVisaoExecutiva } from '@/lib/dados/visao-executiva'
import { DocumentoVisaoExecutiva } from '@/lib/visao-executiva/pdf'

// O PDF da Visão Executiva (arquitetura 3.5 e 5; F14, CA-14.3, CA-14.4), gerado no servidor com a mesma leitura da
// tela, com o filtro opcional por contrato (CA-14.6). Sem sessão, 401; sem vínculo ou no cadastro da ELO, 404 sem
// revelar se o cliente existe.

/** O logo claro da ELO, para a faixa azul do cabeçalho, como data URI. */
async function logoClaro(): Promise<string> {
  const arquivo = await readFile(path.join(process.cwd(), 'public', 'marca', 'logo-elo-claro.png'))
  return `data:image/png;base64,${arquivo.toString('base64')}`
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ cliente: string }> }): Promise<Response> {
  const usuario = await obterSessao()
  if (!usuario) return new Response('Entre na plataforma para gerar o PDF.', { status: 401 })

  const { cliente } = await params
  const visao = await obterVisaoExecutiva(cliente, request.nextUrl.searchParams.get('contrato'))
  if (!visao) return new Response('Cliente não encontrado.', { status: 404 })

  const pdf = await renderToBuffer(<DocumentoVisaoExecutiva visao={visao} logo={await logoClaro()} />)
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="visao-executiva-${visao.cliente.id}-${visao.hoje}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
