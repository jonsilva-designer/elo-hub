'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { Campo } from '@/components/elo/campo'
import { CampoData } from '@/components/elo/campo-data'
import { Painel } from '@/components/elo/painel'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { ValorFixo } from '@/components/elo/textos'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import type { EspecialistaDetalhado } from '@/lib/dados/tipos'
import { salvarEspecialista } from '@/lib/especialistas/acoes'
import { ESTADO_INICIAL_SALVAR_ESPECIALISTA } from '@/lib/especialistas/estados'
import { STATUS_ESPECIALISTA } from '@/lib/especialistas/regras'
import type { DadosEspecialista } from '@/lib/especialistas/validacao'
import { UFS } from '@/lib/ufs'
import { enderecoDosEspecialistas, useEnderecoDosEspecialistas } from './voltar-para-especialistas'

/**
 * Cadastro e edição do especialista (parte 5, 5.5; F11, DF-27), só do Administrador. A origem é só leitura: o cadastro
 * interno nasce "Cadastro interno", e a candidatura do site mantém "Site". O cadastro interno nasce Em análise ou
 * Ativo (6.1). Quem confere tudo é o servidor; com `noValidate`, valem as mensagens da plataforma.
 */
export function FormularioEspecialista({
  especialista,
  especialidades,
}: {
  especialista: EspecialistaDetalhado | null
  especialidades: string[]
}) {
  // A especialidade que saiu da lista continua como opção, para o campo não parecer vazio (revisão do código).
  const opcoesDeEspecialidade =
    especialista && especialista.especialidade && !especialidades.includes(especialista.especialidade)
      ? [...especialidades, especialista.especialidade]
      : especialidades
  const router = useRouter()
  const [estado, enviar, enviando] = useActionState(salvarEspecialista, ESTADO_INICIAL_SALVAR_ESPECIALISTA)
  const [especialidade, setEspecialidade] = useState(especialista?.especialidade ?? '')
  const [uf, setUf] = useState(especialista?.uf ?? '')
  const [status, setStatus] = useState<string>(especialista?.status ?? 'Em análise')
  const [nascimento, setNascimento] = useState<string | null>(especialista?.dataNascimento ?? null)

  useEffect(() => {
    if (!estado.sucesso) return
    avisarSalvo(estado.sucesso.mensagem)
    // Volta para a lista com os filtros que estavam aplicados (CA-16.2, revisão do código).
    router.push(estado.sucesso.destino === '/especialistas' ? enderecoDosEspecialistas() : estado.sucesso.destino)
  }, [estado, router])

  // Depois de um erro, o React limpa o formulário: o valor padrão devolve o que foi digitado.
  const inicial = (campo: keyof DadosEspecialista, doCadastro?: string) => estado.valores?.[campo] ?? doCadastro ?? ''
  const erros = estado.erros
  const enderecoDaLista = useEnderecoDosEspecialistas()
  const destino = especialista ? `/especialistas/${especialista.id}` : enderecoDaLista
  const statusPossiveis = especialista ? STATUS_ESPECIALISTA : STATUS_ESPECIALISTA.filter((s) => s !== 'Inativo')

  return (
    <form action={enviar} noValidate className="space-y-5">
      {especialista ? <input type="hidden" name="id" value={especialista.id} /> : null}
      {estado.erroGeral ? (
        <Alert variant="destructive">
          <AlertDescription>{estado.erroGeral}</AlertDescription>
        </Alert>
      ) : null}

      <Painel titulo="Especialista">
        <div className="space-y-4">
          <Campo rotulo="Nome" obrigatorio erro={erros.nome}>
            {(p) => <Input {...p} name="nome" defaultValue={inicial('nome', especialista?.nome)} />}
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Especialidade" obrigatorio erro={erros.especialidade}>
              {(p) => (
                <SelecaoDoFormulario
                  nome="especialidade"
                  valor={especialidade}
                  aoMudar={setEspecialidade}
                  opcoes={opcoesDeEspecialidade}
                  atributos={p}
                />
              )}
            </Campo>
            <Campo rotulo="Subespecialidade">
              {(p) => (
                <Input {...p} name="subespecialidade" defaultValue={inicial('subespecialidade', especialista?.subespecialidade)} />
              )}
            </Campo>
          </div>
          <Campo rotulo="Data de nascimento" erro={erros.dataNascimento}>
            {(p) => (
              <>
                <CampoData {...p} valor={nascimento} onChange={setNascimento} />
                <input type="hidden" name="dataNascimento" value={nascimento ?? ''} />
              </>
            )}
          </Campo>
          {especialista ? (
            <Campo rotulo="Origem" grupo>
              {() => <ValorFixo>{especialista.origem}</ValorFixo>}
            </Campo>
          ) : null}
          <Campo rotulo="Status" obrigatorio erro={erros.status}>
            {(p) => (
              <SelecaoDoFormulario
                nome="status"
                valor={status}
                aoMudar={setStatus}
                opcoes={statusPossiveis}
                atributos={p}
                className="w-full sm:w-52"
              />
            )}
          </Campo>
        </div>
      </Painel>

      <Painel titulo="Contato">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="E-mail" obrigatorio erro={erros.email}>
              {(p) => <Input {...p} type="email" name="email" defaultValue={inicial('email', especialista?.email)} />}
            </Campo>
            <Campo rotulo="Telefone" obrigatorio erro={erros.telefone}>
              {(p) => <Input {...p} name="telefone" defaultValue={inicial('telefone', especialista?.telefone)} />}
            </Campo>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Campo rotulo="Cidade">
                {(p) => <Input {...p} name="cidade" defaultValue={inicial('cidade', especialista?.cidade)} />}
              </Campo>
            </div>
            <Campo rotulo="UF" erro={erros.uf}>
              {(p) => (
                <SelecaoDoFormulario
                  nome="uf"
                  valor={uf}
                  aoMudar={setUf}
                  opcoes={UFS}
                  rotuloVazio="Sem UF"
                  placeholder="UF"
                  atributos={p}
                />
              )}
            </Campo>
          </div>
          <Campo rotulo="Empresa">
            {(p) => <Input {...p} name="empresa" defaultValue={inicial('empresa', especialista?.empresa)} />}
          </Campo>
          <Campo rotulo="Link do currículo ou LinkedIn" erro={erros.curriculo} ajuda="Só o link: o currículo não é enviado como arquivo">
            {(p) => <Input {...p} name="curriculo" defaultValue={inicial('curriculo', especialista?.curriculo)} />}
          </Campo>
        </div>
      </Painel>

      <Painel titulo="Observações internas">
        <Campo rotulo="Observações" ajuda="Uso interno da equipe da ELO">
          {(p) => <Textarea {...p} name="observacoes" defaultValue={inicial('observacoes', especialista?.observacoes)} />}
        </Campo>
      </Painel>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" carregando={enviando}>
          Salvar
        </Button>
        <Link href={destino} className={buttonVariants({ variant: 'outline' })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
