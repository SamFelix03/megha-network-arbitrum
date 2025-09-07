import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/providers/WalletProvider'
import { DeviceProvider } from '@/providers/DeviceProvider'
import { PaymentProvider } from '@/providers/PaymentProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Simple Chat UI',
  description: 'A simple chat interface built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <DeviceProvider>
            <PaymentProvider>
              {children}
            </PaymentProvider>
          </DeviceProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
