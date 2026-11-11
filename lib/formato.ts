export const VAZIO = "—";

const FUSO = "America/Sao_Paulo";
const DATA_CALENDARIO = /^(\d{4})-(\d{2})-(\d{2})$/;

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

function formatarComIntl(
  valor: EntradaData,
  intl: Intl.DateTimeFormat,
  doCalendario: (ano: string, mes: string, dia: string) => string,
): string {
  if (valor === null || valor === undefined) return VAZIO;
  if (typeof valor === "string") {
    // Data AAAA-MM-DD é data de calendário: não passa por Date nem muda de dia.
    const partes = DATA_CALENDARIO.exec(valor);
    if (partes) return doCalendario(partes[1], partes[2], partes[3]);
  }
  const data = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(data.getTime())) return VAZIO;
  return intl.format(data);
}

export function formatarData(valor: EntradaData): string {
  return formatarComIntl(valor, dataCompleta, (a, m, d) => `${d}/${m}/${a}`);
}

export function formatarDataCurta(valor: EntradaData): string {
  return formatarComIntl(valor, dataCurta, (_a, m, d) => `${d}/${m}`);
}

export function formatarReal(valor: number | null | undefined): string {
  return valor === null || valor === undefined ? VAZIO : real.format(valor);
}

export function formatarNumero(valor: number | null | undefined): string {
  return valor === null || valor === undefined ? VAZIO : numero.format(valor);
}

export function formatarPercentual(fracao: number | null | undefined): string {
  return fracao === null || fracao === undefined
    ? VAZIO
    : percentual.format(fracao);
}
