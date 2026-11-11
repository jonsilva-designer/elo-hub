import { describe, expect, it } from "vitest";
import {
  VAZIO,
  formatarData,
  formatarDataCurta,
  formatarNumero,
  formatarPercentual,
  formatarReal,
} from "@/lib/formato";

describe("formatarData", () => {
  it("data de calendário não muda de dia", () => {
    expect(formatarData("2026-11-09")).toBe("09/11/2026");
  });
  it("Date é mostrada no horário de Brasília", () => {
    expect(formatarData(new Date("2026-11-12T01:30:00Z"))).toBe("11/11/2026");
  });
  it("instante com hora é mostrado no horário de Brasília", () => {
    expect(formatarData("2026-11-12T01:30:00Z")).toBe("11/11/2026");
  });
  it("null e undefined viram VAZIO", () => {
    expect(formatarData(null)).toBe("—");
    expect(formatarData(undefined)).toBe(VAZIO);
  });
  it("data inválida vira VAZIO", () => {
    expect(formatarData("abc")).toBe(VAZIO);
  });
});

describe("formatarDataCurta", () => {
  it("data de calendário", () => {
    expect(formatarDataCurta("2026-11-09")).toBe("09/11");
  });
  it("instante em Brasília", () => {
    expect(formatarDataCurta("2026-11-12T01:30:00Z")).toBe("11/11");
  });
  it("null vira VAZIO", () => {
    expect(formatarDataCurta(null)).toBe(VAZIO);
  });
});

describe("formatarReal", () => {
  it("positivo", () => {
    expect(formatarReal(48500)).toBe("R$\u00a048.500,00");
  });
  it("zero nunca é vazio", () => {
    expect(formatarReal(0)).toBe("R$\u00a00,00");
  });
  it("negativo", () => {
    expect(formatarReal(-1200.5)).toBe("-R$\u00a01.200,50");
  });
  it("undefined e null viram VAZIO", () => {
    expect(formatarReal(undefined)).toBe("—");
    expect(formatarReal(null)).toBe(VAZIO);
  });
});

describe("formatarNumero", () => {
  it("milhar", () => {
    expect(formatarNumero(1234)).toBe("1.234");
  });
  it("zero", () => {
    expect(formatarNumero(0)).toBe("0");
  });
  it("null vira VAZIO", () => {
    expect(formatarNumero(null)).toBe(VAZIO);
  });
});

describe("formatarPercentual", () => {
  it("fração com uma casa", () => {
    expect(formatarPercentual(0.105)).toBe("10,5%");
  });
  it("zero", () => {
    expect(formatarPercentual(0)).toBe("0%");
  });
  it("null vira VAZIO", () => {
    expect(formatarPercentual(null)).toBe(VAZIO);
  });
});

describe("entradas de borda", () => {
  it("não finitos viram VAZIO", () => {
    expect(formatarNumero(NaN)).toBe(VAZIO);
    expect(formatarReal(Infinity)).toBe(VAZIO);
    expect(formatarReal(-Infinity)).toBe(VAZIO);
    expect(formatarPercentual(0 / 0)).toBe(VAZIO);
  });
  it("zero negativo vira zero", () => {
    expect(formatarReal(-0)).toBe("R$ 0,00");
    expect(formatarNumero(-0)).toBe("0");
    expect(formatarPercentual(-0)).toBe("0%");
  });
  it("data de calendário impossível vira VAZIO", () => {
    expect(formatarData("2026-13-45")).toBe(VAZIO);
    expect(formatarData("2026-02-30")).toBe(VAZIO);
    expect(formatarData("2028-02-29")).toBe("29/02/2028");
  });
  it("data e hora sem fuso é horário de Brasília, sem depender da máquina", () => {
    expect(formatarData("2026-11-09T01:00:00")).toBe("09/11/2026");
    expect(formatarDataCurta("2026-11-09T23:59")).toBe("09/11");
    expect(formatarData("2026-11-09T01:00:00.123")).toBe("09/11/2026");
    expect(formatarData("2026-13-45T01:00:00")).toBe(VAZIO);
    expect(formatarData("2026-11-12T01:30:00Z")).toBe("11/11/2026");
    expect(formatarData("2026-11-12T01:30:00-03:00")).toBe("12/11/2026");
  });
});
