// A proteção dos formulários do site contra envio automatizado (CA-19.4; arquitetura 3.6, DA-03): o campo armadilha e o
// limite de envios por IP. O Turnstile entra na Etapa 3, com as chaves da conta da ELO. No protótipo, o limite fica em
// memória, por processo: na Etapa 3, num armazenamento que sobrevive entre as funções.

/** O nome do campo armadilha: escondido de quem enxerga e de leitores de tela; só um robô o preenche. */
// Um nome que o preenchimento automático do navegador não usa (site, url, website seriam preenchidos: revisão do código).
export const CAMPO_ARMADILHA = 'elo_verificacao'

export const LIMITE_DE_ENVIOS = 5

const JANELA_DO_LIMITE_EM_MS = 10 * 60 * 1000

export const MENSAGEM_LIMITE = 'Muitos envios em pouco tempo. Tente de novo em alguns minutos.'

/** O campo armadilha veio preenchido. */
export function ehRobo(formData: FormData): boolean {
  const valor = formData.get(CAMPO_ARMADILHA)
  return typeof valor === 'string' && valor.trim() !== ''
}

const envios = new Map<string, number[]>()

/** Conta o envio do IP e diz se ele ainda cabe no limite da janela. */
export function dentroDoLimite(ip: string, agora: number): boolean {
  // Sai do mapa o IP sem envio recente: o mapa não cresce sem fim (revisão do código).
  for (const [chave, tempos] of envios) if (tempos.every((t) => agora - t >= JANELA_DO_LIMITE_EM_MS)) envios.delete(chave)
  const recentes = (envios.get(ip) ?? []).filter((t) => agora - t < JANELA_DO_LIMITE_EM_MS)
  if (recentes.length >= LIMITE_DE_ENVIOS) {
    envios.set(ip, recentes)
    return false
  }
  envios.set(ip, [...recentes, agora])
  return true
}

/** Para os testes: começa de novo a contagem. */
export function reiniciarLimite(): void {
  envios.clear()
}
