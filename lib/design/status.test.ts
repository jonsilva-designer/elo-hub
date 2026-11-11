import { describe, expect, it } from "vitest";
import { tomDoStatus, type TomDeStatus } from "./status";

const tabela: Record<TomDeStatus, string[]> = {
  neutro: ["Prospect", "Proposta", "Planejado", "Não iniciada", "Nova", "Em análise", "Em elaboração", "Não aplicável", "Superado"],
  "em-curso": ["Em contratação", "Em andamento", "Em triagem", "Em atendimento", "Aberto"],
  atencao: ["Em espera", "Aguardando retorno", "Próximo do vencimento"],
  suspenso: ["Suspenso"],
  concluido: ["Ativo", "Vigente", "Concluído", "Concluída", "Resolvida"],
  problema: ["Vencido"],
  fechado: ["Inativo", "Encerrado", "Encerrada", "Cancelado", "Cancelada"],
};

describe("tomDoStatus", () => {
  for (const [tom, status] of Object.entries(tabela)) {
    for (const s of status) {
      it(`${s} -> ${tom}`, () => {
        expect(tomDoStatus(s)).toBe(tom);
      });
    }
  }

  it("ignora maiúsculas e espaços nas pontas", () => {
    expect(tomDoStatus(" concluída ")).toBe("concluido");
    expect(tomDoStatus("EM ANDAMENTO")).toBe("em-curso");
  });

  it("status desconhecido cai em neutro", () => {
    expect(tomDoStatus("Status novo")).toBe("neutro");
    expect(tomDoStatus("")).toBe("neutro");
  });
});
