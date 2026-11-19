import type { Metadata } from 'next'
import { MolduraPublica } from '@/components/elo/moldura-publica'
import { listarEspecialidades } from '@/lib/dados/listas'
import { FormularioEspecialista } from '../_componentes/formulario-especialista'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Seja um especialista | ELO HUB' }

/** O cadastro de especialista (parte 9; F19, F11): página pública, sem login, que o site da ELO aponta (DA-02). */
export default async function PaginaEspecialista() {
  const especialidades = await listarEspecialidades()
  return (
    <MolduraPublica>
      <div className="mb-6 space-y-1">
        <h1 className="font-heading text-titulo-pagina font-semibold tracking-titulo text-primary">Seja um especialista</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre-se no banco de especialistas da ELO. O currículo vai por link, sem envio de arquivo.
        </p>
      </div>
      <FormularioEspecialista especialidades={especialidades} />
    </MolduraPublica>
  )
}
