'use client'

import type { AtributosDeCampo } from '@/components/elo/campo'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

/** Valor do item que limpa a escolha: a seleção não aceita texto vazio como item. */
const VAZIA = '__vazia__'

type Opcao = string | { valor: string; rotulo: string }

const valorDe = (o: Opcao) => (typeof o === 'string' ? o : o.valor)
const rotuloDe = (o: Opcao) => (typeof o === 'string' ? o : o.rotulo)

/**
 * Seleção dentro de um formulário de ação do servidor. O valor vai num campo oculto, porque o React limpa o
 * formulário depois da ação e a seleção guarda o valor no próprio estado. Com `rotuloVazio`, a escolha é
 * opcional e ganha um item que a limpa.
 */
export function SelecaoDoFormulario({
  nome,
  valor,
  aoMudar,
  opcoes,
  rotuloVazio,
  atributos,
  className,
  disabled,
  placeholder = 'Selecione',
}: {
  nome: string
  valor: string
  aoMudar: (valor: string) => void
  opcoes: readonly Opcao[]
  rotuloVazio?: string
  atributos?: AtributosDeCampo
  className?: string
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <>
      <Select value={valor} onValueChange={(v) => aoMudar(v === VAZIA ? '' : v)} disabled={disabled}>
        <SelectTrigger {...atributos} className={className ?? 'w-full'}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {rotuloVazio ? <SelectItem value={VAZIA}>{rotuloVazio}</SelectItem> : null}
          {opcoes.map((o) => (
            <SelectItem key={valorDe(o)} value={valorDe(o)}>
              {rotuloDe(o)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name={nome} value={valor} />
    </>
  )
}
