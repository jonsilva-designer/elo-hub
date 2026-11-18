'use client'

import type { ReactNode } from 'react'
import { Campo } from '@/components/elo/campo'
import { QuadroPrototipo } from '@/components/elo/quadro-prototipo'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CAMPO_ARMADILHA } from '@/lib/site/protecao'

/** O campo armadilha (CA-19.4): fora da vista, dos leitores de tela e do Tab; só um robô o preenche. */
export function CampoArmadilha() {
  return (
    <div aria-hidden="true" className="sr-only">
      <Label htmlFor="elo-campo-armadilha">Site</Label>
      <Input id="elo-campo-armadilha" name={CAMPO_ARMADILHA} tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  )
}

/** Uma caixa de aceite obrigatória com o texto do Apêndice E (CA-19.2). Envia "sim" quando marcada. */
export function Aceite({ nome, texto, erro }: { nome: string; texto: string; erro?: string }) {
  return (
    <Campo rotulo={texto} horizontal obrigatorio erro={erro}>
      {(p) => <Checkbox {...p} name={nome} value="sim" />}
    </Campo>
  )
}

/** O espaço do Turnstile, que entra na Etapa 3 com as chaves da conta da ELO (DA-03). */
export function EspacoTurnstile() {
  return (
    <QuadroPrototipo>
      <p className="text-secundario text-muted-foreground">
        Aqui entra a verificação contra robôs (Turnstile), na Etapa 3. No protótipo, valem o campo escondido e o limite de
        envios.
      </p>
    </QuadroPrototipo>
  )
}

/** A confirmação do Apêndice E, no lugar do formulário, e o caminho para enviar de novo. */
export function Confirmacao({ texto, aoEnviarOutro }: { texto: string; aoEnviarOutro: () => void }) {
  return (
    <div role="status" className="space-y-4">
      <p className="text-sm text-foreground">{texto}</p>
      <Button type="button" variant="outline" onClick={aoEnviarOutro}>
        Enviar outro
      </Button>
    </div>
  )
}

/** A recusa geral do servidor, como o limite de envios. */
export function ErroGeral({ children }: { children: ReactNode }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}
