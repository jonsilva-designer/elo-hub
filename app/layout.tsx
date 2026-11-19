import type { Metadata } from "next";
import "./globals.css";
import { JetBrains_Mono, Montserrat, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ModalidadeDeFoco } from "@/components/elo/modalidade-de-foco";

// Fontes do branding da ELO (18/11/2026): Montserrat nos textos e Playfair Display nos títulos. Os números
// continuam na JetBrains Mono (padrão visual 4.2).
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-titulo" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Plataforma ELO",
  description: "Base digital de operação da ELO HUB Governança Inteligente",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={cn("font-sans", montserrat.variable, playfair.variable, jetbrainsMono.variable)}>
      <body>
        {/* Marca no <html> se a última interação foi mouse ou teclado, para o contorno de foco (padrão 4.8). */}
        <ModalidadeDeFoco />
        <TooltipProvider>
          {children}
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
