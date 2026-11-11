import { toast } from 'sonner'

/** Aviso rápido de confirmação, no canto inferior direito. */
export function avisarSalvo(mensagem = 'Salvo'): void {
  toast.success(mensagem)
}
