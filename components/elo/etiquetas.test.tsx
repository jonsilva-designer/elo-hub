import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  EtiquetaCriticidade,
  EtiquetaPlanejamento,
  EtiquetaStatus,
  IndicadorPrioridade,
} from "./etiquetas";

describe("EtiquetaStatus", () => {
  it("mostra o texto, o tom e não quebra linha", () => {
    render(<EtiquetaStatus status="Suspenso" />);
    const el = screen.getByText("Suspenso").closest("[data-tom]") as HTMLElement;
    expect(el).toHaveAttribute("data-tom", "suspenso");
    expect(el).toHaveClass("rounded-sm", "whitespace-nowrap");
  });

  it("ponto é aria-hidden e vazado no tom suspenso", () => {
    const { container } = render(<EtiquetaStatus status="Suspenso" />);
    const ponto = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(ponto).toBeInTheDocument();
    expect(ponto).toHaveAttribute("data-vazado", "true");
    expect(ponto).toHaveClass("border");
  });

  it("ponto é cheio nos outros tons", () => {
    const { container } = render(<EtiquetaStatus status="Ativo" />);
    const ponto = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(ponto).not.toHaveAttribute("data-vazado");
  });

  it("status desconhecido vira neutro", () => {
    render(<EtiquetaStatus status="Algo novo" />);
    expect(screen.getByText("Algo novo").closest("[data-tom]")).toHaveAttribute("data-tom", "neutro");
  });
});

describe("EtiquetaCriticidade", () => {
  it("mostra o texto e a criticidade", () => {
    render(<EtiquetaCriticidade criticidade="Crítica" />);
    const el = screen.getByText("Crítica");
    expect(el).toHaveAttribute("data-criticidade", "Crítica");
    expect(el).toHaveClass("rounded-sm", "whitespace-nowrap");
  });
});

describe("EtiquetaPlanejamento", () => {
  it("mostra Planejamento com contorno tracejado", () => {
    render(<EtiquetaPlanejamento />);
    const el = screen.getByText("Planejamento");
    expect(el).toHaveClass("border-dashed", "rounded-sm");
  });
});

describe("IndicadorPrioridade", () => {
  it.each([
    ["Baixa", 1],
    ["Média", 2],
    ["Alta", 3],
  ] as const)("%s tem %i barras preenchidas", (prioridade, cheias) => {
    render(<IndicadorPrioridade prioridade={prioridade} />);
    const el = screen.getByRole("img", { name: `Prioridade ${prioridade}` });
    expect(el).toHaveTextContent(prioridade);
    const barras = el.querySelectorAll('[aria-hidden="true"]');
    expect(barras).toHaveLength(3);
    expect(el.querySelectorAll('[data-preenchida="true"]')).toHaveLength(cheias);
  });
});
