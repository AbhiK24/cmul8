import type { Metadata } from "next"
import { Syne, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
})

export const metadata: Metadata = {
  title: "CMUL8 - NZTA Road Policy",
  description: "AI simulation platform for policy analysis",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="h-full bg-[#09090b] text-[#fafafa] antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
