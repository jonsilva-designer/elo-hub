'use client'

import { startTransition, useActionState, useState, type FormEvent } from 'react'
import { Campo } from '@/components/elo/campo'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { enviarDiagnostico } from '@/lib/site/acoes'
import { ESTADO_INICIAL_SITE } from '@/lib/site/estados'
import { TEXTOS_SITE } from '@/lib/site/textos'
import { UFS } from '@/lib/ufs'
import { Aceite, CampoArmadilha, Confirmacao, ErroGeral, EspacoTurnstile } from './partes-do-formulario'

/**
 * A solicitação de diagnóstico (parte 9, 4.1; F19, DF-76). Envia pelo `onSubmit`, dentro de uma transição: o React não
 * limpa o formulário, e o que foi digitado continua depois de uma recusa. Quem confere tudo é o servidor.
 */
export function FormularioDiagnostico({ segmentos }: { segmentos: string[] }) {
  const [versao, setVersao] = useState(0)
  return <Formulario key={versao} segmentos={segmentos} aoEnviarOutro={() => setVersao((v) => v + 1)} />
}

function Formulario({ segmentos, aoEnviarOutro }: { segmentos: string[]; aoEnviarOutro: () => void }) {
  const [estado, enviar, enviando] = useActionState(enviarDiagnostico, ESTADO_INICIAL_SITE)
  const [uf, setUf] = useState('')
  const [segmento, setSegmento] = useState('')
  const erros = estado.erros

  if (estado.confirmacao) return <Confirmacao texto={estado.confirmacao} aoEnviarOutro={aoEnviarOutro} />

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    startTransition(() => enviar(dados))
  }

  return (
    <form onSubmit={aoEnviar} noValidate className="space-y-4">
      {estado.erroGeral ? <ErroGeral>{estado.erroGeral}</ErroGeral> : null}
      <CampoArmadilha />
      <Campo rotulo="Nome" obrigatorio erro={erros.nome}>
        {(p) => <Input {...p} name="nome" autoComplete="name" />}
      </Campo>
      <Campo rotulo="Empresa" obrigatorio erro={erros.empresa}>
        {(p) => <Input {...p} name="empresa" autoComplete="organization" />}
      </Campo>
      <Campo rotulo="CNPJ" obrigatorio erro={erros.cnpj}>
        {(p) => <Input {...p} name="cnpj" autoCapitalize="characters" />}
      </Campo>
      <Campo rotulo="Cargo">{(p) => <Input {...p} name="cargo" autoComplete="organization-title" />}</Campo>
      <Campo rotulo="E-mail" obrigatorio erro={erros.email}>
        {(p) => <Input {...p} name="email" type="email" autoComplete="email" />}
      </Campo>
      <Campo rotulo="Telefone ou WhatsApp" obrigatorio erro={erros.telefone}>
        {(p) => <Input {...p} name="telefone" type="tel" autoComplete="tel" />}
      </Campo>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <Campo rotulo="Cidade">{(p) => <Input {...p} name="cidade" autoComplete="address-level2" />}</Campo>
        <Campo rotulo="UF" erro={erros.uf}>
          {(p) => <SelecaoDoFormulario nome="uf" valor={uf} aoMudar={setUf} opcoes={UFS} rotuloVazio="Nenhuma" atributos={p} className="w-full sm:w-28" />}
        </Campo>
      </div>
      <Campo rotulo="Segmento de atuação" erro={erros.segmento}>
        {(p) => <SelecaoDoFormulario nome="segmento" valor={segmento} aoMudar={setSegmento} opcoes={segmentos} rotuloVazio="Nenhum" atributos={p} />}
      </Campo>
      <Campo rotulo="Principais contratantes atendidos">{(p) => <Input {...p} name="contratantes" />}</Campo>
      <Campo rotulo="Mensagem ou necessidade">{(p) => <Textarea {...p} name="mensagem" rows={4} />}</Campo>
      <Aceite nome="consentimento" texto={TEXTOS_SITE.diagnostico.consentimento} erro={erros.consentimento} />
      <EspacoTurnstile />
      <Button type="submit" carregando={enviando} className="w-full">
        Enviar pedido
      </Button>
    </form>
  )
}
