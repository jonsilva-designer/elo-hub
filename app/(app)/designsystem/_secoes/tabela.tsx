'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { BarraFiltros } from '@/components/elo/barra-filtros'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatarData, formatarReal } from '@/lib/formato'
import { CONTRATOS_EXEMPLO, VIGENCIAS, type ContratoDaLista } from '../exemplos'
import { Exemplo, Subsecao } from './secao'

const COLUNAS: Coluna<ContratoDaLista>[] = [
  { id: 'numero', titulo: 'Número', celula: (c) => <Num>{c.numero}</Num>, ordenarPor: (c) => c.numero },
  { id: 'cliente', titulo: 'Cliente', celula: (c) => c.cliente, ordenarPor: (c) => c.cliente },
  { id: 'status', titulo: 'Status', celula: (c) => <EtiquetaStatus status={c.status} />, ordenarPor: (c) => c.status },
  { id: 'vigencia', titulo: 'Vigência', celula: (c) => <EtiquetaStatus status={c.vigencia} /> },
  { id: 'termino', titulo: 'Término', celula: (c) => <Num>{formatarData(c.termino)}</Num>, ordenarPor: (c) => c.termino },
  {
    id: 'valor',
    titulo: 'Valor',
    celula: (c) => <Num>{formatarReal(c.valor)}</Num>,
    ordenarPor: (c) => c.valor,
    alinhar: 'direita',
  },
]

const SEM_VALOR_FILTRO = 'todas'

/** Tira acento e caixa, para a busca achar "sao lucas" em "Clínica São Lucas". */
function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')
}

function destaqueDoContrato(c: ContratoDaLista) {
  if (c.vigencia === 'Próximo do vencimento') return 'atencao'
  if (c.vigencia === 'Vencido') return 'problema'
  return null
}

// Os avisos abaixo são só da demonstração: a tela real abre a página do contrato e exporta a planilha.
function abrirContrato(c: ContratoDaLista) {
  toast(`Abre a página do contrato ${c.numero}`)
}

export function Tabela() {
  const [busca, setBusca] = useState('')
  const [vigencia, setVigencia] = useState(SEM_VALOR_FILTRO)

  const linhas = useMemo(() => {
    const termo = normalizar(busca.trim())
    return CONTRATOS_EXEMPLO.filter(
      (c) =>
        normalizar(c.cliente).includes(termo) && (vigencia === SEM_VALOR_FILTRO || c.vigencia === vigencia),
    )
  }, [busca, vigencia])

  const vazio = <EstadoVazio titulo="Nenhum contrato encontrado" descricao="Ajuste a busca ou os filtros." />

  return (
    <Subsecao titulo="Tabela">
      <Exemplo
        largo
        rotulo="Tabela com busca, filtros, ordenação e paginação"
        nota="A barra lateral em âmbar marca o contrato próximo do vencimento. A vermelha marca o vencido."
      >
        <div className="space-y-4">
          <BarraFiltros
            busca={busca}
            aoBuscar={setBusca}
            aoExportar={() => toast('Exporta a lista em planilha')}
            filtros={
              <Select value={vigencia} onValueChange={setVigencia}>
                <SelectTrigger aria-label="Vigência" className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEM_VALOR_FILTRO}>Todas</SelectItem>
                  {VIGENCIAS.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
          <div className="overflow-hidden rounded-xl border border-border">
            <TabelaDados
              colunas={COLUNAS}
              linhas={linhas}
              chave={(c) => c.numero}
              aoClicarLinha={abrirContrato}
              destaque={destaqueDoContrato}
              porPagina={5}
              vazio={vazio}
            />
          </div>
        </div>
      </Exemplo>
      <Exemplo largo rotulo="Tabela vazia">
        <div className="overflow-hidden rounded-xl border border-border">
          <TabelaDados colunas={COLUNAS} linhas={[]} chave={(c) => c.numero} vazio={vazio} />
        </div>
      </Exemplo>
      <Exemplo largo rotulo="Sem linha clicável">
        <div className="overflow-hidden rounded-xl border border-border">
          <TabelaDados
            colunas={COLUNAS}
            linhas={CONTRATOS_EXEMPLO.slice(0, 3)}
            chave={(c) => c.numero}
            destaque={destaqueDoContrato}
            vazio={vazio}
          />
        </div>
      </Exemplo>
    </Subsecao>
  )
}
