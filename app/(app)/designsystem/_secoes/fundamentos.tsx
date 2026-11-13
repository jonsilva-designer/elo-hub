import type { ReactNode } from 'react'
import {
  FileText,
  Folder,
  House,
  Inbox,
  Layers,
  ListChecks,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Num } from '@/components/elo/num'
import { cn } from '@/lib/utils'
import { Quadro, Secao } from './secao'

const CANTOS = [
  { px: '4px', classe: 'rounded-sm', uso: 'Etiquetas' },
  { px: '6px', classe: 'rounded-md', uso: 'Botões, campos, itens do menu' },
  { px: '8px', classe: 'rounded-xl', uso: 'Cartões, painéis, janelas' },
  { px: '12px', classe: 'rounded-2xl', uso: 'Lateral' },
]

const ESPACOS = [
  { px: '4px', classe: 'w-1' },
  { px: '8px', classe: 'w-2' },
  { px: '12px', classe: 'w-3' },
  { px: '16px', classe: 'w-4' },
  { px: '24px', classe: 'w-6' },
  { px: '32px', classe: 'w-8' },
]

const ICONES: { nome: string; Icone: LucideIcon }[] = [
  { nome: 'Início', Icone: House },
  { nome: 'Minhas atividades', Icone: ListChecks },
  { nome: 'Clientes', Icone: Users },
  { nome: 'Contratos', Icone: FileText },
  { nome: 'Escopos', Icone: Layers },
  { nome: 'Central ELO', Icone: Inbox },
  { nome: 'Documentos', Icone: Folder },
  { nome: 'Configurações', Icone: Settings },
]

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">{titulo}</p>
      {children}
    </div>
  )
}

export function Fundamentos() {
  return (
    <Secao
      titulo="Cantos, espaçamento, sombras e ícones"
      descricao="Cantos de quatro tamanhos, espaçamento em múltiplos de quatro, sombra só no que flutua e ícones Lucide de traço fino."
    >
      <Quadro className="space-y-8">
        <Grupo titulo="Cantos">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CANTOS.map((c) => (
              <li key={c.px} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={cn('size-14 shrink-0 border border-border bg-[var(--elo-dourado-suave)]', c.classe)}
                />
                <span className="text-xs">
                  <Num className="text-sm">{c.px}</Num>
                  <span className="block text-muted-foreground">{c.uso}</span>
                </span>
              </li>
            ))}
          </ul>
        </Grupo>

        <Grupo titulo="Espaçamento">
          <ul className="space-y-2">
            {ESPACOS.map((e) => (
              <li key={e.px} className="flex items-center gap-3 text-xs">
                <Num className="w-10 text-muted-foreground">{e.px}</Num>
                <span aria-hidden="true" className={cn('h-3 bg-primary', e.classe)} />
              </li>
            ))}
          </ul>
        </Grupo>

        <Grupo titulo="Sombras">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium">Cartões e painéis: só borda</p>
              <p className="text-xs text-muted-foreground">Sem sombra</p>
            </div>
            <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-flutuante)]">
              <p className="text-sm font-medium">Menus, janelas, avisos e a lateral</p>
              <p className="text-xs text-muted-foreground">Superfície flutuante, com sombra</p>
            </div>
          </div>
        </Grupo>

        <Grupo titulo="Ícones">
          <p className="text-xs text-muted-foreground">
            Lucide, <Num>16px</Num>, traço <Num>1,6</Num>. O ícone sempre acompanha texto.
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ICONES.map(({ nome, Icone }) => (
              <li key={nome} className="flex items-center gap-2 text-sm">
                <Icone aria-hidden="true" size={16} className="shrink-0 text-[var(--elo-azul-marinho)]" />
                {nome}
              </li>
            ))}
          </ul>
        </Grupo>
      </Quadro>
    </Secao>
  )
}
