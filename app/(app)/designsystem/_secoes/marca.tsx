import Image from 'next/image'
import { Num } from '@/components/elo/num'
import { CORES } from '@/lib/design/cores'
import { Quadro, Secao } from './secao'
import { ValorDaCor } from './valor-da-cor'

export function Marca() {
  return (
    <Secao
      titulo="Marca"
      descricao="O logo nas duas versões e as cores do padrão, com nome, valor e uso. As cores provisórias aguardam os códigos oficiais."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="space-y-2">
          <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-background">
            <Image src="/marca/logo-elo.png" alt="Logo da ELO, versão original" width={814} height={627} className="h-16 w-auto" />
          </div>
          <figcaption className="text-xs text-muted-foreground">Original, sobre papel ou branco</figcaption>
        </figure>
        <figure className="space-y-2">
          <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-primary">
            <Image src="/marca/logo-elo-claro.png" alt="Logo da ELO, versão clara" width={814} height={627} className="h-16 w-auto" />
          </div>
          <figcaption className="text-xs text-muted-foreground">Clara, sobre azul-marinho</figcaption>
        </figure>
      </div>

      <Quadro className="p-0 sm:p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--elo-divisoria)] text-xs text-muted-foreground">
                <th scope="col" className="px-4 py-2.5 font-medium">Cor</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Token</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Valor</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Uso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--elo-divisoria)]">
              {CORES.map((cor) => (
                <tr key={cor.token}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="size-8 shrink-0 rounded-md border border-border"
                        style={{ backgroundColor: `var(${cor.token})` }}
                      />
                      <span className="font-medium">{cor.nome}</span>
                      {cor.provisoria ? (
                        <span className="text-xs text-muted-foreground">provisória</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs"><Num>{cor.token}</Num></td>
                  <td className="px-4 py-2.5 text-xs"><ValorDaCor token={cor.token} /></td>
                  <td className="px-4 py-2.5 text-[13px] text-muted-foreground">{cor.uso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Quadro>
    </Secao>
  )
}
