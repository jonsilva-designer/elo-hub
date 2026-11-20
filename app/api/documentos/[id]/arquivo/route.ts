import type { NextRequest } from 'next/server'
import { obterDocumento } from '@/lib/dados/documentos'
import { obterSessao } from '@/lib/dados/sessao'
import { nomeDeArquivoSeguro } from '@/lib/documentos/regras'
import { formatarData, formatarTamanho } from '@/lib/formato'
import { nomeNoCabecalho } from '@/lib/documentos/regras'

// Download do documento (arquitetura 5 e 6; RN-16, CA-12.5). Confere a sessão e o acesso ao documento antes de
// entregar. No protótipo, o arquivo não é guardado: a rota devolve um texto de exemplo com os dados do documento.
// Na Etapa 3, ela redireciona para o link temporário do bucket privado do Supabase Storage.

/** O nome sem a extensão, para o arquivo de exemplo: "Contrato.pdf" vira "Contrato-exemplo.txt". */
function nomeDoExemplo(nomeOriginal: string): string {
  const seguro = nomeDeArquivoSeguro(nomeOriginal)
  const ponto = seguro.lastIndexOf('.')
  return `${ponto > 0 ? seguro.slice(0, ponto) : seguro}-exemplo.txt`
}

/** O nome só com ASCII, para o `filename` dos navegadores antigos; o `filename*` leva o nome completo. */
const semAcento = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7e]|"/g, '_')

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const usuario = await obterSessao()
  if (!usuario) return new Response('Entre na plataforma para baixar.', { status: 401 })

  // Fora do acesso ou inexistente: a mesma resposta, sem revelar que o documento existe.
  const { id } = await params
  const documento = await obterDocumento(id)
  if (!documento) return new Response('Documento não encontrado.', { status: 404 })

  const nome = nomeDoExemplo(documento.arquivo.nome)
  const texto = [
    'Arquivo de exemplo do protótipo da Plataforma ELO.',
    '',
    `Documento: ${documento.nome}`,
    `Categoria: ${documento.categoria}`,
    `Cliente: ${documento.nomeCliente ?? 'Sem cliente'}`,
    `Data do documento: ${formatarData(documento.data)}`,
    `Arquivo original: ${documento.arquivo.nome} (${formatarTamanho(documento.arquivo.tamanho)})`,
    '',
    'Na Etapa 3, este download entrega o arquivo guardado, por um link temporário, depois da mesma conferência de acesso.',
    '',
  ].join('\r\n')
  return new Response(texto, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${semAcento(nome)}"; filename*=UTF-8''${nomeNoCabecalho(nome)}`,
      'Cache-Control': 'no-store',
    },
  })
}
