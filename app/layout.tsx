import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], display: "swap", variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "Pulso Fit | Tu ritmo, tu progreso",
  description: "Entrenamiento flexible, bienestar y comunidad para avanzar a tu ritmo.",
  applicationName: "Pulso Fit",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFB81C",
};
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="es"><body className={poppins.variable}>{children}</body></html>;
}
