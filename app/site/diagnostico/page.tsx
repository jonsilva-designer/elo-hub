import type { Metadata } from 'next'
import { MolduraPublica } from '@/components/elo/moldura-publica'
import { listarSegmentos } from '@/lib/dados/listas'
import { FormularioDiagnostico } from '../_componentes/formulario-diagnostico'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Solicitar diagnóstico | ELO HUB' }

/** A solicitação de diagnóstico (parte 9; F19, DF-76): página pública, sem login, que o site da ELO aponta (DA-02). */
export default async function PaginaDiagnostico() {
  const segmentos = await listarSegmentos()
  return (
    <MolduraPublica>
      <div className="mb-6 space-y-1">
        <h1 className="text-titulo-pagina font-semibold tracking-titulo text-primary">Solicitar diagnóstico</h1>
        <p className="text-sm text-muted-foreground">
          Conte um pouco sobre a sua empresa. A equipe da ELO entra em contato para combinar o diagnóstico.
        </p>
      </div>
      <FormularioDiagnostico segmentos={segmentos} />
    </MolduraPublica>
  )
}
