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
const real = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const numero = new Intl.NumberFormat("pt-BR");
const percentual = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 1,
});

type EntradaData = string | Date | null | undefined;

type Partes = { ano: string; mes: string; dia: string };

// Extrai e valida a data de calendário de um texto sem fuso. null se não casar.
function partesSemFuso(texto: string): Partes | "invalida" | null {
  const m = DATA_SEM_FUSO.exec(texto);
  if (!m) return null;
  const [, ano, mes, dia] = m;
  const d = new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia)));
  const ok =
    d.getUTCFullYear() === Number(ano) &&
    d.getUTCMonth() === Number(mes) - 1 &&
    d.getUTCDate() === Number(dia);
  return ok ? { ano, mes, dia } : "invalida";
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
