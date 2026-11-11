import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Num } from "@/components/elo/num";

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
