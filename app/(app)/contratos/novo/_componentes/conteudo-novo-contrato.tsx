import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { nomeDoCliente } from '@/lib/clientes/filtros'
import { listarClientes } from '@/lib/dados/clientes'
import { listarContratantes, listarServicos } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { FormularioContrato } from '../../_componentes/formulario-contrato'

type Busca = Record<string, string | string[] | undefined>

const primeiro = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor)

/**
 * Novo contrato ou proposta (parte 3, 5.5), só do Administrador. Com `?cliente=`, vindo da página do cliente, o
 * cliente já vem escolhido e a volta leva a ele. Cliente Inativo e o cadastro da ELO não recebem contrato.
 */
export async function ConteudoNovoContrato({ searchParams }: { searchParams: Promise<Busca> }) {
  const [usuario, busca] = await Promise.all([obterUsuarioAtual(), searchParams])

  if (!ehAdmin(usuario)) {
    return (
      <>
        <div className="mb-3">
          <LinkVoltar href="/contratos" rotulo="Contratos" />
        </div>
        <CabecalhoPagina titulo="Novo contrato" />
        <AcessoNegado />
      </>
    )
  }

  const clientes = (await listarClientes()).filter((c) => c.status !== 'Inativo' && !c.ehCadastroElo)
  const doEndereco = clientes.find((c) => c.id === primeiro(busca.cliente)) ?? null
  const [contratantes, servicos, responsaveis] = await Promise.all([
    listarContratantes(),
    listarServicos(),
    Promise.all(
      clientes.map(async (c) => [c.id, (await listarResponsaveis(c.id)).map((u) => ({ valor: u.id, rotulo: u.nome }))] as const),
    ),
  ])
  const opcoes = clientes
    .map((c) => ({ valor: c.id, rotulo: nomeDoCliente(c) }))
    .sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'))

  return (
    <>
      <div className="mb-3">
        {doEndereco ? (
          <LinkVoltar href={`/clientes/${doEndereco.id}?aba=contratos`} rotulo={nomeDoCliente(doEndereco)} />
        ) : (
          <LinkVoltar href="/contratos" rotulo="Contratos" />
        )}
      </div>
      <CabecalhoPagina titulo="Novo contrato" />
      <FormularioContrato
        contrato={null}
        clienteInicial={doEndereco?.id ?? null}
        clientes={opcoes}
        responsaveisPorCliente={Object.fromEntries(responsaveis)}
        contratantes={contratantes}
        servicos={servicos}
      />
    </>
  )
}
