import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { StackProvider, StackTheme } from "@stackframe/stack"
import { stackServerApp } from "@/lib/stack"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JUKUMU Fund - Empowering Communities Through Collective Investment',
  description: 'Join JUKUMU Fund to access group-based investment opportunities, business training, and community support for sustainable economic growth.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  )
}
