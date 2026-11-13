'use client'

import { useState, type ReactNode } from 'react'
import { Campo, type AtributosDeCampo } from '@/components/elo/campo'
import { CampoArquivo } from '@/components/elo/campo-arquivo'
import { CampoData } from '@/components/elo/campo-data'
import { CampoValor } from '@/components/elo/campo-valor'
import { EntradaSenha } from '@/components/elo/entrada-senha'
import { SelecaoMultipla } from '@/components/elo/selecao-multipla'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Exemplo, Subsecao } from './secao'

const RESPONSAVEIS = [
  { valor: 'ana', rotulo: 'Ana Ribeiro' },
  { valor: 'bruno', rotulo: 'Bruno Tavares' },
  { valor: 'carla', rotulo: 'Carla Mendes' },
]

const SEGMENTOS = ['Agronegócio', 'Transporte e logística', 'Comércio', 'Serviços']

const PORTES = [
  ['pequeno', 'Pequeno'],
  ['medio', 'Médio'],
  ['grande', 'Grande'],
]

/** Estados de um controle lado a lado: uma célula por estado, cada uma com a sua legenda. */
function Estados({ children }: { children: ReactNode }) {
  return <div className="grid w-full gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
}

function Celula({ legenda, children }: { legenda: string; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="text-xs text-muted-foreground">{legenda}</div>
      {children}
    </div>
  )
}

function SelecaoSimples({
  id,
  disabled,
  invalido,
  descritoPor,
}: {
  id: string
  disabled?: boolean
  invalido?: true
  descritoPor?: string
}) {
  // Controlado desde o início: '' mostra o texto de apoio.
  const [segmento, setSegmento] = useState('')
  return (
    <Select value={segmento} onValueChange={setSegmento} disabled={disabled}>
      <SelectTrigger id={id} className="w-full" aria-invalid={invalido} aria-describedby={descritoPor}>
        <SelectValue placeholder="Selecione" />
      </SelectTrigger>
      <SelectContent>
        {SEGMENTOS.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Opção única dentro de um `Campo grupo`: recebe os atributos do Campo (nome pela legenda, ajuda e erro). */
function Portes({
  id,
  valor,
  onChange,
  disabled,
  ...atributos
}: AtributosDeCampo & {
  valor: string
  onChange?: (v: string) => void
  disabled?: boolean
}) {
  return (
    <RadioGroup id={id} {...atributos} value={valor} onValueChange={onChange} disabled={disabled}>
      {PORTES.map(([v, r]) => (
        <div key={v} className="flex items-center gap-2">
          <RadioGroupItem id={`${id}-${v}`} value={v} />
          <Label htmlFor={`${id}-${v}`} className="font-normal">
            {r}
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}

export function Formulario() {
  const [responsaveis, setResponsaveis] = useState<string[]>(['bruno'])
  const [vazios, setVazios] = useState<string[]>([])
  const [inicio, setInicio] = useState<string | null>('2026-11-09')
  const [prazo, setPrazo] = useState<string | null>(null)
  const [valor, setValor] = useState<number | null>(48500)
  const [valorVazio, setValorVazio] = useState<number | null>(null)
  const [confirmado, setConfirmado] = useState(true)
  const [porte, setPorte] = useState('medio')
  const [, setArquivo] = useState<File | null>(null)

  return (
    <Subsecao titulo="Formulário">
      <Exemplo rotulo="Campo de texto">
        <Estados>
          <Celula legenda="Normal">
            <Campo rotulo="Nome do cliente">
              {(p) => <Input {...p} defaultValue="Grupo Horizonte Agro" />}
            </Campo>
          </Celula>
          <Celula legenda="Com ajuda">
            <Campo rotulo="Nome do cliente" ajuda="Como aparece nos relatórios">
              {(p) => <Input {...p} placeholder="Ex.: Transportes Serra Azul" />}
            </Campo>
          </Celula>
          <Celula legenda="Com erro">
            <Campo rotulo="Nome do cliente" erro="Informe o nome do cliente">
              {(p) => <Input {...p} />}
            </Campo>
          </Celula>
          <Celula legenda="Desabilitado">
            <Campo rotulo="Nome do cliente">
              {(p) => <Input {...p} defaultValue="Transportes Serra Azul" disabled />}
            </Campo>
          </Celula>
          <Celula legenda="Obrigatório">
            <Campo rotulo="Nome do cliente" obrigatorio>
              {(p) => <Input {...p} required />}
            </Campo>
          </Celula>
          <Celula legenda="Rótulo com ajuda e erro">
            <Campo
              rotulo="Responsável pelo contrato"
              obrigatorio
              ajuda="Quem assina pela Transportes Serra Azul"
              erro="Informe o responsável"
            >
              {(p) => <Input {...p} />}
            </Campo>
          </Celula>
        </Estados>
      </Exemplo>

      <Exemplo rotulo="Campo de senha">
        <Estados>
          <Celula legenda="Normal">
            <Campo rotulo="Senha">{(p) => <EntradaSenha {...p} defaultValue="senha-de-exemplo" />}</Campo>
          </Celula>
          <Celula legenda="Com erro">
            <Campo rotulo="Senha" erro="Informe a senha.">
              {(p) => <EntradaSenha {...p} />}
            </Campo>
          </Celula>
        </Estados>
      </Exemplo>

      <Exemplo rotulo="Área de texto">
        <Estados>
          <Celula legenda="Normal">
            <Campo rotulo="Observações" ajuda="Visível só para a equipe">
              {(p) => <Textarea {...p} defaultValue="Cliente prefere contato pela manhã." />}
            </Campo>
          </Celula>
          <Celula legenda="Com erro">
            <Campo rotulo="Observações" erro="Escreva ao menos uma linha">
              {(p) => <Textarea {...p} />}
            </Campo>
          </Celula>
          <Celula legenda="Desabilitado">
            <Campo rotulo="Observações">
              {(p) => <Textarea {...p} defaultValue="Sem observações." disabled />}
            </Campo>
          </Celula>
        </Estados>
      </Exemplo>

      <Exemplo rotulo="Seleção">
        <Estados>
          <Celula legenda="Normal">
            <Campo rotulo="Segmento">
              {(p) => <SelecaoSimples id={p.id} descritoPor={p['aria-describedby']} />}
            </Campo>
          </Celula>
          <Celula legenda="Com erro">
            <Campo rotulo="Segmento" erro="Escolha um segmento">
              {(p) => (
                <SelecaoSimples id={p.id} invalido={p['aria-invalid']} descritoPor={p['aria-describedby']} />
              )}
            </Campo>
          </Celula>
          <Celula legenda="Desabilitado">
            <Campo rotulo="Segmento">{(p) => <SelecaoSimples id={p.id} disabled />}</Campo>
          </Celula>
        </Estados>
      </Exemplo>

      <Exemplo rotulo="Seleção múltipla com busca">
        <Estados>
          <Celula legenda="Normal">
            <Campo rotulo="Responsáveis" ajuda="Digite para buscar">
              {(p) => (
                <SelecaoMultipla {...p} opcoes={RESPONSAVEIS} valores={responsaveis} onChange={setResponsaveis} />
              )}
            </Campo>
          </Celula>
          <Celula legenda="Com erro">
            <Campo rotulo="Responsáveis" erro="Escolha ao menos um responsável">
              {(p) => <SelecaoMultipla {...p} opcoes={RESPONSAVEIS} valores={vazios} onChange={setVazios} />}
            </Campo>
          </Celula>
          <Celula legenda="Desabilitado">
            <Campo rotulo="Responsáveis">
              {(p) => (
                <SelecaoMultipla {...p} opcoes={RESPONSAVEIS} valores={['ana']} onChange={() => {}} disabled />
              )}
            </Campo>
          </Celula>
        </Estados>
      </Exemplo>

      <Exemplo rotulo="Data">
        <Estados>
          <Celula legenda="Normal">
            <Campo rotulo="Início do contrato" ajuda="Digite ou abra o calendário">
              {(p) => <CampoData {...p} valor={inicio} onChange={setInicio} />}
            </Campo>
          </Celula>
          <Celula legenda="Com erro">
            <Campo rotulo="Prazo de entrega" erro="Informe uma data válida">
              {(p) => <CampoData {...p} valor={prazo} onChange={setPrazo} />}
            </Campo>
          </Celula>
          <Celula legenda="Desabilitado">
            <Campo rotulo="Início do contrato">
              {(p) => <CampoData {...p} valor="2026-11-09" onChange={() => {}} disabled />}
            </Campo>
          </Celula>
        </Estados>
      </Exemplo>

      <Exemplo rotulo="Valor em reais">
        <Estados>
          <Celula legenda="Normal">
            <Campo rotulo="Valor do contrato">
              {(p) => <CampoValor {...p} valor={valor} onChange={setValor} />}
            </Campo>
          </Celula>
          <Celula legenda="Com erro">
            <Campo rotulo="Valor do contrato" erro="Informe o valor">
              {(p) => <CampoValor {...p} valor={valorVazio} onChange={setValorVazio} />}
            </Campo>
          </Celula>
          <Celula legenda="Desabilitado">
            <Campo rotulo="Valor do contrato">
              {(p) => <CampoValor {...p} valor={12000} onChange={() => {}} disabled />}
            </Campo>
          </Celula>
        </Estados>
      </Exemplo>

      <Exemplo rotulo="Caixa de seleção">
        <Estados>
          <Celula legenda="Normal">
            <Campo rotulo="Revisei os dados do cliente" horizontal>
              {(p) => <Checkbox {...p} checked={confirmado} onCheckedChange={(c) => setConfirmado(c === true)} />}
            </Campo>
          </Celula>
          <Celula legenda="Com erro">
            <Campo rotulo="Aceito os termos do contrato" horizontal erro="Aceite os termos para continuar">
              {(p) => <Checkbox {...p} />}
            </Campo>
          </Celula>
          <Celula legenda="Desabilitado">
            <Campo rotulo="Revisei os dados do cliente" horizontal>
              {(p) => <Checkbox {...p} disabled />}
            </Campo>
          </Celula>
        </Estados>
      </Exemplo>

      <Exemplo rotulo="Opção única">
        <Estados>
          <Celula legenda="Normal">
            <Campo rotulo="Porte da empresa" grupo>
              {(p) => <Portes {...p} valor={porte} onChange={setPorte} />}
            </Campo>
          </Celula>
          <Celula legenda="Com erro">
            <Campo rotulo="Porte da empresa" grupo erro="Escolha o porte">
              {(p) => <Portes {...p} valor="" />}
            </Campo>
          </Celula>
          <Celula legenda="Desabilitado">
            <Campo rotulo="Porte da empresa" grupo>
              {(p) => <Portes {...p} valor="medio" disabled />}
            </Campo>
          </Celula>
        </Estados>
      </Exemplo>

      <Exemplo rotulo="Envio de arquivo">
        <Estados>
          <Celula legenda="Normal">
            <Campo rotulo="Contrato assinado" ajuda="Somente PDF">
              {(p) => <CampoArquivo {...p} aceitar=".pdf" onChange={setArquivo} />}
            </Campo>
          </Celula>
          <Celula legenda="Com erro">
            <Campo rotulo="Contrato assinado" erro="Anexe o contrato">
              {(p) => <CampoArquivo {...p} aceitar=".pdf" onChange={setArquivo} />}
            </Campo>
          </Celula>
          <Celula legenda="Desabilitado">
            <Campo rotulo="Contrato assinado">
              {(p) => <CampoArquivo {...p} onChange={setArquivo} disabled />}
            </Campo>
          </Celula>
        </Estados>
      </Exemplo>
    </Subsecao>
  )
}
