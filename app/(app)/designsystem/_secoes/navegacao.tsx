import { Plus } from 'lucide-react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { Num } from '@/components/elo/num'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Exemplo, Quadro, Subsecao } from './secao'

export function Navegacao() {
  return (
    <div id="navegacao" className="scroll-mt-6">
      <Subsecao titulo="Navegação">
        <Exemplo rotulo="Cabeçalho de página" largo>
          <Quadro data-demo className="pb-1 sm:pb-1">
            <CabecalhoPagina
              titulo="Contratos"
              contexto={
                <>
                  <Num>24</Num> vigentes · <Num>3</Num> próximos do vencimento
                </>
              }
              acoes={
                <Button>
                  <Plus aria-hidden="true" strokeWidth={1.6} />
                  Novo contrato
                </Button>
              }
            />
          </Quadro>
        </Exemplo>
        <Exemplo rotulo="Caminho de volta" nota="Fica acima do título da página.">
          <LinkVoltar href="#navegacao" rotulo="Clientes" />
        </Exemplo>
        <Exemplo rotulo="Abas" largo>
          <Tabs defaultValue="visao-geral">
            <TabsList>
              <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
              <TabsTrigger value="contratos">Contratos</TabsTrigger>
              <TabsTrigger value="escopos">Escopos</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
            </TabsList>
            <TabsContent value="visao-geral">Resumo do cliente, com os dados de contato e a situação atual.</TabsContent>
            <TabsContent value="contratos">Contratos do cliente, vigentes e encerrados.</TabsContent>
            <TabsContent value="escopos">Escopos em andamento e as atividades de cada um.</TabsContent>
            <TabsContent value="documentos">Arquivos anexados ao cliente, do mais recente ao mais antigo.</TabsContent>
          </Tabs>
        </Exemplo>
      </Subsecao>
    </div>
  )
}
