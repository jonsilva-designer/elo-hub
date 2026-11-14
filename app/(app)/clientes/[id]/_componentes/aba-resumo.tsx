import Link from 'next/link'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { ListaCampos } from '@/components/elo/lista-campos'
import { NivelMaturidade } from '@/components/elo/nivel-maturidade'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { LinhaAutoria } from '@/components/elo/painel-historico'
import { buttonVariants } from '@/components/ui/button'
import type { AvaliacaoMaturidade, Cliente, EntradaHistorico } from '@/lib/dados/tipos'
import { formatarData } from '@/lib/formato'
import { cn } from '@/lib/utils'

const naoInformado = <span className="text-muted-foreground">Não informado</span>

const ou = (valor: string | undefined) => (valor?.trim() ? valor : naoInformado)

/** Resumo: os dados de F02 fora do cabeçalho, a maturidade atual e quem criou e alterou (CA-17.1). */
export function AbaResumo({
  cliente,
  atual,
  historico,
}: {
  cliente: Cliente
  atual: AvaliacaoMaturidade | null
  historico: EntradaHistorico[]
}) {
  const cidadeUf = [cliente.cidade, cliente.uf].filter(Boolean).join('/')
  return (
    <div className="space-y-5">
      {cliente.ehCadastroElo ? (
        <p className="text-sm text-muted-foreground">Cadastro da própria ELO, usado nas demandas institucionais</p>
      ) : null}
      <Painel titulo="Dados do cliente">
        <ListaCampos
          itens={[
            { rotulo: 'Segmento', valor: ou(cliente.segmento) },
            { rotulo: 'Cidade/UF', valor: ou(cidadeUf) },
            { rotulo: 'Contato principal', valor: ou(cliente.contatoPrincipal) },
            { rotulo: 'Cargo', valor: ou(cliente.cargo) },
            { rotulo: 'Telefone', valor: cliente.telefone?.trim() ? <Num>{cliente.telefone}</Num> : naoInformado },
            { rotulo: 'E-mail', valor: ou(cliente.email) },
            { rotulo: 'Observações', valor: ou(cliente.observacoes) },
          ]}
        />
      </Painel>
      {cliente.ehCadastroElo ? null : (
        <Painel
          titulo="Maturidade atual"
          acao={
            <Link
              href={`/clientes/${cliente.id}?aba=maturidade`}
              className={cn(buttonVariants({ variant: 'link' }), 'h-auto px-0 text-secundario')}
            >
              Ver maturidade
            </Link>
          }
        >
          {atual ? (
            <ListaCampos
              itens={[
                { rotulo: 'Maturidade geral', valor: <NivelMaturidade nivel={atual.maturidadeGeral} /> },
                { rotulo: 'Prontidão', valor: atual.prontidao ? <EtiquetaStatus status={atual.prontidao} /> : null },
                { rotulo: 'Data da avaliação', valor: <Num>{formatarData(atual.data)}</Num> },
              ]}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma avaliação concluída.</p>
          )}
        </Painel>
      )}
      <LinhaAutoria entradas={historico} />
    </div>
  )
}
