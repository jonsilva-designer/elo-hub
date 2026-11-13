import { Num } from '@/components/elo/num'
import { Button } from '@/components/ui/button'
import { entrarComoPerfil } from '@/lib/acesso/acoes'
import type { ExemplosDoPrototipo } from '@/lib/dados/tipos'
import { QuadroPrototipo } from '../../_componentes/quadro-prototipo'

/**
 * Botões do protótipo: um por perfil (decisão do Jonathan). Cada botão é o seu próprio formulário,
 * fora do formulário de e-mail e senha, e não depende dos campos. Sai inteiro na Etapa 3.
 */
export function EntradaPorPerfil({ destino, exemplos }: { destino: string; exemplos: ExemplosDoPrototipo }) {
  return (
    <QuadroPrototipo>
      <p className="text-[13px] text-muted-foreground">Entre sem senha com um perfil de exemplo.</p>
      <div className="space-y-3">
        <form action={entrarComoPerfil.bind(null, 'Administrador', destino)} className="space-y-1">
          <Button type="submit" variant="outline" className="w-full">
            Entrar como Administrador
          </Button>
          <p className="text-xs text-muted-foreground">{exemplos.administrador.nome}</p>
        </form>
        <form action={entrarComoPerfil.bind(null, 'Equipe', destino)} className="space-y-1">
          <Button type="submit" variant="outline" className="w-full">
            Entrar como Equipe
          </Button>
          <p className="text-xs text-muted-foreground">
            {exemplos.equipe.nome}, <Num>{exemplos.clientesDaEquipe}</Num> clientes vinculados
          </p>
        </form>
      </div>
      <p className="text-xs text-muted-foreground">Para ver o acesso negado, use {exemplos.emailInativo}.</p>
    </QuadroPrototipo>
  )
}
