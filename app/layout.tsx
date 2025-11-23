import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '100x AI Interviewer',
  description: 'AI-powered voice interview platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
