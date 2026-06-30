import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "🌸 Health Check-In | Your Wellness Bestie",
  description: "A cute & fun weekly health check-in form. Track meals, vitamins, sleep, energy, and more! 💕",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable}`}>
      <body className="min-h-screen" style={{ fontFamily: "var(--font-nunito), 'Segoe UI', Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
