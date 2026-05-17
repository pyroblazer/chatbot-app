import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Chatbot - LangChain + Groq',
  description:
    'Intelligent chatbot with NLP: intent classification, sentiment analysis, NER, and RAG.',
  openGraph: {
    title: 'AI Chatbot',
    description: 'Powered by LangChain, Groq, and Next.js',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
