import Image from 'next/image'
import { Num } from '@/components/elo/num'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CORES } from '@/lib/design/cores'
import { Quadro, Secao } from './secao'
import { ValorDaCor } from './valor-da-cor'

export function Marca() {
  return (
    <Secao
      titulo="Marca"
      descricao="O logo nas duas versões, vetorizado do arquivo da ELO, e as cores do padrão, com nome, valor e uso. A paleta do branding vale só para o logo; a interface usa a do padrão."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="space-y-2">
          <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-background">
            <Image src="/marca/logo-elo.svg" alt="Logo da ELO, versão original" width={1199} height={447} className="h-16 w-auto" />
          </div>
          <figcaption className="text-xs text-muted-foreground">Original, sobre papel ou branco</figcaption>
        </figure>
        <figure className="space-y-2">
          <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-primary">
            <Image src="/marca/logo-elo-claro.svg" alt="Logo da ELO, versão clara" width={1199} height={447} className="h-16 w-auto" />
          </div>
          <figcaption className="text-xs text-muted-foreground">Clara, sobre azul-marinho</figcaption>
        </figure>
      </div>

      <Quadro className="p-0 sm:p-0">
        <Table className="min-w-160">
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Cor</TableHead>
              <TableHead scope="col">Token</TableHead>
              <TableHead scope="col">Valor</TableHead>
              <TableHead scope="col">Uso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CORES.map((cor) => (
              <TableRow key={cor.token}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="size-8 shrink-0 rounded-md border border-border"
                      style={{ backgroundColor: `var(${cor.token})` }}
                    />
                    <span className="font-medium">{cor.nome}</span>
                    {cor.provisoria ? <span className="text-xs text-muted-foreground">provisória</span> : null}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  <Num>{cor.token}</Num>
                </TableCell>
                <TableCell className="text-xs">
                  <ValorDaCor token={cor.token} />
                </TableCell>
                <TableCell className="text-secundario whitespace-normal text-muted-foreground">{cor.uso}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Quadro>
    </Secao>
  )
}
