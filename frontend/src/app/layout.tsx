import './globals.css'
import { Inter } from 'next/font/google'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Autoblogger AI | Pro Content Engine',
  description: 'Scale your content strategy with AI-driven automation.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className={`${inter.className} h-full text-slate-900`}>
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-slate-50/50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
