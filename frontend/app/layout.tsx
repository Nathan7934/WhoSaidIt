import './globals.css'
import 'animate.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Providers } from './providers';
import NavBar from './components/nav-bar/NavBar';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'WhoSaidIt',
    description: 'Quiz your friends and see who said it!',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className + " min-h-screen"} data-theme="dark">
                <Providers>
                    <NavBar />
                    {children}
                </Providers>
            </body>
        </html>
    )
}
