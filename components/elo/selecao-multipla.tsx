'use client'

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'

type Opcao = { valor: string; rotulo: string }

/** Seleção de várias opções, com busca. As escolhidas ficam como fichas dentro do campo. */
export function SelecaoMultipla({
  opcoes,
  valores,
  onChange,
  placeholder = 'Selecione',
  id,
  disabled,
  'aria-describedby': descritoPor,
  'aria-invalid': invalido,
}: {
  opcoes: Opcao[]
  valores: string[]
  onChange: (valores: string[]) => void
  placeholder?: string
  id?: string
  disabled?: boolean
  'aria-describedby'?: string
  'aria-invalid'?: true
}) {
  const ancora = useComboboxAnchor()
  const rotulos = new Map(opcoes.map((o) => [o.valor, o.rotulo]))
  const rotuloDe = (v: string) => rotulos.get(v) ?? v

  return (
    <Combobox
      multiple
      items={opcoes.map((o) => o.valor)}
      itemToStringLabel={rotuloDe}
      value={valores}
      onValueChange={(novos) => onChange(novos)}
      disabled={disabled}
    >
      <ComboboxChips ref={ancora} className={disabled ? 'cursor-not-allowed opacity-50' : undefined}>
        <ComboboxValue>
          {(escolhidos: string[]) => (
            <>
              {escolhidos.map((v) => (
                <ComboboxChip key={v} rotuloRemover={`Remover ${rotuloDe(v)}`}>
                  {rotuloDe(v)}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                id={id}
                aria-describedby={descritoPor}
                aria-invalid={invalido}
                placeholder={escolhidos.length === 0 ? placeholder : undefined}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={ancora}>
        <ComboboxEmpty>Nenhum resultado</ComboboxEmpty>
        <ComboboxList>
          {(v: string) => (
            <ComboboxItem key={v} value={v}>
              {rotuloDe(v)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
