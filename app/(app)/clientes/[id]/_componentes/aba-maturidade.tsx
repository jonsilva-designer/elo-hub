import Link from 'next/link'
import { BotaoBloqueado } from '@/components/elo/botao-bloqueado'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { NivelMaturidade } from '@/components/elo/nivel-maturidade'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { AvaliacaoDetalhada, Cliente } from '@/lib/dados/tipos'
import { formatarData, VAZIO } from '@/lib/formato'
import type { ComparacaoMaturidade } from '@/lib/maturidade/regras'
import { TabelaAvaliacoes } from './tabela-avaliacoes'

function NovaAvaliacao({ cliente }: { cliente: Cliente }) {
  if (cliente.status === 'Inativo') {
    return (
      <BotaoBloqueado variant="outline" motivo="Cliente inativo: reative o cliente para avaliar">
        Nova avaliação
      </BotaoBloqueado>
    )
  }
  return (
    <Button asChild variant="outline">
      <Link href={`/avaliacoes/nova?cliente=${cliente.id}`}>Nova avaliação</Link>
    </Button>
  )
}

/** Inicial e atual lado a lado (CA-20.4): maturidade geral, prontidão e uma linha por dimensão. */
function Comparacao({ comparacao }: { comparacao: ComparacaoMaturidade }) {
  const { inicial, atual } = comparacao
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Dimensão</TableHead>
          <TableHead>
            Inicial · <Num>{formatarData(inicial.data)}</Num>
          </TableHead>
          <TableHead>
            Atual · <Num>{formatarData(atual.data)}</Num>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Maturidade geral</TableCell>
          <TableCell>
            <NivelMaturidade nivel={inicial.maturidadeGeral} />
          </TableCell>
          <TableCell>
            <NivelMaturidade nivel={atual.maturidadeGeral} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Prontidão</TableCell>
          <TableCell>{inicial.prontidao ? <EtiquetaStatus status={inicial.prontidao} /> : VAZIO}</TableCell>
          <TableCell>{atual.prontidao ? <EtiquetaStatus status={atual.prontidao} /> : VAZIO}</TableCell>
        </TableRow>
        {comparacao.dimensoes.map((d) => (
          <TableRow key={d.dimensao}>
            <TableCell>{d.dimensao}</TableCell>
            <TableCell>
              <NivelMaturidade nivel={d.inicial} />
            </TableCell>
            <TableCell>
              <NivelMaturidade nivel={d.atual} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/** Aba Maturidade: a comparação entre a inicial e a atual, e a lista das avaliações (F20). */
export function AbaMaturidade({
  cliente,
  avaliacoes,
  comparacao,
}: {
  cliente: Cliente
  avaliacoes: AvaliacaoDetalhada[]
  comparacao: ComparacaoMaturidade | null
}) {
  return (
    <div className="space-y-5">
      <Painel titulo="Inicial e atual" semRespiro>
        {comparacao ? (
          <Comparacao comparacao={comparacao} />
        ) : (
          <EstadoVazio
            titulo="Nenhuma avaliação concluída."
            descricao="A comparação aparece quando a primeira for concluída."
          />
        )}
      </Painel>
      <Painel titulo="Avaliações" acao={<NovaAvaliacao cliente={cliente} />} semRespiro>
        <TabelaAvaliacoes
          avaliacoes={avaliacoes}
          vazio={<EstadoVazio titulo="Nenhuma avaliação deste cliente." acao={<NovaAvaliacao cliente={cliente} />} />}
        />
      </Painel>
    </div>
  )
}
