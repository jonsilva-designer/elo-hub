import { Num } from '@/components/elo/num'
import { formatarData, formatarDataHora } from '@/lib/formato'

type Comentario = {
  id: string
  autor: string
  dataHora: string
  tipo: 'Comentário' | 'Contato com especialista'
  texto: string
  nomeEspecialista: string
  dataContato: string | null
}

/**
 * Os comentários da demanda (F09; parte 5, 5.13), do mais antigo para o mais recente, com o autor, a data e a hora.
 * O contato com especialista mostra o especialista e a data do contato (DF-30). Não há opção de apagar (CA-09.6).
 */
export function ListaComentarios({ comentarios }: { comentarios: Comentario[] }) {
  if (comentarios.length === 0) return <p className="text-secundario text-muted-foreground">Nenhum comentário.</p>
  return (
    <ol className="space-y-4">
      {comentarios.map((c) => (
        <li key={c.id} className="space-y-1">
          <p className="flex flex-wrap items-center gap-x-1.5 text-secundario text-muted-foreground">
            <span className="font-medium text-foreground">{c.autor}</span>
            <span aria-hidden="true">·</span>
            <Num>{formatarDataHora(c.dataHora)}</Num>
          </p>
          {c.tipo === 'Contato com especialista' ? (
            <p className="text-xs font-medium text-primary">
              Contato com especialista · {c.nomeEspecialista}
              {c.dataContato ? (
                <>
                  {' '}
                  · em <Num>{formatarData(c.dataContato)}</Num>
                </>
              ) : null}
            </p>
          ) : null}
          <p className="text-sm text-foreground">{c.texto}</p>
        </li>
      ))}
    </ol>
  )
}
