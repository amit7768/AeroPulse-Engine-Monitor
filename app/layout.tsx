import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AeroPulse | Jet Engine Health Monitoring System",
  description:
    "Industrial-grade AI platform for predictive maintenance, RUL forecasting, and real-time jet engine health monitoring. Powered by advanced degradation detection algorithms.",
  keywords: [
    "jet engine health monitoring",
    "predictive maintenance AI",
    "RUL prediction",
    "turbofan degradation",
    "aerospace AI",
  ],
  openGraph: {
    title: "AeroPulse | Jet Engine Health Monitoring System",
    description: "Industrial AI for aerospace predictive maintenance",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)] antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
