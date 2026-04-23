import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BrevApp — Révisions Brevet 2026',
  description: 'Application de révision gamifiée pour le DNB 2026',
  manifest: '/manifest.json',
  themeColor: '#1C1917',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      </head>
      <body className="bg-brand-bg font-nunito">{children}</body>
    </html>
  )
}
