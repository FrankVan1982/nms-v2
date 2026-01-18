import React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata, Viewport } from 'next'
import { Hedvig_Letters_Serif } from 'next/font/google'
import localFont from "next/font/local"
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _hedvig = Hedvig_Letters_Serif({ 
  subsets: ["latin"],
  variable: '--font-hedvig'
})

const _stack = localFont({
  src: "@/fonts/StackSansText/StackSansText.woff2",
  variable: "--font-stack"
})

export const metadata: Metadata = {
  title: 'Nuova Misura Scale | Scale Artigianali su Misura',
  description: 'Cooperativa artigianale specializzata nella fabbricazione su misura di scale a giorno, scale a chiocciola in legno e metallo, ringhiere e balaustre. Dal 1984 a Corato, Puglia.',
  keywords: ['scale artigianali', 'scale su misura', 'scale a chiocciola', 'ringhiere', 'balaustre', 'Corato', 'Puglia'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#8B4513',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`font-stack antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
