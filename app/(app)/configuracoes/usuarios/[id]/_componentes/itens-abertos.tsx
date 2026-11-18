'use client'

import Link from 'next/link'
import { useId, useState, useTransition } from 'react'
import { Campo } from '@/components/elo/campo'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { avisarSalvo } from '@/lib/avisos'
import type { ItemAberto } from '@/lib/dados/usuarios-configuracao'
import { redistribuirItens } from '@/lib/usuarios/acoes'
import { TextoComNumeros } from '../../../../documentos/_componentes/texto-com-numeros'

const CLASSE_LINK = 'rounded-sm text-primary underline-offset-4 hover:underline'

/**
 * Os itens abertos sob a responsabilidade do usuário, com a redistribuição ali mesmo (DF-36, CA-01.9): o Administrador
 * escolhe um ou mais itens e o novo responsável, entre quem tem vínculo com o cliente de cada item escolhido (RN-19).
 * `candidatos` traz, por cliente, quem pode receber; a tela oferece só quem serve para todos os escolhidos.
 */
export function ItensAbertos({
  usuarioId,
  itens,
  candidatos,
}: {
  usuarioId: string
  itens: ItemAberto[]
  candidatos: Record<string, { id: string; nome: string }[]>
}) {
  const prefixo = useId()
  const [escolhidos, setEscolhidos] = useState<string[]>([])
  const [novo, setNovo] = useState('')
  const [recusa, setRecusa] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()

  const clientes = [...new Set(itens.filter((i) => escolhidos.includes(i.chave)).map((i) => i.clienteId))]
  const possiveis =
    clientes.length === 0
      ? []
      : (candidatos[clientes[0]] ?? []).filter((c) => clientes.every((cid) => (candidatos[cid] ?? []).some((x) => x.id === c.id)))

  function alternar(chave: string, marcado: boolean) {
    setEscolhidos((atual) => (marcado ? [...atual, chave] : atual.filter((c) => c !== chave)))
    setNovo('')
  }

  function redistribuir() {
    setRecusa(null)
    iniciar(async () => {
      const resultado = await redistribuirItens(usuarioId, escolhidos, novo)
      if (resultado.ok) {
        avisarSalvo(resultado.mensagem)
        setEscolhidos([])
        setNovo('')
      } else {
        setRecusa(resultado.mensagem)
      }
    })
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-divisoria">
        {itens.map((i) => (
          <li key={i.chave} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 first:pt-0 last:pb-0">
            <Checkbox
              id={`${prefixo}-${i.chave}`}
              checked={escolhidos.includes(i.chave)}
              onCheckedChange={(v) => alternar(i.chave, v === true)}
            />
            <Label htmlFor={`${prefixo}-${i.chave}`} className="min-w-0 flex-1 font-normal">
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-foreground">
                  {i.tipo}: <TextoComNumeros texto={i.descricao} />
                </span>
                <span className="text-xs text-muted-foreground">{i.cliente}</span>
              </span>
            </Label>
            <EtiquetaStatus status={i.status} />
            <Link href={i.href} className={CLASSE_LINK}>
              Abrir
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-64">
          <Campo rotulo="Novo responsável" ajuda="Com vínculo com o cliente de cada item escolhido">
            {(p) => (
              <SelecaoDoFormulario
                nome="novoResponsavel"
                valor={novo}
                aoMudar={setNovo}
                opcoes={possiveis.map((c) => ({ valor: c.id, rotulo: c.nome }))}
                atributos={p}
                disabled={escolhidos.length === 0}
                placeholder={escolhidos.length === 0 ? 'Escolha os itens' : 'Selecione'}
              />
            )}
          </Campo>
        </div>
        <Button type="button" onClick={redistribuir} carregando={pendente} disabled={escolhidos.length === 0}>
          Redistribuir
        </Button>
      </div>
      {recusa ? (
        <Alert variant="destructive">
          <AlertDescription>{recusa}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
