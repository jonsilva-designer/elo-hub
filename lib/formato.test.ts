import { describe, expect, it } from "vitest";
import {
  VAZIO,
  dataExiste,
  escreverValorEmReais,
  formatarData,
  formatarDataCurta,
  formatarNumero,
  formatarPercentual,
  formatarReal,
  formatarTamanho,
  lerValorEmReais,
  formatarDataHora,
  hojeEmBrasilia,
  somarDias,
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

describe("lerValorEmReais", () => {
  it("formato brasileiro, com milhar e vírgula", () => {
    expect(lerValorEmReais("1.234,56")).toBe(1234.56);
    expect(lerValorEmReais("1.234,5")).toBe(1234.5);
    expect(lerValorEmReais("48500")).toBe(48500);
  });
  it("arredonda para centavos, e o número é o mesmo que o campo mostra", () => {
    expect(lerValorEmReais("12,345")).toBe(12.35);
    expect(escreverValorEmReais(lerValorEmReais("12,345"))).toBe("12,35");
    expect(lerValorEmReais("12,344")).toBe(12.34);
    expect(lerValorEmReais("0,005")).toBe(0.01);
  });
  it("um só ponto seguido de uma ou duas casas, sem vírgula, é a vírgula decimal", () => {
    expect(lerValorEmReais("1234.56")).toBe(1234.56);
    expect(lerValorEmReais("1234.5")).toBe(1234.5);
  });
  it("ponto seguido de três algarismos é separador de milhar", () => {
    expect(lerValorEmReais("1.234")).toBe(1234);
    expect(lerValorEmReais("1.234.567")).toBe(1234567);
  });
  it("vazio, só pontuação, letras, sinal ou duas vírgulas viram null", () => {
    expect(lerValorEmReais("")).toBeNull();
    expect(lerValorEmReais("  ")).toBeNull();
    expect(lerValorEmReais("...")).toBeNull();
    expect(lerValorEmReais("abc")).toBeNull();
    expect(lerValorEmReais("-5")).toBeNull();
    expect(lerValorEmReais("1,2,3")).toBeNull();
  });
});

describe("escreverValorEmReais", () => {
  it("duas casas, milhar e sem o símbolo", () => {
    expect(escreverValorEmReais(48500)).toBe("48.500,00");
    expect(escreverValorEmReais(0)).toBe("0,00");
    expect(escreverValorEmReais(-0)).toBe("0,00");
  });
  it("sem valor fica vazio, para o campo", () => {
    expect(escreverValorEmReais(null)).toBe("");
    expect(escreverValorEmReais(undefined)).toBe("");
    expect(escreverValorEmReais(NaN)).toBe("");
  });
});

describe("dataExiste", () => {
  it("dias que existem", () => {
    expect(dataExiste(2026, 11, 9)).toBe(true);
    expect(dataExiste(2028, 2, 29)).toBe(true);
    expect(dataExiste(2026, 12, 31)).toBe(true);
  });
  it("dias e meses que não existem", () => {
    expect(dataExiste(2026, 2, 29)).toBe(false);
    expect(dataExiste(2026, 2, 30)).toBe(false);
    expect(dataExiste(2026, 4, 31)).toBe(false);
    expect(dataExiste(2026, 13, 1)).toBe(false);
    expect(dataExiste(2026, 0, 10)).toBe(false);
    expect(dataExiste(2026, 1, 0)).toBe(false);
  });
  it("anos abaixo de 100 não viram 19xx", () => {
    expect(dataExiste(50, 1, 1)).toBe(true);
    expect(formatarData("0050-01-01")).toBe("01/01/0050");
  });
});

describe('formatarDataHora', () => {
  it('mostra data e hora no horário de Brasília', () => {
    expect(formatarDataHora('2026-09-20T14:32:00-03:00')).toBe('20/09/2026 14:32')
  })

  it('converte de outro fuso para Brasília, inclusive na virada do dia', () => {
    expect(formatarDataHora('2026-11-14T01:30:00Z')).toBe('13/11/2026 22:30')
  })

  it('data com hora e sem fuso já é de Brasília', () => {
    expect(formatarDataHora('2026-03-12T16:40')).toBe('12/03/2026 16:40')
  })

  it('vazio ou inválido vira o traço', () => {
    expect(formatarDataHora('')).toBe('—')
    expect(formatarDataHora(null)).toBe('—')
    expect(formatarDataHora('ontem')).toBe('—')
    expect(formatarDataHora('2026-02-31T10:00')).toBe('—')
  })
})

describe('hojeEmBrasilia (RN-20)', () => {
  it('dá a data de Brasília, mesmo com o servidor em UTC (ponto de atenção 1)', () => {
    expect(hojeEmBrasilia(new Date('2026-11-14T01:30:00Z'))).toBe('2026-11-13')
    expect(hojeEmBrasilia(new Date('2026-11-14T03:00:00Z'))).toBe('2026-11-14')
  })
})

describe('somarDias', () => {
  it('soma dias de calendário, atravessando mês e ano', () => {
    expect(somarDias('2026-11-14', 20)).toBe('2026-12-04')
    expect(somarDias('2026-12-25', 10)).toBe('2027-01-04')
    expect(somarDias('2027-03-01', -1)).toBe('2027-02-28')
  })
})

describe("formatarTamanho", () => {
  it("bytes, KB inteiros e MB com uma casa, no formato brasileiro (F12)", () => {
    expect(formatarTamanho(800)).toBe("800 bytes");
    expect(formatarTamanho(1)).toBe("1 byte");
    expect(formatarTamanho(350 * 1024)).toBe("350 KB");
    expect(formatarTamanho(Math.round(2.4 * 1024 * 1024))).toBe("2,4 MB");
    expect(formatarTamanho(10 * 1024 * 1024)).toBe("10 MB");
  });
});
