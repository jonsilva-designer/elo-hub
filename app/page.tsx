import { redirect } from 'next/navigation'

// O proxy já manda a raiz ao Início ou ao login, conforme o cookie. Isto é a reserva, se ele não rodar.
export default function Raiz() {
  redirect('/inicio')
}
