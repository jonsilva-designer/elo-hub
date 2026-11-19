'use client'

import { useRouter } from 'next/navigation'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaCriticidade, EtiquetaSinal } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { Apagado, TextoComDetalhe } from '@/components/elo/textos'
import type { Alerta } from '@/lib/alertas/regras'
import { CRITICIDADES } from '@/lib/escopos/regras'
import { formatarData } from '@/lib/formato'
import { TextoComNumeros } from '../../documentos/_componentes/texto-com-numeros'

const semValor = (texto: string) => <Apagado>{texto}</Apagado>

const COLUNAS: Coluna<Alerta>[] = [
  { id: 'tipo', titulo: 'Alerta', ordenarPor: (a) => a.tipo, celula: (a) => <EtiquetaSinal texto={a.tipo} tom={a.tom} /> },
  {
    id: 'registro',
    titulo: 'Registro',
    largura: 'w-1/3',
    ordenarPor: (a) => a.registro,
    celula: (a) => (
      <TextoComDetalhe texto={<TextoComNumeros texto={a.registro} />} destaque={false} detalhes={[a.cliente]} />
    ),
  },
  {
    id: 'criticidade',
    titulo: 'Criticidade',
    ordenarPor: (a) => (a.criticidade ? CRITICIDADES.indexOf(a.criticidade) : null),
    celula: (a) => (a.criticidade ? <EtiquetaCriticidade criticidade={a.criticidade} /> : semValor('—')),
  },
  {
    id: 'data',
    titulo: 'Prazo ou término',
    ordenarPor: (a) => a.data,
    celula: (a) => (a.data ? <Num>{formatarData(a.data)}</Num> : semValor('—')),
  },
]

/**
 * Os alertas do painel (F15), na ordem que chegam: da maior para a menor criticidade (DF-15). A linha abre o registro
 * que originou o alerta (CA-15.1). Antes do início oficial da operação, o aviso da DF-46 no lugar da lista.
 */
export function ListaAlertas({ ativos, alertas }: { ativos: boolean; alertas: Alerta[] }) {
  const router = useRouter()
  return (
    <TabelaDados
      colunas={COLUNAS}
      linhas={ativos ? alertas : []}
      chave={(a) => a.chave}
      aoClicarLinha={(a) => router.push(a.href)}
      destaque={(a) => (a.tom === 'problema' ? 'problema' : null)}
      vazio={
        ativos ? (
          <EstadoVazio titulo="Nenhum alerta agora." />
        ) : (
          <EstadoVazio
            titulo="Os alertas aparecem depois do início oficial da operação."
            descricao="Enquanto a carteira é carregada e conferida, eles ficam ocultos. O Administrador registra o início nos parâmetros."
          />
        )
      }
    />
  )
}
