import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComNumeros, Num } from "@/components/elo/num";

describe("Num", () => {
  it("gera span com font-mono e tabular-nums", () => {
    render(<Num>24</Num>);
    const el = screen.getByText("24");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveClass("font-mono", "tabular-nums");
  });
  it("aceita className extra", () => {
    render(<Num className="text-lg">7</Num>);
    expect(screen.getByText("7")).toHaveClass("font-mono", "text-lg");
  });
});

describe("ComNumeros", () => {
  it("põe as datas e os códigos inteiros em fonte de número, e as palavras em volta não", () => {
    const { container } = render(
      <p>
        <ComNumeros texto="De CT-2025-031 para ELO-2026-0001 em 05/12/2026 (22) 2765-4310." />
      </p>,
    );
    expect(container.querySelector("p")).toHaveTextContent("De CT-2025-031 para ELO-2026-0001 em 05/12/2026 (22) 2765-4310.");
    const emMono = [...container.querySelectorAll(".font-mono")].map((n) => n.textContent);
    expect(emMono).toEqual(["CT-2025-031", "ELO-2026-0001", "05/12/2026", "22", "2765-4310"]);
  });

  it("texto sem número fica como está", () => {
    const { container } = render(<ComNumeros texto="De Ativo para Suspenso" />);
    expect(container.innerHTML).toBe("De Ativo para Suspenso");
  });
});
