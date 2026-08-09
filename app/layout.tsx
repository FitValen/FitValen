import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitValen",
  description: "Entrenamiento, nutrición y progreso en un solo lugar.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
