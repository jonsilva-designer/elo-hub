export const VAZIO = "—";

const FUSO = "America/Sao_Paulo";
// AAAA-MM-DD, com ou sem hora, mas sem sufixo de fuso (Z ou ±HH:MM).
const DATA_SEM_FUSO = /^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)?$/;

const dataCompleta = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const dataCurta = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
});
const dataHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const real = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const duasCasas = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const numero = new Intl.NumberFormat("pt-BR");
const percentual = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 1,
});

type EntradaData = string | Date | null | undefined;

type Partes = { ano: string; mes: string; dia: string };

/**
 * true se o dia existe no calendário (mês de 1 a 12): 30/02, 31/04 e 29/02 de ano não bissexto não existem.
 * Único validador de data de calendário: serve à formatação daqui e ao campo de data.
 */
export function dataExiste(ano: number, mes: number, dia: number): boolean {
  const d = new Date(0);
  d.setUTCFullYear(ano, mes - 1, dia); // ao contrário de Date.UTC, anos abaixo de 100 não viram 19xx
  return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

// Extrai e valida a data de calendário de um texto sem fuso. null se não casar.
function partesSemFuso(texto: string): Partes | "invalida" | null {
  const m = DATA_SEM_FUSO.exec(texto);
  if (!m) return null;
  const [, ano, mes, dia] = m;
  return dataExiste(Number(ano), Number(mes), Number(dia)) ? { ano, mes, dia } : "invalida";
}

function formatarComIntl(
  valor: EntradaData,
  intl: Intl.DateTimeFormat,
  doCalendario: (p: Partes) => string,
): string {
  if (valor === null || valor === undefined) return VAZIO;
  if (typeof valor === "string") {
    // Sem fuso = horário de Brasília: usa as partes do texto, sem Date local.
    const partes = partesSemFuso(valor);
    if (partes === "invalida") return VAZIO;
    if (partes) return doCalendario(partes);
  }
  const data = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(data.getTime())) return VAZIO;
  return intl.format(data);
}

export function formatarData(valor: EntradaData): string {
  return formatarComIntl(valor, dataCompleta, ({ ano, mes, dia }) => `${dia}/${mes}/${ano}`);
}

// Data com hora e sem fuso (AAAA-MM-DDTHH:MM, segundos opcionais): já está no horário de Brasília.
const DATA_HORA_SEM_FUSO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/;

/** `20/09/2026 14:32`, no horário de Brasília. Vazio ou inválido vira o traço. Usada no histórico (F17). */
export function formatarDataHora(valor: EntradaData): string {
  if (valor === null || valor === undefined || valor === "") return VAZIO;
  if (typeof valor === "string") {
    const m = DATA_HORA_SEM_FUSO.exec(valor);
    if (m) {
      const [, ano, mes, dia, hora, minuto] = m;
      return dataExiste(Number(ano), Number(mes), Number(dia)) ? `${dia}/${mes}/${ano} ${hora}:${minuto}` : VAZIO;
    }
  }
  const data = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(data.getTime())) return VAZIO;
  const p = Object.fromEntries(dataHora.formatToParts(data).map((parte) => [parte.type, parte.value]));
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
}

export function formatarDataCurta(valor: EntradaData): string {
  return formatarComIntl(valor, dataCurta, ({ mes, dia }) => `${dia}/${mes}`);
}

function finito(valor: number | null | undefined): number | null {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) {
    return null;
  }
  return valor === 0 ? 0 : valor; // normaliza -0
}

export function formatarReal(valor: number | null | undefined): string {
  const n = finito(valor);
  return n === null ? VAZIO : real.format(n);
}

export function formatarNumero(valor: number | null | undefined): string {
  const n = finito(valor);
  return n === null ? VAZIO : numero.format(n);
}

export function formatarPercentual(fracao: number | null | undefined): string {
  const n = finito(fracao);
  return n === null ? VAZIO : percentual.format(n);
}

/**
 * Texto de valor em reais digitado no formato brasileiro ("1.234,56") como número, já em centavos:
 * o arredondamento (meio para cima) é o mesmo que o campo mostra, então valor e texto nunca divergem.
 * Sem vírgula, um só ponto seguido de uma ou duas casas é a vírgula decimal ("1234.56");
 * ponto seguido de três algarismos é milhar ("1.234"). Vazio ou inválido vira null.
 */
export function lerValorEmReais(texto: string): number | null {
  const limpo = texto.trim();
  if (!/^[\d.,]*\d[\d.,]*$/.test(limpo)) return null;
  const virgulas = (limpo.match(/,/g) ?? []).length;
  if (virgulas > 1) return null;
  let decimal: string;
  if (virgulas === 1) decimal = limpo.replace(/\./g, "").replace(",", ".");
  else if (/^\d*\.\d{1,2}$/.test(limpo)) decimal = limpo;
  else decimal = limpo.replace(/\./g, "");
  // Arredonda pelos algarismos do texto, e não pela conta em ponto flutuante (12,345 vira 12,35).
  const [inteiro, fracao = ""] = decimal.split(".");
  const casas = (fracao + "000").slice(0, 3);
  const centavos = Number(inteiro || "0") * 100 + Number(casas.slice(0, 2)) + (Number(casas[2]) >= 5 ? 1 : 0);
  return centavos / 100;
}

/** Valor como o campo de reais mostra: duas casas e milhar, sem o símbolo ("1.234,50"). Sem valor, texto vazio. */
export function escreverValorEmReais(valor: number | null | undefined): string {
  const n = finito(valor);
  return n === null ? "" : duasCasas.format(n);
}

const diaDeBrasilia = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** A data de hoje no horário de Brasília, `AAAA-MM-DD` (RN-20), qualquer que seja o fuso do servidor. */
export function hojeEmBrasilia(agora: Date): string {
  const p = Object.fromEntries(diaDeBrasilia.formatToParts(agora).map((parte) => [parte.type, parte.value]));
  return `${p.year}-${p.month}-${p.day}`;
}

/** A data `AAAA-MM-DD` mais `dias` dias de calendário (negativo volta). Sem Date local nem horário de verão. */
export function somarDias(data: string, dias: number): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia + dias)).toISOString().slice(0, 10);
}
