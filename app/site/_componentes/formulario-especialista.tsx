'use client'

import { startTransition, useActionState, useState, type FormEvent } from 'react'
import { Campo } from '@/components/elo/campo'
import { CampoData } from '@/components/elo/campo-data'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { enviarCandidatura } from '@/lib/site/acoes'
import { ESTADO_INICIAL_SITE } from '@/lib/site/estados'
import { TEXTOS_SITE } from '@/lib/site/textos'
import { UFS } from '@/lib/ufs'
import { Aceite, CampoArmadilha, Confirmacao, ErroGeral, EspacoTurnstile } from './partes-do-formulario'

/**
 * O cadastro de especialista (parte 9, 4.2; F19, F11, DF-27): sem envio de arquivo, o currículo por link. Envia pelo
 * `onSubmit`, dentro de uma transição, para o React não limpar o formulário. Quem confere tudo é o servidor.
 */
export function FormularioEspecialista({ especialidades }: { especialidades: string[] }) {
  const [versao, setVersao] = useState(0)
  return <Formulario key={versao} especialidades={especialidades} aoEnviarOutro={() => setVersao((v) => v + 1)} />
}

function Formulario({ especialidades, aoEnviarOutro }: { especialidades: string[]; aoEnviarOutro: () => void }) {
  const [estado, enviar, enviando] = useActionState(enviarCandidatura, ESTADO_INICIAL_SITE)
  const [especialidade, setEspecialidade] = useState('')
  const [uf, setUf] = useState('')
  const [nascimento, setNascimento] = useState<string | null>(null)
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
      <Campo rotulo="Data de nascimento" erro={erros.dataNascimento}>
        {(p) => (
          <>
            <CampoData {...p} valor={nascimento} onChange={setNascimento} />
            <input type="hidden" name="dataNascimento" value={nascimento ?? ''} />
          </>
        )}
      </Campo>
      <Campo rotulo="Especialidade" obrigatorio erro={erros.especialidade}>
        {(p) => <SelecaoDoFormulario nome="especialidade" valor={especialidade} aoMudar={setEspecialidade} opcoes={especialidades} atributos={p} />}
      </Campo>
      <Campo rotulo="Subespecialidade">{(p) => <Input {...p} name="subespecialidade" />}</Campo>
      <Campo rotulo="E-mail" obrigatorio erro={erros.email}>
        {(p) => <Input {...p} name="email" type="email" autoComplete="email" />}
      </Campo>
      <Campo rotulo="Telefone" obrigatorio erro={erros.telefone}>
        {(p) => <Input {...p} name="telefone" type="tel" autoComplete="tel" />}
      </Campo>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <Campo rotulo="Cidade">{(p) => <Input {...p} name="cidade" autoComplete="address-level2" />}</Campo>
        <Campo rotulo="UF" erro={erros.uf}>
          {(p) => <SelecaoDoFormulario nome="uf" valor={uf} aoMudar={setUf} opcoes={UFS} rotuloVazio="Nenhuma" atributos={p} className="w-full sm:w-28" />}
        </Campo>
      </div>
      <Campo rotulo="Empresa">{(p) => <Input {...p} name="empresa" autoComplete="organization" />}</Campo>
      <Campo rotulo="Link do currículo ou LinkedIn" erro={erros.curriculo} ajuda="Sem envio de arquivo: informe um link">
        {(p) => <Input {...p} name="curriculo" type="url" />}
      </Campo>
      <Aceite nome="aviso" texto={TEXTOS_SITE.especialista.aviso} erro={erros.aviso} />
      <Aceite nome="consentimento" texto={TEXTOS_SITE.especialista.consentimento} erro={erros.consentimento} />
      <EspacoTurnstile />
      <Button type="submit" carregando={enviando} className="w-full">
        Enviar candidatura
      </Button>
    </form>
  )
}
